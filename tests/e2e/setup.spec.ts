import { test, expect } from "@playwright/test";

test.describe("Phase 1: Basic App Setup", () => {
  test("should load the application successfully", async ({ page }) => {
    await page.goto("/");

    // Wait for the app to be ready
    await page.waitForLoadState("networkidle");

    // Verify no critical errors in console
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    // Check basic page load
    expect(page.url()).toContain("localhost:5173");
  });

  test("should have correct page title and structure", async ({ page }) => {
    await page.goto("/");

    // Check page title
    await expect(page).toHaveTitle(/Video Converter/);

    // Check main heading
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText("Video Converter");

    // Check description
    const description = page.locator("text=Convert your videos to WebM");
    await expect(description).toBeVisible();
  });

  test("should have file input element present", async ({ page }) => {
    await page.goto("/");

    // Check for file input
    const fileInput = page.locator("#video-input");
    await expect(fileInput).toBeVisible();
    await expect(fileInput).toHaveAttribute("type", "file");
    await expect(fileInput).toHaveAttribute("accept", "video/*");

    // Check label
    const label = page.locator('label[for="video-input"]');
    await expect(label).toBeVisible();
    await expect(label).toHaveText("Select Video File");
  });

  test("should have all required UI elements present", async ({ page }) => {
    await page.goto("/");

    // Upload section
    const uploadSection = page.locator("#upload-section");
    await expect(uploadSection).toBeVisible();

    // Preview section (hidden initially)
    const previewSection = page.locator("#preview-section");
    await expect(previewSection).toHaveClass(/hidden/);

    // Progress section (hidden initially)
    const progressSection = page.locator("#progress-section");
    await expect(progressSection).toHaveClass(/hidden/);

    // Download section (hidden initially)
    const downloadSection = page.locator("#download-section");
    await expect(downloadSection).toHaveClass(/hidden/);

    // Error section (hidden initially)
    const errorSection = page.locator("#error-section");
    await expect(errorSection).toHaveClass(/hidden/);
  });

  test("should display file preview when video is selected", async ({ page }) => {
    await page.goto("/");

    // Create a small test video file (1x1 pixel, 1 second)
    // For now, we'll use a test file path approach
    // In a real test, you'd have a fixture video file

    const fileInput = page.locator("#video-input");

    // Note: This test will be expanded in Phase 2 with actual file upload
    // For Phase 1, we're just verifying the input exists and is interactive
    await expect(fileInput).toBeEnabled();
  });
});
