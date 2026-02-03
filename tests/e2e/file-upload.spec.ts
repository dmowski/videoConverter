import { test, expect } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe("Phase 2: File Upload Functionality", () => {
  const sampleVideoPath = path.join(__dirname, "../fixtures/sample.mp4");

  test("should upload valid MP4 file", async ({ page }) => {
    await page.goto("/");

    // Upload file
    const fileInput = page.locator("#video-input");
    await fileInput.setInputFiles(sampleVideoPath);

    // Wait for preview section to appear
    await expect(page.locator("#preview-section")).toBeVisible();
  });

  test("should display file preview after upload", async ({ page }) => {
    await page.goto("/");

    // Upload file
    const fileInput = page.locator("#video-input");
    await fileInput.setInputFiles(sampleVideoPath);

    // Check video preview
    const videoPreview = page.locator("#video-preview");
    await expect(videoPreview).toBeVisible();

    // Verify video has a source
    const src = await videoPreview.getAttribute("src");
    expect(src).toBeTruthy();
    expect(src).toContain("blob:");
  });

  test("should display file metadata", async ({ page }) => {
    await page.goto("/");

    // Upload file
    const fileInput = page.locator("#video-input");
    await fileInput.setInputFiles(sampleVideoPath);

    // Check file info is displayed
    const videoInfo = page.locator("#video-info");
    await expect(videoInfo).toBeVisible();

    const infoText = await videoInfo.textContent();
    expect(infoText).toContain("sample.mp4");
    expect(infoText).toContain("Size:");
    expect(infoText).toContain("Type:");
  });

  test("should show convert button after file selection", async ({ page }) => {
    await page.goto("/");

    // Upload file
    const fileInput = page.locator("#video-input");
    await fileInput.setInputFiles(sampleVideoPath);

    // Check convert button is visible
    const convertBtn = page.locator("#convert-btn");
    await expect(convertBtn).toBeVisible();
    await expect(convertBtn).toHaveText("Convert to WebM (VP9)");
    await expect(convertBtn).toBeEnabled();
  });
});
