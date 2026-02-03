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

  // Hide download section
  hideDownload(elements);

  // Reset progress
  updateProgress(elements, 0);

  try {
    await converter.convert(
      currentFile,
      // onProgress
      (progress) => {
        updateProgress(elements, progress.progress);
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

        // Notify completion
        onConversionComplete(convertedBlob);
      },
      // onError
      (error) => {
        showError(elements, `Conversion failed: ${error}`);
        hideProgress(elements);
        setConvertBtnState(elements, "idle");
      },
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    showError(elements, `Conversion failed: ${errorMsg}`);
    hideProgress(elements);
    setConvertBtnState(elements, "idle");
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
