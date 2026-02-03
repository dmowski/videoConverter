# Video Converter - Implementation Plan

## Overview

Client-side video converter application that converts uploaded videos to WebM format (VP9 codec) using FFmpeg.wasm, with no backend required.

## Target Conversion Parameters

```bash
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 32 -b:v 0 -pix_fmt yuv420p -an output.webm
```

Parameters breakdown:

- `-c:v libvpx-vp9`: VP9 video codec
- `-crf 32`: Constant Rate Factor (quality level, 0-63, higher = smaller file/lower quality)
- `-b:v 0`: Allow CRF to control bitrate
- `-pix_fmt yuv420p`: Pixel format for compatibility
- `-an`: Remove audio

## Technology Stack

### Core Technologies

- **FFmpeg.wasm**: WebAssembly port of FFmpeg for browser-based video processing
- **TypeScript**: Type-safe application logic
- **Tailwind CSS**: Utility-first CSS framework for responsive, maintainable UI
- **Vite**: Build tool and dev server with HMR
- **Web Workers**: Run FFmpeg processing in background thread to avoid blocking UI
- **HTML5**: File input, drag & drop, and video preview APIs

### Testing

- **Playwright**: E2E testing framework
- **Test video files**: Sample MP4 files for testing
- **Assertions**: Verify WebM output format, codec, and file properties

## Architecture

### Component Structure

```
videoConverter/
├── src/
│   ├── main.ts                 # Entry point
│   ├── converter.ts            # FFmpeg.wasm wrapper
│   ├── ui.ts                   # UI management
│   └── worker.ts               # Web Worker for conversion
├── public/
│   └── test-videos/            # Sample videos for manual testing
├── tests/
│   ├── e2e/
│   │   ├── conversion.spec.ts  # E2E tests
│   │   └── fixtures/
│   │       └── sample.mp4      # Test video fixture
├── index.html
├── package.json
├── vite.config.ts
├── playwright.config.ts
└── tsconfig.json
```

### Core Components

#### 1. Converter Module (`converter.ts`)

- Initialize FFmpeg.wasm
- Load FFmpeg core files
- Execute conversion with specified parameters
- Handle progress events
- Return converted file

#### 2. UI Module (`ui.ts`)

- File input handler
- Drag & drop support
- Progress bar display
- Preview original video
- Download converted video
- Error handling and user feedback

#### 3. Web Worker (`worker.ts`)

- Run FFmpeg conversion in background thread
- Communicate progress to main thread
- Prevent UI blocking during conversion

#### 4. Main Application (`main.ts`)

- Initialize application
- Coordinate between UI and converter
- Handle application state

## Implementation Steps (Test-Driven Approach)

### Phase 1: Project Setup + Basic E2E Infrastructure

**Implementation:**

1. ✅ Initialize Vite + TypeScript project
2. ✅ Install dependencies:
   - `@ffmpeg/ffmpeg` - FFmpeg.wasm library
   - `@ffmpeg/util` - Utility functions
   - `tailwindcss` - CSS framework
   - `autoprefixer` & `postcss` - CSS processing
   - `@playwright/test` - E2E testing framework
3. ✅ Configure TypeScript for proper module resolution
4. ✅ Setup Tailwind CSS with Vite
5. ✅ Setup basic HTML structure with Tailwind classes
6. ✅ Configure Playwright with proper browsers

**E2E Tests (Phase 1):**

- ✅ `setup.spec.ts`: Verify app loads successfully
- ✅ `setup.spec.ts`: Verify page title and basic structure
- ✅ `setup.spec.ts`: Verify file input element exists
- ✅ `setup.spec.ts`: Verify all required UI elements are present

**Validation:** App loads without errors, basic UI is rendered

---

### Phase 2: Core Functionality + Conversion E2E

**Implementation:**

1. **FFmpeg Integration**
   - Load FFmpeg.wasm in Web Worker
   - Implement conversion function with exact parameters
   - Handle memory management (important for large videos)
   - Add progress tracking

