import type { UIElements } from "./elements";

export function showPreview(elements: UIElements): void {
  if (elements.previewSection) {
    elements.previewSection.classList.remove("hidden");
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
