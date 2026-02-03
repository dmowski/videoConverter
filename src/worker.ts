import type { WorkerMessage, WorkerResponse } from "./worker/types";
import { loadFFmpeg } from "./worker/ffmpegLoader";
import { convertVideo } from "./worker/conversion";

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, data } = e.data;
  console.log("[Worker] Message received:", type);

  try {
    if (type === "load") {
      console.log("[Worker] Starting FFmpeg load");
      await loadFFmpeg();
      console.log("[Worker] FFmpeg load completed, sending loaded message");
    } else if (type === "convert" && data) {
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