2. **File Upload UI**
   - Create file input with drag & drop
   - Add file validation (video types, size limits)
   - Display original video preview
   - Show file metadata (size, duration, format)

3. **Conversion Process**
   - Transfer file to Web Worker
   - Execute FFmpeg command
   - Stream progress updates to UI
   - Return converted file

4. **Download Handler**
   - Generate blob URL for converted file
   - Trigger automatic download
   - Cleanup memory

**E2E Tests (Phase 2):**

- ✅ `file-upload.spec.ts`: Upload valid MP4 file
- ✅ `file-upload.spec.ts`: Verify file preview appears
- ✅ `file-upload.spec.ts`: Verify file metadata displayed
- ✅ `conversion.spec.ts`: Upload and convert small video (5-10 sec)
- ✅ `conversion.spec.ts`: Wait for conversion completion
- ✅ `conversion.spec.ts`: Verify download button appears
- ✅ `conversion.spec.ts`: Download converted file
- ✅ `video-validation.spec.ts`: Validate WebM container format
- ✅ `video-validation.spec.ts`: Verify VP9 codec in output
- ✅ `video-validation.spec.ts`: Verify no audio stream
- ✅ `video-validation.spec.ts`: Verify pixel format is yuv420p
- ✅ `video-validation.spec.ts`: Compare output with expected FFmpeg parameters

**Validation:** Video converts successfully with correct codec and parameters

---

### Phase 3: User Experience + UX E2E

**Implementation:**

1. **Progress Indication**
   - Progress bar with percentage
   - Estimated time remaining
   - Current processing phase

2. **Error Handling**
   - File validation errors
   - Conversion errors
   - Memory errors
   - User-friendly error messages

3. **UI/UX Polish**
   - Responsive design with Tailwind breakpoints
   - Modern card-based layout
   - Loading states with animations
   - Toast notifications for success/error
   - Cancel conversion option
   - Dark mode support (optional)
   - Accessible UI components (ARIA labels)

**E2E Tests (Phase 3):**

- ✅ `progress.spec.ts`: Verify progress bar appears during conversion
- ✅ `progress.spec.ts`: Verify progress percentage updates
- ✅ `progress.spec.ts`: Verify progress reaches 100%
- ✅ `error-handling.spec.ts`: Upload invalid file type (e.g., .txt)
- ✅ `error-handling.spec.ts`: Verify error message displayed
- ✅ `error-handling.spec.ts`: Upload corrupted video file
- ✅ `error-handling.spec.ts`: Verify graceful error handling
- ✅ `error-handling.spec.ts`: Verify user can recover and try again
- ✅ `drag-drop.spec.ts`: Test drag & drop file upload
- ✅ `drag-drop.spec.ts`: Verify drag over visual feedback
- ✅ `cancel.spec.ts`: Start conversion and cancel mid-process
- ✅ `cancel.spec.ts`: Verify resources are cleaned up
- ✅ `responsive.spec.ts`: Test on mobile viewport
- ✅ `responsive.spec.ts`: Test on tablet viewport
- ✅ `responsive.spec.ts`: Test on desktop viewport
- ✅ `accessibility.spec.ts`: Verify keyboard navigation
- ✅ `accessibility.spec.ts`: Verify ARIA labels present
- ✅ `accessibility.spec.ts`: Verify screen reader compatibility

**Validation:** Full user flow works smoothly with proper error handling

---

### Phase 4: Performance & Edge Cases + Comprehensive E2E

**Implementation:**

1. **Performance Optimization**
   - Test with various file sizes
   - Optimize memory usage
   - Add file size warnings

2. **Edge Case Handling**
   - Very large files (500MB+)
   - Very short videos (<1 sec)
   - Different video codecs/containers
   - High resolution videos (4K)

**E2E Tests (Phase 4):**

