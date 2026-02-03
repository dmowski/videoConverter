/**
 * UI Module - Manages DOM elements and visibility states
 */

export interface UIElements {
  videoInput: HTMLInputElement | null;
  dropZone: HTMLDivElement | null;
  previewSection: HTMLDivElement | null;
  videoPreview: HTMLVideoElement | null;
  videoInfo: HTMLDivElement | null;
  convertBtn: HTMLButtonElement | null;
  progressSection: HTMLDivElement | null;
  progressBar: HTMLDivElement | null;
  progressText: HTMLParagraphElement | null;
  progressPhase: HTMLParagraphElement | null;
  progressEta: HTMLParagraphElement | null;
  cancelBtn: HTMLButtonElement | null;
  downloadSection: HTMLDivElement | null;
  downloadBtn: HTMLButtonElement | null;
  errorSection: HTMLDivElement | null;
  errorMessage: HTMLParagraphElement | null;
  errorHint: HTMLParagraphElement | null;
}

export function getUIElements(): UIElements {
  return {
    videoInput: document.querySelector<HTMLInputElement>("#video-input"),
    dropZone: document.querySelector<HTMLDivElement>("#drop-zone"),
    previewSection: document.querySelector<HTMLDivElement>("#preview-section"),
    videoPreview: document.querySelector<HTMLVideoElement>("#video-preview"),
    videoInfo: document.querySelector<HTMLDivElement>("#video-info"),
    convertBtn: document.querySelector<HTMLButtonElement>("#convert-btn"),
    progressSection: document.querySelector<HTMLDivElement>("#progress-section"),
    progressBar: document.querySelector<HTMLDivElement>("#progress-bar"),
    progressText: document.querySelector<HTMLParagraphElement>("#progress-text"),
    progressPhase: document.querySelector<HTMLParagraphElement>("#progress-phase"),
    progressEta: document.querySelector<HTMLParagraphElement>("#progress-eta"),
    cancelBtn: document.querySelector<HTMLButtonElement>("#cancel-btn"),
    downloadSection: document.querySelector<HTMLDivElement>("#download-section"),
    downloadBtn: document.querySelector<HTMLButtonElement>("#download-btn"),
    errorSection: document.querySelector<HTMLDivElement>("#error-section"),
    errorMessage: document.querySelector<HTMLParagraphElement>("#error-message"),
    errorHint: document.querySelector<HTMLParagraphElement>("#error-hint"),
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

export function setErrorHint(elements: UIElements, message: string): void {
  if (elements.errorHint) {
    elements.errorHint.textContent = message;
  }
}

export function setDropZoneActive(elements: UIElements, isActive: boolean): void {
  if (!elements.dropZone) return;
  elements.dropZone.classList.toggle("border-blue-500", isActive);
  elements.dropZone.classList.toggle("bg-blue-50", isActive);
}

export function setCancelEnabled(elements: UIElements, enabled: boolean): void {
  if (!elements.cancelBtn) return;
  elements.cancelBtn.disabled = !enabled;
  elements.cancelBtn.setAttribute("aria-disabled", String(!enabled));
  elements.cancelBtn.classList.toggle("opacity-50", !enabled);
  elements.cancelBtn.classList.toggle("cursor-not-allowed", !enabled);
}

export function hideError(elements: UIElements): void {
  if (elements.errorSection) {
    elements.errorSection.classList.add("hidden");
  }
  if (elements.errorMessage) {
    elements.errorMessage.textContent = "";
  }
  if (elements.errorHint) {
    elements.errorHint.textContent = "";
  }
}

export function updateProgress(elements: UIElements, progress: number): void {
  if (elements.progressBar) {
    elements.progressBar.style.width = `${progress}%`;
    elements.progressBar.setAttribute("aria-valuenow", String(progress));
  }
  if (elements.progressText) {
    elements.progressText.textContent = `${progress}%`;
  }
}

export function setProgressPhase(elements: UIElements, message: string): void {
  if (elements.progressPhase) {
    elements.progressPhase.textContent = message;
  }
}

export function setProgressEta(elements: UIElements, message: string): void {
  if (elements.progressEta) {
    elements.progressEta.textContent = message;
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
    elements.convertBtn.setAttribute("aria-disabled", "true");
    elements.convertBtn.textContent = "Converting...";
  } else {
    elements.convertBtn.disabled = false;
    elements.convertBtn.setAttribute("aria-disabled", "false");
    elements.convertBtn.textContent = "Convert to WebM (VP9)";
  }
}

export function displayVideoInfo(elements: UIElements, file: File, sizeLabel: string): void {
  if (elements.videoInfo) {
    elements.videoInfo.innerHTML = `
      <p><strong>File:</strong> ${file.name}</p>
      <p><strong>Size:</strong> ${sizeLabel}</p>
      <p><strong>Type:</strong> ${file.type}</p>
    `;
  }
}
