import type { UIElements } from "./elements";

export function displayVideoInfo(elements: UIElements, file: File, sizeLabel: string): void {
  if (elements.videoInfo) {
    elements.videoInfo.innerHTML = `
      <p><strong>File:</strong> ${file.name}</p>
      <p><strong>Size:</strong> ${sizeLabel}</p>
      <p><strong>Type:</strong> ${file.type}</p>
    `;
  }
}
