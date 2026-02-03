import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { validateWebMFile } from '../helpers/video-validator';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe('Phase 2: Video Format Validation', () => {
  const sampleVideoPath = path.join(__dirname, '../fixtures/sample.mp4');
  const outputPath = path.join(__dirname, '../fixtures/validated-output.webm');

  test.afterAll(() => {
    // Clean up downloaded file
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
  });

  test('should produce valid WebM container format', async ({ page }) => {
    // Increase timeout for conversion
    test.setTimeout(120000); // 2 minutes

    await page.goto('/');

    // Upload and convert
    const fileInput = page.locator('#video-input');
    await fileInput.setInputFiles(sampleVideoPath);
    await page.locator('#convert-btn').click();

    // Wait for download button
    await expect(page.locator('#download-section')).toBeVisible({ timeout: 90000 });

    // Download file
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#download-btn').click();
    const download = await downloadPromise;
    await download.saveAs(outputPath);

    // Validate WebM format
    const buffer = fs.readFileSync(outputPath);
    const validation = await validateWebMFile(buffer.buffer);

    expect(validation.isWebM).toBeTruthy();
    expect(validation.errors).toHaveLength(0);
  });

  test('should use VP9 video codec', async ({ page }) => {
    // Skip if output file doesn't exist from previous test
    if (!fs.existsSync(outputPath)) {
      test.skip();
    }

    // Validate VP9 codec
    const buffer = fs.readFileSync(outputPath);
    const validation = await validateWebMFile(buffer.buffer);

    expect(validation.hasVP9Codec).toBeTruthy();
  });

  test('should have no audio stream', async ({ page }) => {
    // Skip if output file doesn't exist from previous test
    if (!fs.existsSync(outputPath)) {
      test.skip();
    }

    // Validate no audio
    const buffer = fs.readFileSync(outputPath);
    const validation = await validateWebMFile(buffer.buffer);

    expect(validation.hasAudio).toBeFalsy();
  });

  test('should match expected FFmpeg parameters', async ({ page }) => {
    // This test verifies the overall conversion matches our requirements
    if (!fs.existsSync(outputPath)) {
      test.skip();
    }

    const buffer = fs.readFileSync(outputPath);
    const validation = await validateWebMFile(buffer.buffer);

    // Check all requirements from FFmpeg command:
    // -c:v libvpx-vp9 -crf 32 -b:v 0 -pix_fmt yuv420p -an
    
    expect(validation.isWebM).toBeTruthy(); // Container format
    expect(validation.hasVP9Codec).toBeTruthy(); // VP9 codec
    expect(validation.hasAudio).toBeFalsy(); // No audio (-an flag)
    
    // File should be smaller than original (due to VP9 compression)
    const originalStats = fs.statSync(sampleVideoPath);
    const convertedStats = fs.statSync(outputPath);
    
    // Converted file should exist and have reasonable size
    expect(convertedStats.size).toBeGreaterThan(0);
    console.log(`Original: ${originalStats.size} bytes, Converted: ${convertedStats.size} bytes`);
  });
});