- ✅ `large-files.spec.ts`: Upload and convert 50MB video
- ✅ `large-files.spec.ts`: Upload and convert 100MB video
- ✅ `large-files.spec.ts`: Verify memory doesn't exceed browser limits
- ✅ `large-files.spec.ts`: Verify warning for very large files
- ✅ `edge-cases.spec.ts`: Convert very short video (1 second)
- ✅ `edge-cases.spec.ts`: Convert different input formats (AVI, MOV, MKV)
- ✅ `edge-cases.spec.ts`: Convert high resolution video (1080p, 4K)
- ✅ `edge-cases.spec.ts`: Convert video with unusual aspect ratio
- ✅ `browser-compat.spec.ts`: Run all tests in Chromium
- ✅ `browser-compat.spec.ts`: Run all tests in Firefox
- ✅ `browser-compat.spec.ts`: Run all tests in WebKit
- ✅ `performance.spec.ts`: Measure conversion time for various sizes
- ✅ `performance.spec.ts`: Verify no memory leaks after multiple conversions
- ✅ `performance.spec.ts`: Test consecutive conversions

**Validation:** App handles all edge cases and performs well across browsers

---

### Test Utilities (Created Throughout)

- `fixtures/` - Sample video files of various sizes/formats
- `helpers/video-validator.ts` - WebM/VP9 validation utilities
- `helpers/file-generator.ts` - Generate test video files
- `helpers/performance-monitor.ts` - Track memory and timing

## Testing Strategy

### Test-Driven Development Approach

Each implementation phase includes corresponding E2E tests to validate functionality immediately. Tests are written and validated before moving to the next phase.

### E2E Test Coverage

- **Phase 1**: Basic app loading and UI structure (4 tests)
- **Phase 2**: Core conversion functionality and validation (11 tests)
- **Phase 3**: User experience and error handling (15 tests)
- **Phase 4**: Performance and edge cases (14 tests)
- **Total**: 44+ E2E tests covering all critical paths

### Test Utilities

```typescript
// helpers/video-validator.ts
export async function validateWebMFile(buffer: ArrayBuffer) {
  // Check WebM signature (0x1A, 0x45, 0xDF, 0xA3)
  const view = new DataView(buffer);
  const isWebM = view.getUint32(0) === 0x1a45dfa3;

  // Parse EBML structure for codec info
  const codecInfo = parseEBMLCodec(buffer);

  return {
    isWebM,
    codec: codecInfo.videoCodec, // Should be 'V_VP9'
    hasAudio: codecInfo.hasAudio, // Should be false
    pixelFormat: codecInfo.pixelFormat, // Should be yuv420p
  };
}

// helpers/file-generator.ts
export async function generateTestVideo(duration: number, resolution: string): Promise<File> {
  // Generate or load test video file
}

// helpers/performance-monitor.ts
export class PerformanceMonitor {
  startMemory: number;
  startTime: number;

  start() {
    /* Track memory and time */
  }
  stop() {
    /* Return metrics */
  }
}
```

### Continuous Validation

After each phase, all previous tests must still pass to ensure no regressions. - Verify preview functionality

- **Test 5: Large File Handling**
  - Upload larger video file (50MB+)
  - Verify memory doesn't exceed limits
  - Verify conversion completes

3. **Video Validation Utilities**
   - Create helper to read WebM container
   - Extract codec information
   - Verify video properties match expected output

## Technical Considerations

### FFmpeg.wasm Specifics

- **SharedArrayBuffer**: Required for multi-threading (needs proper COOP/COEP headers)
- **Memory Limits**: Browser-based, typically 2GB max
- **Performance**: Slower than native FFmpeg (2-5x), but acceptable for client-side
- **Browser Support**: Modern browsers (Chrome 87+, Firefox 79+, Safari 15.2+)

### Security Headers (for dev server)

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

### File Size Recommendations

- Suggest max upload size (e.g., 500MB)
- Warn users about processing time for large files
- Implement file size validation

### Browser Compatibility

- Primary: Chrome/Edge (best performance)
- Secondary: Firefox, Safari
- Fallback message for unsupported browsers

