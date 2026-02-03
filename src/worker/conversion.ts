import type { WorkerResponse } from "./types";
import { getFFmpeg } from "./state";

export async function convertVideo(videoData: Uint8Array, _videoName: string): Promise<void> {
  console.log("[Worker] convertVideo called, video size:", videoData.byteLength);

  const ffmpeg = getFFmpeg();
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
    console.log("[Worker] Starting FFmpeg exec with VP8 codec");

    let conversionPromise: Promise<number>;
    try {
      // Use VP8 (libvpx) instead of VP9 - more memory efficient for WASM
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
