import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null = null;
let isLoading = false;

interface WorkerMessage {
  type: "load" | "convert";
  data?: {
    videoData?: Uint8Array;
    videoName?: string;
  };
}

interface WorkerResponse {
  type: "loaded" | "progress" | "complete" | "error";
  data?: any;
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, data } = e.data;
  console.log("[Worker] Message received:", type);

  try {
    if (type === "load") {
      console.log("[Worker] Starting FFmpeg load");
      await loadFFmpeg();
      console.log("[Worker] FFmpeg load completed, sending loaded message");
    } else if (type === "convert" && data) {
      if (!ffmpeg) {
        throw new Error("FFmpeg not initialized");
      }
      console.log("[Worker] Starting conversion");
      await convertVideo(data.videoData!, data.videoName!);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const stack = error instanceof Error ? error.stack : "";
    console.error("[Worker] Error caught:", errorMessage);
    console.error("[Worker] Error stack:", stack);
    self.postMessage({
      type: "error",
      data: { message: errorMessage, stack },
    } as WorkerResponse);
  }
};

async function loadFFmpeg() {
  if (ffmpeg && !isLoading) {
    console.log("[Worker] FFmpeg already loaded");
    self.postMessage({ type: "loaded" } as WorkerResponse);
    return;
  }

  if (isLoading) {
    console.log("[Worker] FFmpeg already loading, waiting...");
    // Wait for it to finish
    let attempts = 0;
    while (isLoading && attempts < 100) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }
    if (ffmpeg) {
      self.postMessage({ type: "loaded" } as WorkerResponse);
      return;
    }
  }

  isLoading = true;

  try {
    console.log("[Worker] Creating FFmpeg instance");
    ffmpeg = new FFmpeg();

    // Set up progress logging
    ffmpeg.on("log", ({ message }) => {
      console.log("[FFmpeg Log]", message);
    });

    ffmpeg.on("progress", ({ progress, time }) => {
      console.log("[FFmpeg Progress]", progress);
      self.postMessage({
        type: "progress",
        data: { progress: Math.round(progress * 100), time },
      } as WorkerResponse);
    });

    // Load FFmpeg core from CDN
    const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm";
    console.log("[Worker] Resolving FFmpeg core URLs from:", baseURL);

    const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript");
    console.log("[Worker] Core JS URL resolved");

    const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm");
    console.log("[Worker] Core WASM URL resolved");

    console.log("[Worker] Calling ffmpeg.load()");
    await ffmpeg.load({
      coreURL,
      wasmURL,
    });

    console.log("[Worker] FFmpeg.load() completed successfully");
    isLoading = false;
    self.postMessage({ type: "loaded" } as WorkerResponse);
  } catch (error) {
    isLoading = false;
    const errorMessage = error instanceof Error ? error.message : "Failed to load FFmpeg";
    console.error("[Worker] FFmpeg load error:", errorMessage);
    throw error;
  }
}

async function convertVideo(videoData: Uint8Array, videoName: string) {
  console.log("[Worker] convertVideo called, video size:", videoData.byteLength);

  if (!ffmpeg) {
    throw new Error("FFmpeg not initialized");
  }

  const inputName = "input.mp4";
  const outputName = "output.webm";

  try {
    // Write input file to FFmpeg virtual file system
    console.log("[Worker] Writing input file to virtual filesystem");
    await ffmpeg.writeFile(inputName, videoData);
    console.log("[Worker] Input file written successfully");

    // Execute FFmpeg conversion with timeout
    // Command: ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 32 -b:v 0 -pix_fmt yuv420p -an output.webm
    console.log("[Worker] Starting FFmpeg exec with VP8 codec");

    // Create a promise that rejects if ffmpeg takes too long
    let conversionPromise: Promise<number>;
    try {
      // Use VP8 (libvpx) instead of VP9 - more memory efficient for WASM
      // VP8 is older but still produces excellent WebM files
      conversionPromise = ffmpeg.exec([
        "-i",
        inputName,
        "-c:v",
        "libvpx",
        "-b:v",
        "1000k",
        "-pix_fmt",
        "yuv420p",
        "-an",
        "-quality",
        "good",
        "-cpu-used",
        "5",
        outputName,
      ]);
    } catch (execError) {
      const execMsg = execError instanceof Error ? execError.message : String(execError);
      console.error("[Worker] FFmpeg exec() call threw error:", execMsg);
      throw new Error(`FFmpeg exec call failed: ${execMsg}`);
    }

    const timeoutPromise = new Promise<number>((_, reject) =>
      setTimeout(() => reject(new Error("FFmpeg conversion timeout after 120s")), 120000),
    );

    let exitCode: number;
    try {
      exitCode = await Promise.race([conversionPromise, timeoutPromise]);
    } catch (raceError) {
      const raceMsg = raceError instanceof Error ? raceError.message : String(raceError);
      console.error("[Worker] Promise.race() threw:", raceMsg);
      throw new Error(`FFmpeg conversion failed: ${raceMsg}`);
    }

    console.log("[Worker] FFmpeg exec completed with exit code:", exitCode);

    if (exitCode !== 0) {
      throw new Error(`FFmpeg conversion failed with exit code ${exitCode}`);
    }

    // Add a small delay to ensure file is written
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Read output file
    console.log("[Worker] Reading output file from virtual filesystem");
    let data;
    try {
      data = await ffmpeg.readFile(outputName);
      console.log("[Worker] Output file read successfully, size:", data.length);
    } catch (readError) {
      const readMsg = readError instanceof Error ? readError.message : "Unknown read error";
      console.error("[Worker] Failed to read output file:", readMsg);

      // Try to list files to debug
      console.log("[Worker] Attempting to list files in virtual filesystem");
      const files = await ffmpeg.listDir("/");
      console.log("[Worker] Files in root:", files);

      throw new Error(`Cannot read output.webm: ${readMsg}`);
    }

    // Clean up
    console.log("[Worker] Cleaning up files");
    try {
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
      console.log("[Worker] Files cleaned up");
    } catch (cleanupError) {
      console.error(
        "[Worker] Cleanup warning (non-fatal):",
        cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
      );
    }

    // Send result back
    console.log("[Worker] Conversion complete, sending result");
    self.postMessage({
      type: "complete",
      data: { videoData: data, videoName: outputName },
    } as WorkerResponse);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Conversion failed";
    const stack = error instanceof Error ? error.stack : "";
    console.error("[Worker] Conversion error:", errorMessage);
    console.error("[Worker] Error stack:", stack);
    throw error;
  }
}
