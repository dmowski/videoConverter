import "./style.css";

// Initialize app
console.log("Video Converter App Initialized");

// Get DOM elements
const videoInput = document.querySelector<HTMLInputElement>("#video-input");
const previewSection = document.querySelector<HTMLDivElement>("#preview-section");
const videoPreview = document.querySelector<HTMLVideoElement>("#video-preview");
const videoInfo = document.querySelector<HTMLDivElement>("#video-info");

if (videoInput) {
  videoInput.addEventListener("change", handleFileSelect);
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

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
