import "./style.css";
import { VideoConverter } from "./converter";
import {
  getUIElements,
  hideProgress,
  hideDownload,
  hideError,
  showError,
  showPreview,
  setDropZoneActive,
  setCancelEnabled,
  setConvertBtnState,
  setProgressEta,
  setProgressPhase,
  displayVideoInfo,
} from "./ui";
import {
  createPreviewURL,
  displayVideoPreview,
  formatFileSize,
  validateVideoFile,
} from "./fileHandler";
import { handleConvert, handleDownload } from "./conversionManager";

// Initialize app
console.log("Video Converter App Initialized");

// Initialize converter
const converter = new VideoConverter();
let currentFile: File | null = null;
let convertedBlob: Blob | null = null;

// Get UI elements
const elements = getUIElements();
setCancelEnabled(elements, false);

// Event listeners
if (elements.videoInput) {
  elements.videoInput.addEventListener("change", handleFileSelect);
}

if (elements.dropZone) {
  elements.dropZone.addEventListener("dragenter", handleDragEnter);
  elements.dropZone.addEventListener("dragover", handleDragOver);
  elements.dropZone.addEventListener("dragleave", handleDragLeave);
  elements.dropZone.addEventListener("drop", handleDrop);
}

if (elements.convertBtn) {
  elements.convertBtn.addEventListener("click", () => {
    handleConvert(currentFile!, converter, elements, (blob) => {
      convertedBlob = blob;
    }).catch((error) => {
      console.error("Conversion error:", error);
    });
  });
}

if (elements.downloadBtn) {
  elements.downloadBtn.addEventListener("click", () => {
    handleDownload(convertedBlob, currentFile, elements);
  });
}

if (elements.cancelBtn) {
  elements.cancelBtn.addEventListener("click", handleCancel);
}

// Load FFmpeg on app init
converter.load().catch((error) => {
  console.error("Failed to load FFmpeg:", error);
  showError(elements, "Failed to load video converter. Please refresh the page.");
});

function handleFileSelect(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  processSelectedFile(file);
}

function handleDragEnter(event: DragEvent): void {
  event.preventDefault();
  setDropZoneActive(elements, true);
}

function handleDragOver(event: DragEvent): void {
  event.preventDefault();
  setDropZoneActive(elements, true);
}

function handleDragLeave(): void {
  setDropZoneActive(elements, false);
}

function handleDrop(event: DragEvent): void {
  event.preventDefault();
  setDropZoneActive(elements, false);

  const file = event.dataTransfer?.files?.[0];
  if (!file) return;

  processSelectedFile(file);
}

function handleCancel(): void {
  converter.cancel();
  hideProgress(elements);
  setCancelEnabled(elements, false);
  setConvertBtnState(elements, "idle");
  hideDownload(elements);
  setProgressPhase(elements, "Conversion canceled");
  setProgressEta(elements, "");
  showError(elements, "Conversion canceled.");
  converter.load().catch((error) => {
    console.error("Failed to reload FFmpeg after cancel:", error);
    showError(elements, "Failed to reload converter. Please refresh the page.");
  });
}

function processSelectedFile(file: File): void {
  if (!file) return;

  // Validate file type
  const validation = validateVideoFile(file);
  if (!validation.isValid) {
    showError(elements, validation.error || "Invalid video file.");
    return;
  }

  currentFile = file;

  // Hide error and download sections
  hideError(elements);
  hideDownload(elements);
  hideProgress(elements);
  setCancelEnabled(elements, false);
  setProgressEta(elements, "");

  // Show preview section
  showPreview(elements);

  // Create object URL for preview
  const url = createPreviewURL(file);
  displayVideoPreview(elements.videoPreview, url);

  // Display file info
  displayVideoInfo(elements, file, formatFileSize(file.size));
}
