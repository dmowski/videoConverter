import type { UIElements } from "./elements";

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