## Testing Strategy

### Test-Driven Development Approach

Each implementation phase includes corresponding E2E tests to validate functionality immediately. Tests are written and validated before moving to the next phase.

### E2E Test Coverage

- **Phase 1**: Basic app loading and UI structure (4 tests)
- **Phase 2**: Core conversion functionality and validation (11 tests)
- **Phase 3**: User experience and error handling (15 tests)
- **Phase 4**: Performance and edge cases (14 tests)
- **Total**: 44+ E2E tests covering all critical paths

### Test Utilities

```typescript
// helpers/video-validator.ts
export async function validateWebMFile(buffer: ArrayBuffer) {
  // Check WebM signature (0x1A, 0x45, 0xDF, 0xA3)
  const view = new DataView(buffer);
  const isWebM = view.getUint32(0) === 0x1a45dfa3;

  // Parse EBML structure for codec info
  const codecInfo = parseEBMLCodec(buffer);

  return {
    isWebM,
    codec: codecInfo.videoCodec, // Should be 'V_VP9'
    hasAudio: codecInfo.hasAudio, // Should be false
    pixelFormat: codecInfo.pixelFormat, // Should be yuv420p
  };
}

// helpers/file-generator.ts
export async function generateTestVideo(duration: number, resolution: string): Promise<File> {
  // Generate or load test video file
}

// helpers/performance-monitor.ts
export class PerformanceMonitor {
  startMemory: number;
  startTime: number;

  start() {
    /* Track memory and time */
  }
  stop() {
    /* Return metrics */
  }
}
```

### Continuous Validation

After each phase, all previous tests must still pass to ensure no regressions.

## Performance Optimization

1. **Web Worker**: Prevent UI blocking
2. **Chunked Processing**: For very large files
3. **Memory Cleanup**: Explicitly free resources
4. **SharedArrayBuffer**: Enable multi-threading if possible
5. **Progressive Loading**: Stream output if feasible

## Deliverables

1. ✅ Working web application
2. ✅ Clean, documented code
3. ✅ E2E test suite with >80% coverage
4. ✅ README with usage instructions
5. ✅ Build configuration for production deployment

## Deployment Considerations

- Static hosting (Netlify, Vercel, GitHub Pages)
- Ensure COOP/COEP headers are set
- CDN for FFmpeg core fiExtensibility Ready)
  The architecture supports easy expansion for:
- **Multiple output formats** (H.264/MP4, AV1, etc.)
- **Custom quality settings** (CRF slider, bitrate control)
- **Batch conversion** (queue system)
- **Video trimming/editing** (start/end time selection)
- \*\*Audio codec optio (with E2E tests per phase)
- Phase 1: Project Setup + E2E Infrastructure: 2-3 hours
- Phase 2: Core Functionality + Conversion E2E: 6-8 hours
- Phase 3: User Experience + UX E2E: 4-5 hours
- Phase 4: Performance + Edge Cases E2E: 4-5 hours
- **Total: 16-21e integration** (Google Drive, Dropbox)

**Design Decisions for Extensibility:**

- Modular converter architecture allows adding new codecs/formats
- UI component structure supports adding new controls/options
- Configuration-driven FFmpeg parameters
- Plugin system for custom processing pipelines
- Video trimming/editing
- Audio codec options
- Subtitle support

## Estimated Timeline

- Phase 1: 1-2 hours
- Phase 2: 4-6 hours
- Phase 3: 2-3 hours
- Phase 4: 3-4 hours
- **Total: 10-15 hours**

## Success Criteria

✅ User can upload MP4 video  
✅ Video converts to WebM with VP9 codec  
✅ Conversion matches FFmpeg command parameters exactly  
✅ Download works correctly  
✅ All 44+ E2E tests pass with 100% success rate across phases  
✅ Each phase validated before moving to next  
✅ No backend/server required  
✅ Works in major browsers (Chrome, Firefox, Safari)  
✅ No regressions between phases
