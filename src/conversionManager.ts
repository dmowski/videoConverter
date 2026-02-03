/**
 * Conversion Manager Module - Orchestrates the video conversion process
 */

import { VideoConverter } from "./converter";
import type { UIElements } from "./ui";
import {
  hideDownload,
  hideError,
  hideProgress,
  setConvertBtnState,
  setCancelEnabled,
  setProgressEta,
  setProgressPhase,
  showDownload,
  showError,
  showProgress,
  updateProgress,
} from "./ui";
import { downloadFile, getOutputFileName } from "./fileHandler";

export async function handleConvert(
  currentFile: File,
  converter: VideoConverter,
  elements: UIElements,
  onConversionComplete: (blob: Blob) => void,
): Promise<void> {
  if (!currentFile) {
    showError(elements, "Please select a video file first.");
    return;
  }

  // Hide error section
  hideError(elements);

  // Set button to loading state
  setConvertBtnState(elements, "loading");

  // Show progress section
  showProgress(elements);
  setCancelEnabled(elements, true);

  // Hide download section
  hideDownload(elements);

  // Reset progress
  updateProgress(elements, 0);
  setProgressPhase(elements, "Preparing conversion...");
  setProgressEta(elements, "Estimating time remaining...");

  const startTime = Date.now();

  try {
    await converter.convert(
      currentFile,
      // onProgress
      (progress) => {
        updateProgress(elements, progress.progress);
        updatePhaseAndEta(elements, progress.progress, startTime);
      },
      // onComplete
      (result) => {
        // Create blob from result
        const convertedBlob = new Blob([new Uint8Array(result.videoData)], {
          type: "video/webm",
        });

        // Hide progress, show download
        hideProgress(elements);
        showDownload(elements);

        // Re-enable convert button
        setConvertBtnState(elements, "idle");
        setCancelEnabled(elements, false);
        setProgressPhase(elements, "Conversion complete");
        setProgressEta(elements, "");

        // Notify completion
        onConversionComplete(convertedBlob);
      },
      // onError
      (error) => {
        showError(elements, `Conversion failed: ${error}`);
        hideProgress(elements);
        setConvertBtnState(elements, "idle");
        setCancelEnabled(elements, false);
        setProgressEta(elements, "");
      },
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    showError(elements, `Conversion failed: ${errorMsg}`);
    hideProgress(elements);
    setConvertBtnState(elements, "idle");
    setCancelEnabled(elements, false);
    setProgressEta(elements, "");
  }
}

function updatePhaseAndEta(elements: UIElements, progress: number, startTime: number): void {
  if (progress < 5) {
    setProgressPhase(elements, "Initializing encoder...");
  } else if (progress < 25) {
    setProgressPhase(elements, "Analyzing video...");
  } else if (progress < 75) {
    setProgressPhase(elements, "Encoding frames...");
  } else if (progress < 95) {
    setProgressPhase(elements, "Finalizing output...");
  } else {
    setProgressPhase(elements, "Wrapping up...");
  }

  if (progress > 0) {
    const elapsedMs = Date.now() - startTime;
    const remainingMs = Math.max((elapsedMs / progress) * (100 - progress), 0);
    const remainingSec = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(remainingSec / 60);
    const seconds = remainingSec % 60;
    const label = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    setProgressEta(elements, `Estimated time remaining: ${label}`);
  }
}

export function handleDownload(
  convertedBlob: Blob | null,
  currentFile: File | null,
  elements: UIElements,
): void {
  if (!convertedBlob) {
    showError(elements, "No converted video available.");
    return;
  }

  const fileName = currentFile ? getOutputFileName(currentFile) : "output.webm";
  downloadFile(convertedBlob, fileName);
}
