import type { UIElements } from "./elements";

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
