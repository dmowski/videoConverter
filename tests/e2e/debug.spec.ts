import { test, expect } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe("Debug: Check Conversion Process", () => {
  const sampleVideoPath = path.join(__dirname, "../fixtures/sample.mp4");

  test("should debug conversion flow", async ({ page }) => {
    test.setTimeout(120000);

    // Listen to console messages
    page.on("console", (msg) => {
      console.log(`[Browser ${msg.type()}]:`, msg.text());
    });

    // Listen to page errors
    page.on("pageerror", (error) => {
      console.error("[Page Error]:", error.message);
    });

    await page.goto("/");

    // Upload file
    const fileInput = page.locator("#video-input");
    await fileInput.setInputFiles(sampleVideoPath);

    // Wait and click convert
    await expect(page.locator("#convert-btn")).toBeVisible();
    await page.locator("#convert-btn").click();

    // Wait a bit and check all sections
    await page.waitForTimeout(5000);

    const progressVisible = await page.locator("#progress-section").isVisible();
    const downloadVisible = await page.locator("#download-section").isVisible();
    const errorVisible = await page.locator("#error-section").isVisible();

    console.log("Progress section visible:", progressVisible);
    console.log("Download section visible:", downloadVisible);
    console.log("Error section visible:", errorVisible);

    if (errorVisible) {
      const errorText = await page.locator("#error-message").textContent();
      console.log("Error message:", errorText);
    }

    // Take a screenshot
    await page.screenshot({ path: "debug-screenshot.png", fullPage: true });
  });
});
