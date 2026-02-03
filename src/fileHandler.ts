/**
 * File Handler Module - Manages file selection and validation
 */

export function isValidVideoFile(file: File): boolean {
  return file.type.startsWith("video/");
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
