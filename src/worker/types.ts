export interface WorkerMessage {
  type: "load" | "convert";
  data?: {
    videoData?: Uint8Array;
    videoName?: string;
  };
}

export interface WorkerResponse {
  type: "loaded" | "progress" | "complete" | "error";
  data?: unknown;
}
