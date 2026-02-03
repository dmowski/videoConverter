import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe("Phase 2: Video Conversion", () => {
  const sampleVideoPath = path.join(__dirname, "../fixtures/sample.mp4");

  test("should convert video and show progress", async ({ page }) => {
    // Increase timeout for conversion
    test.setTimeout(120000); // 2 minutes

    await page.goto("/");

    // Upload file
    const fileInput = page.locator("#video-input");
    await fileInput.setInputFiles(sampleVideoPath);

    // Wait for preview and click convert
    await expect(page.locator("#convert-btn")).toBeVisible();
    await page.locator("#convert-btn").click();

    // Progress section should appear
    await expect(page.locator("#progress-section")).toBeVisible({ timeout: 10000 });

    // Convert button should be disabled
    await expect(page.locator("#convert-btn")).toBeDisabled();
    await expect(page.locator("#convert-btn")).toHaveText("Converting...");
  });

  test("should complete conversion and show download button", async ({ page }) => {
    // Increase timeout for conversion
    test.setTimeout(120000); // 2 minutes

    await page.goto("/");

    // Upload file
    const fileInput = page.locator("#video-input");
    await fileInput.setInputFiles(sampleVideoPath);

    // Click convert
    await expect(page.locator("#convert-btn")).toBeVisible();
    await page.locator("#convert-btn").click();

    // Wait for conversion to complete (download section should appear)
    await expect(page.locator("#download-section")).toBeVisible({ timeout: 90000 });

    // Progress section should be hidden
    await expect(page.locator("#progress-section")).toHaveClass(/hidden/);

    // Download button should be visible
    const downloadBtn = page.locator("#download-btn");
    await expect(downloadBtn).toBeVisible();
    await expect(downloadBtn).toHaveText("Download WebM Video");
  });

  test("should download converted file", async ({ page }) => {
    // Increase timeout for conversion
    test.setTimeout(120000); // 2 minutes

    await page.goto("/");

    // Upload file
    const fileInput = page.locator("#video-input");
    await fileInput.setInputFiles(sampleVideoPath);

    // Click convert
    await expect(page.locator("#convert-btn")).toBeVisible();
    await page.locator("#convert-btn").click();

    // Wait for download button
    await expect(page.locator("#download-section")).toBeVisible({ timeout: 90000 });

    // Setup download promise before clicking
    const downloadPromise = page.waitForEvent("download", { timeout: 10000 });

    // Click download
    await page.locator("#download-btn").click();

    // Wait for download
    const download = await downloadPromise;

    // Verify download
    expect(download.suggestedFilename()).toMatch(/\.webm$/);

    // Save download to temp location for validation
    const downloadPath = path.join(__dirname, "../fixtures/temp-output.webm");
    await download.saveAs(downloadPath);

    // Verify file exists and has content
    expect(fs.existsSync(downloadPath)).toBeTruthy();
    const stats = fs.statSync(downloadPath);
    expect(stats.size).toBeGreaterThan(0);

    // Clean up
    if (fs.existsSync(downloadPath)) {
      fs.unlinkSync(downloadPath);
    }
  });
});
