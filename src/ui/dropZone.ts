import type { UIElements } from "./elements";

export function setDropZoneActive(elements: UIElements, isActive: boolean): void {
  if (!elements.dropZone) return;
  elements.dropZone.classList.toggle("border-blue-500", isActive);
  elements.dropZone.classList.toggle("bg-blue-50", isActive);
}
