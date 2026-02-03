import type { FFmpeg } from "@ffmpeg/ffmpeg";

let ffmpeg: FFmpeg | null = null;
let isLoading = false;

export function getFFmpeg(): FFmpeg | null {
  return ffmpeg;
}

export function setFFmpeg(instance: FFmpeg | null): void {
  ffmpeg = instance;
}

export function getIsLoading(): boolean {
  return isLoading;
}

export function setIsLoading(value: boolean): void {
  isLoading = value;
}
