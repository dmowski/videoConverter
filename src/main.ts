import "./style.css";
import { VideoConverter } from "./converter";
import {
  getUIElements,
  hideDownload,
  hideError,
  showError,
  showPreview,
  displayVideoInfo,
} from "./ui";
import { isValidVideoFile, createPreviewURL, displayVideoPreview } from "./fileHandler";
import { handleConvert, handleDownload } from "./conversionManager";

// Initialize app
console.log("Video Converter App Initialized");

// Initialize converter
const converter = new VideoConverter();
let currentFile: File | null = null;
let convertedBlob: Blob | null = null;

// Get UI elements
const elements = getUIElements();

// Event listeners
if (elements.videoInput) {
  elements.videoInput.addEventListener("change", handleFileSelect);
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

// Load FFmpeg on app init
converter.load().catch((error) => {
  console.error("Failed to load FFmpeg:", error);
  showError(elements, "Failed to load video converter. Please refresh the page.");
});

function handleFileSelect(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  // Validate file type
  if (!isValidVideoFile(file)) {
    showError(elements, "Please select a valid video file.");
    return;
  }

  currentFile = file;

  // Hide error and download sections
  hideError(elements);
  hideDownload(elements);

  // Show preview section
  showPreview(elements);

  // Create object URL for preview
  const url = createPreviewURL(file);
  displayVideoPreview(elements.videoPreview, url);

  // Display file info
  displayVideoInfo(elements, file);
}
