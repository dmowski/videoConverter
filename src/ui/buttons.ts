import type { UIElements } from "./elements";

export function setCancelEnabled(elements: UIElements, enabled: boolean): void {
  if (!elements.cancelBtn) return;
  elements.cancelBtn.disabled = !enabled;
  elements.cancelBtn.setAttribute("aria-disabled", String(!enabled));
  elements.cancelBtn.classList.toggle("opacity-50", !enabled);
  elements.cancelBtn.classList.toggle("cursor-not-allowed", !enabled);
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
