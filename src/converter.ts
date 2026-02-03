export interface ConversionProgress {
  progress: number;
  time?: number;
}

export interface ConversionResult {
  videoData: Uint8Array;
  videoName: string;
}

export class VideoConverter {
  private worker: Worker | null = null;
  private onProgress?: (progress: ConversionProgress) => void;
  private onComplete?: (result: ConversionResult) => void;
  private onError?: (error: string) => void;
  private loadedResolve?: () => void;
  private loadedReject?: (error: Error) => void;
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    this.worker = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });

    this.worker.onmessage = (e) => {
      const { type, data } = e.data;

      switch (type) {
        case "loaded":
          console.log("FFmpeg loaded successfully");
          this.isLoaded = true;
          if (this.loadedResolve) {
            this.loadedResolve();
            this.loadedResolve = undefined;
          }
          break;
        case "progress":
          if (this.onProgress) {
            this.onProgress(data);
          }
          break;
        case "complete":
          if (this.onComplete) {
            this.onComplete(data);
          }
          break;
        case "error":
          console.error("[VideoConverter] Error:", data.message);
          if (!this.isLoaded && this.loadedReject) {
            // Loading error
            console.error("[VideoConverter] Loading error");
            this.loadedReject(new Error(data.message));
            this.loadedReject = undefined;
          } else if (this.onError) {
            // Conversion error
            console.error("[VideoConverter] Conversion error");
            this.onError(data.message);
          }
          break;
      }
    };

    this.worker.onerror = (error) => {
      console.error("[Worker Error]:", error);
      if (!this.isLoaded && this.loadedReject) {
        console.error("[Worker Error] During load phase");
        this.loadedReject(error instanceof Error ? error : new Error(String(error)));
        this.loadedReject = undefined;
      } else if (this.onError) {
        console.error("[Worker Error] During conversion phase");
        this.onError("Worker error: " + (error instanceof Error ? error.message : String(error)));
      }
    };
  }

  async load() {
    // If already loading, return the same promise
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // Create the load promise
    this.loadPromise = new Promise<void>((resolve, reject) => {
      if (!this.worker) {
        reject(new Error("Worker not initialized"));
        return;
      }

      this.loadedResolve = resolve;
      this.loadedReject = reject;

      // Set a timeout in case FFmpeg doesn't load
      const timeout = setTimeout(() => {
        this.loadedResolve = undefined;
        this.loadedReject = undefined;
        this.loadPromise = null;
        reject(new Error("FFmpeg loading timed out"));
      }, 30000);

      // Override resolvers to clear timeout
      const originalResolve = resolve;
      this.loadedResolve = () => {
        clearTimeout(timeout);
        this.loadedResolve = undefined;
        this.loadedReject = undefined;
        originalResolve();
      };

      const originalReject = reject;
      this.loadedReject = (error: Error) => {
        clearTimeout(timeout);
        this.loadedResolve = undefined;
        this.loadedReject = undefined;
        this.loadPromise = null;
        originalReject(error);
      };

      this.worker.postMessage({ type: "load" });
    });

    return this.loadPromise;
  }

  async convert(
    file: File,
    onProgress: (progress: ConversionProgress) => void,
    onComplete: (result: ConversionResult) => void,
    onError: (error: string) => void,
  ) {
    // CRITICAL: Wait for FFmpeg to be loaded before converting
    try {
      if (!this.isLoaded && this.loadPromise) {
        console.log("[VideoConverter] Waiting for FFmpeg to load before converting...");
        await this.loadPromise;
      } else if (!this.isLoaded) {
        throw new Error("FFmpeg is not loaded");
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to load FFmpeg";
      console.error("[VideoConverter] Convert waiting for load failed:", errorMsg);
      onError(errorMsg);
      return;
    }

    this.onProgress = onProgress;
    this.onComplete = onComplete;
    this.onError = onError;

    if (!this.worker) {
      onError("Worker not initialized");
      return;
    }

    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const videoData = new Uint8Array(arrayBuffer);

      // Send to worker
      this.worker.postMessage({
        type: "convert",
        data: {
          videoData,
          videoName: file.name,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to read file";
      onError(errorMessage);
    }
  }

  destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }

  cancel() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    this.isLoaded = false;
    this.loadPromise = null;
    this.loadedResolve = undefined;
    this.loadedReject = undefined;

    this.initWorker();
  }
}
