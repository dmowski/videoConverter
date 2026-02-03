import "./style.css";
import { VideoConverter } from "./converter";

// Initialize app
console.log("Video Converter App Initialized");

// Initialize converter
const converter = new VideoConverter();
let currentFile: File | null = null;
let convertedBlob: Blob | null = null;

// Get DOM elements
const videoInput = document.querySelector<HTMLInputElement>("#video-input");
const previewSection = document.querySelector<HTMLDivElement>("#preview-section");
const videoPreview = document.querySelector<HTMLVideoElement>("#video-preview");
const videoInfo = document.querySelector<HTMLDivElement>("#video-info");
const convertBtn = document.querySelector<HTMLButtonElement>("#convert-btn");
const progressSection = document.querySelector<HTMLDivElement>("#progress-section");
const progressBar = document.querySelector<HTMLDivElement>("#progress-bar");
const progressText = document.querySelector<HTMLParagraphElement>("#progress-text");
const downloadSection = document.querySelector<HTMLDivElement>("#download-section");
const downloadBtn = document.querySelector<HTMLButtonElement>("#download-btn");
const errorSection = document.querySelector<HTMLDivElement>("#error-section");
const errorMessage = document.querySelector<HTMLParagraphElement>("#error-message");

// Event listeners
if (videoInput) {
  videoInput.addEventListener("change", handleFileSelect);
}

if (convertBtn) {
  convertBtn.addEventListener("click", handleConvert);
}

if (downloadBtn) {
  downloadBtn.addEventListener("click", handleDownload);
}

// Load FFmpeg on app init
converter.load().catch((error) => {
  console.error("Failed to load FFmpeg:", error);
  showError("Failed to load video converter. Please refresh the page.");
});

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  // Validate file type
  if (!file.type.startsWith("video/")) {
    showError("Please select a valid video file.");
    return;
  }

  currentFile = file;

  // Hide error and download sections
  hideError();
  if (downloadSection) downloadSection.classList.add("hidden");
  if (progressSection) progressSection.classList.add("hidden");

  // Show preview section
  if (previewSection) {
    previewSection.classList.remove("hidden");
  }

  // Create object URL for preview
  const url = URL.createObjectURL(file);
  if (videoPreview) {
    videoPreview.src = url;
  }

  // Display file info
  if (videoInfo) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    videoInfo.innerHTML = `
      <p><strong>File:</strong> ${file.name}</p>
      <p><strong>Size:</strong> ${sizeMB} MB</p>
      <p><strong>Type:</strong> ${file.type}</p>
    `;
  }
}

async function handleConvert() {
  if (!currentFile) {
    showError("Please select a video file first.");
    return;
  }

  // Hide error section
  hideError();

  // Disable convert button
  if (convertBtn) {
    convertBtn.disabled = true;
    convertBtn.textContent = "Converting...";
  }

  // Show progress section
  if (progressSection) {
    progressSection.classList.remove("hidden");
  }

  // Hide download section
  if (downloadSection) {
    downloadSection.classList.add("hidden");
  }

  // Reset progress
  updateProgress(0);

  try {
    await converter.convert(
      currentFile,
      // onProgress
      (progress) => {
        updateProgress(progress.progress);
      },
      // onComplete
      (result) => {
        // Create blob from result
        convertedBlob = new Blob([result.videoData], { type: "video/webm" });

        // Hide progress, show download
        if (progressSection) progressSection.classList.add("hidden");
        if (downloadSection) downloadSection.classList.remove("hidden");

        // Re-enable convert button
        if (convertBtn) {
          convertBtn.disabled = false;
          convertBtn.textContent = "Convert to WebM (VP9)";
        }
      },
      // onError
      (error) => {
        showError(`Conversion failed: ${error}`);
        if (progressSection) progressSection.classList.add("hidden");
        if (convertBtn) {
          convertBtn.disabled = false;
          convertBtn.textContent = "Convert to WebM (VP9)";
        }
      }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    showError(`Conversion failed: ${errorMsg}`);
    if (progressSection) progressSection.classList.add("hidden");
    if (convertBtn) {
      convertBtn.disabled = false;
      convertBtn.textContent = "Convert to WebM (VP9)";
    }
  }
}

function updateProgress(progress: number) {
  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }
  if (progressText) {
    progressText.textContent = `${progress}%`;
  }
}

function handleDownload() {
  if (!convertedBlob) {
    showError("No converted video available.");
    return;
  }

  // Create download link
  const url = URL.createObjectURL(convertedBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = currentFile ? currentFile.name.replace(/\.[^/.]+$/, ".webm") : "output.webm";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

function showError(message: string) {
  if (errorSection) {
    errorSection.classList.remove("hidden");
  }
  if (errorMessage) {
    errorMessage.textContent = message;
  }
}

function hideError() {
  if (errorSection) {
    errorSection.classList.add("hidden");
  }
}

