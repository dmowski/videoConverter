import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('Simple conversion test with console output', async ({ page }) => {
  test.setTimeout(120000);

  // Capture all console messages
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    const text = `[${msg.type().toUpperCase()}] ${msg.text()}`;
    console.log(text);
    consoleLogs.push(text);
  });

  const sampleVideoPath = path.join(__dirname, '../fixtures/sample.mp4');

  await page.goto('/');
  
  // Upload
  const fileInput = page.locator('#video-input');
  await fileInput.setInputFiles(sampleVideoPath);
  
  await page.waitForTimeout(2000);

  // Click convert
  const convertBtn = page.locator('#convert-btn');
  await expect(convertBtn).toBeVisible();
  await convertBtn.click();

  // Wait for completion or error
  await page.waitForTimeout(30000);

  // Log all console output
  console.log('\n=== ALL CONSOLE LOGS ===');
  consoleLogs.forEach(log => console.log(log));

  // Check for error
  const errorSection = page.locator('#error-section');
  if (await errorSection.isVisible()) {
    const errorText = await page.locator('#error-message').textContent();
    console.log('\nERROR:', errorText);
  } else {
    console.log('\nNo error section visible');
  }

  // Check for download
  const downloadSection = page.locator('#download-section');
  console.log('Download section visible:', await downloadSection.isVisible());
});
