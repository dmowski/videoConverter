import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

interface WorkerMessage {
  type: 'load' | 'convert';
  data?: {
    videoData?: Uint8Array;
    videoName?: string;
  };
}

interface WorkerResponse {
  type: 'loaded' | 'progress' | 'complete' | 'error';
  data?: any;
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, data } = e.data;

  try {
    if (type === 'load') {
      await loadFFmpeg();
    } else if (type === 'convert' && data) {
      await convertVideo(data.videoData!, data.videoName!);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    self.postMessage({
      type: 'error',
      data: { message: errorMessage }
    } as WorkerResponse);
  }
};

async function loadFFmpeg() {
  if (ffmpeg) {
    self.postMessage({ type: 'loaded' } as WorkerResponse);
    return;
  }

  ffmpeg = new FFmpeg();

  // Set up progress logging
  ffmpeg.on('log', ({ message }) => {
    console.log('[FFmpeg]', message);
  });

  ffmpeg.on('progress', ({ progress, time }) => {
    self.postMessage({
      type: 'progress',
      data: { progress: Math.round(progress * 100), time }
    } as WorkerResponse);
  });

  try {
    // Load FFmpeg core from CDN
    const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    self.postMessage({ type: 'loaded' } as WorkerResponse);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load FFmpeg';
    self.postMessage({
      type: 'error',
      data: { message: errorMessage }
    } as WorkerResponse);
    throw error;
  }
}

async function convertVideo(videoData: Uint8Array, videoName: string) {
  if (!ffmpeg) {
    throw new Error('FFmpeg not initialized');
  }

  console.log('[Worker] FFmpeg instance:', typeof ffmpeg);
  console.log('[Worker] FFmpeg ready:', (ffmpeg as any).ready);

  const inputName = 'input.mp4';
  const outputName = 'output.webm';

  // Write input file to FFmpeg virtual file system
  await ffmpeg.writeFile(inputName, videoData);

  // Execute FFmpeg conversion
  // Command: ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 32 -b:v 0 -pix_fmt yuv420p -an output.webm
  await ffmpeg.exec([
    '-i', inputName,
    '-c:v', 'libvpx-vp9',
    '-crf', '32',
    '-b:v', '0',
    '-pix_fmt', 'yuv420p',
    '-an',
    outputName
  ]);

  // Read output file
  const data = await ffmpeg.readFile(outputName);
  
  // Clean up
  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);

  // Send result back
  self.postMessage({
    type: 'complete',
    data: { videoData: data, videoName: outputName }
  } as WorkerResponse);
}
