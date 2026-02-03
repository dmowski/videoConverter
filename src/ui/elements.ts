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
