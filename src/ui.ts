/**
 * UI Module - Manages DOM elements and visibility states
 */

export interface UIElements {
  videoInput: HTMLInputElement | null;
  previewSection: HTMLDivElement | null;
  videoPreview: HTMLVideoElement | null;
  videoInfo: HTMLDivElement | null;
  convertBtn: HTMLButtonElement | null;
  progressSection: HTMLDivElement | null;
  progressBar: HTMLDivElement | null;
  progressText: HTMLParagraphElement | null;
  downloadSection: HTMLDivElement | null;
  downloadBtn: HTMLButtonElement | null;
  errorSection: HTMLDivElement | null;
  errorMessage: HTMLParagraphElement | null;
}

export function getUIElements(): UIElements {
  return {
    videoInput: document.querySelector<HTMLInputElement>("#video-input"),
    previewSection: document.querySelector<HTMLDivElement>("#preview-section"),
    videoPreview: document.querySelector<HTMLVideoElement>("#video-preview"),
    videoInfo: document.querySelector<HTMLDivElement>("#video-info"),
    convertBtn: document.querySelector<HTMLButtonElement>("#convert-btn"),
    progressSection: document.querySelector<HTMLDivElement>("#progress-section"),
    progressBar: document.querySelector<HTMLDivElement>("#progress-bar"),
    progressText: document.querySelector<HTMLParagraphElement>("#progress-text"),
    downloadSection: document.querySelector<HTMLDivElement>("#download-section"),
    downloadBtn: document.querySelector<HTMLButtonElement>("#download-btn"),
    errorSection: document.querySelector<HTMLDivElement>("#error-section"),
    errorMessage: document.querySelector<HTMLParagraphElement>("#error-message"),
  };
}

export function showError(elements: UIElements, message: string): void {
  if (elements.errorSection) {
    elements.errorSection.classList.remove("hidden");
  }
  if (elements.errorMessage) {
    elements.errorMessage.textContent = message;
  }
}

export function hideError(elements: UIElements): void {
  if (elements.errorSection) {
    elements.errorSection.classList.add("hidden");
  }
}

export function updateProgress(elements: UIElements, progress: number): void {
  if (elements.progressBar) {
    elements.progressBar.style.width = `${progress}%`;
  }
  if (elements.progressText) {
    elements.progressText.textContent = `${progress}%`;
  }
}

export function showPreview(elements: UIElements): void {
  if (elements.previewSection) {
    elements.previewSection.classList.remove("hidden");
  }
}

export function showProgress(elements: UIElements): void {
  if (elements.progressSection) {
    elements.progressSection.classList.remove("hidden");
  }
}

export function hideProgress(elements: UIElements): void {
  if (elements.progressSection) {
    elements.progressSection.classList.add("hidden");
  }
}

export function showDownload(elements: UIElements): void {
  if (elements.downloadSection) {
    elements.downloadSection.classList.remove("hidden");
  }
}

export function hideDownload(elements: UIElements): void {
  if (elements.downloadSection) {
    elements.downloadSection.classList.add("hidden");
  }
}

export function setConvertBtnState(elements: UIElements, state: "idle" | "loading"): void {
  if (!elements.convertBtn) return;

  if (state === "loading") {
    elements.convertBtn.disabled = true;
    elements.convertBtn.textContent = "Converting...";
  } else {
    elements.convertBtn.disabled = false;
    elements.convertBtn.textContent = "Convert to WebM (VP9)";
  }
}

export function displayVideoInfo(elements: UIElements, file: File): void {
  if (elements.videoInfo) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    elements.videoInfo.innerHTML = `
      <p><strong>File:</strong> ${file.name}</p>
      <p><strong>Size:</strong> ${sizeMB} MB</p>
      <p><strong>Type:</strong> ${file.type}</p>
    `;
  }
}
