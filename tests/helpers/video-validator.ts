/**
 * Video validation utilities for E2E tests
 * Validates WebM container format and VP8/VP9 codec
 */

export interface VideoValidationResult {
  isWebM: boolean;
  hasVP8Codec: boolean;
  hasVP9Codec: boolean;
  hasAudio: boolean;
  errors: string[];
}

/**
 * Parse EBML (Extensible Binary Meta Language) structure
 * WebM is based on Matroska which uses EBML
 */
export async function validateWebMFile(buffer: ArrayBuffer): Promise<VideoValidationResult> {
  const result: VideoValidationResult = {
    isWebM: false,
    hasVP8Codec: false,
    hasVP9Codec: false,
    hasAudio: false,
    errors: [],
  };

  try {
    const view = new DataView(buffer);

    // Check WebM/EBML signature (0x1A45DFA3)
    if (buffer.byteLength < 4) {
      result.errors.push("File too small to be a valid WebM file");
      return result;
    }

    const signature = view.getUint32(0, false);
    if (signature !== 0x1a45dfa3) {
      result.errors.push(`Invalid EBML signature: 0x${signature.toString(16)}`);
      return result;
    }

    result.isWebM = true;

    // Parse EBML elements to find codec info
    // This is a simplified parser - full EBML parsing is complex
    const data = new Uint8Array(buffer);

    // Look for VP8 codec ID: "V_VP8"
    const vp8Pattern = [0x56, 0x5f, 0x56, 0x50, 0x38]; // "V_VP8" in ASCII
    result.hasVP8Codec = searchPattern(data, vp8Pattern);

    // Look for VP9 codec ID: "V_VP9"
    const vp9Pattern = [0x56, 0x5f, 0x56, 0x50, 0x39]; // "V_VP9" in ASCII
    result.hasVP9Codec = searchPattern(data, vp9Pattern);

    // Look for audio codec indicators (common ones)
    const opusPattern = [0x41, 0x5f, 0x4f, 0x50, 0x55, 0x53]; // "A_OPUS"
    const vorbisPattern = [0x41, 0x5f, 0x56, 0x4f, 0x52, 0x42, 0x49, 0x53]; // "A_VORBIS"

    result.hasAudio = searchPattern(data, opusPattern) || searchPattern(data, vorbisPattern);

    if (!result.hasVP8Codec && !result.hasVP9Codec) {
      result.errors.push("VP8 or VP9 codec not detected in file");
    }
  } catch (error) {
    result.errors.push(
      `Validation error: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }

  return result;
}

/**
 * Search for a byte pattern in a Uint8Array
 */
function searchPattern(data: Uint8Array, pattern: number[]): boolean {
  const patternLength = pattern.length;
  const dataLength = data.length;

  for (let i = 0; i <= dataLength - patternLength; i++) {
    let found = true;
    for (let j = 0; j < patternLength; j++) {
      if (data[i + j] !== pattern[j]) {
        found = false;
        break;
      }
    }
    if (found) {
      return true;
    }
  }

  return false;
}

/**
 * Get basic file info
 */
export function getFileInfo(file: File) {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    sizeMB: (file.size / (1024 * 1024)).toFixed(2),
  };
}
