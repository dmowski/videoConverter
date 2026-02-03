/**
 * File Handler Module - Manages file selection and validation
 */

const MAX_FILE_SIZE_MB = 500;

export function isValidVideoFile(file: File): boolean {
  return file.type.startsWith("video/");
}

export function validateVideoFile(file: File): { isValid: boolean; error?: string } {
  if (!isValidVideoFile(file)) {
    return { isValid: false, error: "Please select a valid video file." };
  }

  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > MAX_FILE_SIZE_MB) {
    return {
      isValid: false,
      error: `File is too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.`,
    };
  }

  return { isValid: true };
}

export function formatFileSize(bytes: number): string {
  const sizeMB = bytes / (1024 * 1024);
  return `${sizeMB.toFixed(2)} MB`;
}

export function createPreviewURL(file: File): string {
  return URL.createObjectURL(file);
}

export function displayVideoPreview(
  videoPreviewElement: HTMLVideoElement | null,
  url: string,
): void {
  if (videoPreviewElement) {
    videoPreviewElement.src = url;
  }
}

export function getOutputFileName(inputFile: File): string {
  return inputFile.name.replace(/\.[^/.]+$/, ".webm");
}

export function downloadFile(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
