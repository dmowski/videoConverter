# Video Converter 🎬

A **client-side video converter** that transforms videos to WebM format (VP8 codec) directly in your browser—no server upload required.

## Features ✨

- **100% Client-Side Processing** - All video conversion happens in your browser using WebAssembly
- **No Server Upload** - Your videos never leave your device
- **Drag & Drop Upload** - Intuitive file selection with visual feedback
- **Real-Time Progress** - Visual progress bar with percentage and phase indicators
- **ETA Display** - Estimated time remaining during conversion
- **Accessibility First** - ARIA labels, live regions, and keyboard navigation
- **File Validation** - 500MB size limit with user-friendly error messages
- **Error Recovery** - Helpful hints for troubleshooting conversion failures
- **VP8 Video Codec** - Efficient compression with wide browser support

## Tech Stack 🛠️

- **Frontend Framework:** TypeScript + Vite
- **Video Processing:** [FFmpeg.wasm](https://ffmpeg.org/ffmpeg.js/) (v0.12.6)
- **Styling:** Tailwind CSS v4 with PostCSS
- **Testing:** Playwright E2E tests
- **Code Quality:** ESLint 9 + Prettier + TypeScript strict mode
- **Package Manager:** npm

## Getting Started 🚀

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd videoConverter

# Install dependencies
npm install
```

### Development

Start the dev server with hot module reloading:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building

Create a production build:

```bash
npm run build
```

The optimized files will be in the `dist/` directory.

### Testing

Run end-to-end tests with Playwright:

```bash
# Run all tests
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui

# Run tests with browser visible
npm run test:e2e:headed
```

**Test Status:** ✅ 15 tests passing, 3 skipped

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## Usage 📖

1. **Upload Video** - Click the drop zone or drag & drop a video file
2. **Preview** - View the original video and its metadata
3. **Convert** - Click "Convert to WebM (VP9)" button
4. **Progress** - Watch the real-time progress bar and ETA
5. **Download** - Download the converted WebM file when complete

### Supported Input Formats

- MP4, AVI, MOV, MKV, FLV, WMV, WebM, and most video formats supported by FFmpeg

### Output Format

- **Container:** WebM
- **Video Codec:** VP8
- **Audio:** Removed (video-only output)
- **Resolution:** Original resolution maintained

## Architecture 🏗️

### Project Structure

```
videoConverter/
├── src/
│   ├── main.ts                 # Application entry point
│   ├── converter.ts            # VideoConverter class (main orchestrator)
│   ├── conversionManager.ts    # Conversion progress & state management
│   ├── fileHandler.ts          # File validation & formatting
│   ├── style.css               # Tailwind directives
│   ├── worker.ts               # Web Worker entry point
│   ├── worker/
│   │   ├── types.ts            # Worker message interfaces
│   │   ├── state.ts            # FFmpeg instance state
│   │   ├── ffmpegLoader.ts     # FFmpeg initialization (local service)
│   │   └── conversion.ts       # Video conversion logic
│   └── ui/                     # Modular UI components
│       ├── elements.ts         # DOM element references
│       ├── buttons.ts          # Button state management
│       ├── progress.ts         # Progress bar updates
│       ├── errors.ts           # Error display
│       ├── dropZone.ts         # Drag-drop styling
│       ├── sections.ts         # Section visibility
│       └── videoInfo.ts        # Video metadata display
├── public/
│   └── ffmpeg/                 # FFmpeg.wasm core files (local service)
│       ├── ffmpeg-core.js      # JavaScript bindings (~112KB)
│       └── ffmpeg-core.wasm    # WebAssembly binary (~31MB)
├── tests/
│   └── e2e/                    # Playwright e2e tests
├── index.html                  # Main HTML file
├── vite.config.ts              # Vite + PostCSS configuration
├── tsconfig.json               # TypeScript configuration
├── playwright.config.ts        # Playwright configuration
└── eslint.config.js            # ESLint rules
```

### Key Components

**VideoConverter** (`src/converter.ts`)

- Manages the Web Worker lifecycle
- Handles initialization and conversion messaging
- Provides cancel functionality

**FFmpegLoader** (`src/worker/ffmpegLoader.ts`)

- Loads FFmpeg.wasm from local service (`/public/ffmpeg/`) with blob URL resolution
- Manages initialization state and timeouts
- Reports progress events
- Works in both development and production environments

**ConversionManager** (`src/conversionManager.ts`)

- Orchestrates the conversion workflow
- Calculates and displays progress phases
- Computes ETA based on processing speed
- Provides user-friendly error hints

**UI Modules** (`src/ui/`)

- Modular components for maintainability
- Handles all DOM updates and accessibility
- Barrel export pattern for clean imports

## Performance Notes ⚡

- **FFmpeg Loading:** ~5-10 seconds on first load (cached by browser)
  - Served from local service (`/public/ffmpeg/`) - no CDN latency
  - ~31MB WASM binary cached after first access
- **Conversion Speed:** Depends on video size and device (typical: 30-60 seconds for 5-second test video)
- **Memory Efficient:** Uses Web Workers to keep UI responsive
- **SharedArrayBuffer:** Enabled via COOP/COEP headers for optimal performance
- **Offline Ready:** Works offline after first FFmpeg load (WASM files cached locally)

## Browser Support 🌐

- Chrome/Chromium 91+
- Firefox 79+
- Safari 15+
- Edge 91+

_Requires WebAssembly and Web Worker support_

## Implementation Phases ✅

- **Phase 1:** ✅ Project setup with core UI
- **Phase 2:** ✅ FFmpeg.wasm integration and video conversion
- **Phase 3:** ✅ UX enhancements (drag-drop, progress, accessibility)
- **Phase 4:** 🔧 Performance optimization and edge cases

## Known Limitations ⚠️

- **500MB File Limit** - Browser memory constraints
- **Video-Only Output** - Audio streams are removed
- **VP8 Codec** - Fixed codec (no quality/bitrate options)
- **Single File** - One conversion at a time

## Troubleshooting 🔧

### "FFmpeg is not loaded" Error

- Ensure you have internet connection (FFmpeg loads from CDN first time)
- Check browser console for CORS or network errors
- Try a different browser

### Slow Conversion

- Reduce video resolution before uploading
- Close other browser tabs/applications
- Try with a smaller test video first

### File Size Exceeds Limit

- Reduce video resolution or trim duration in another editor
- Maximum supported size is 500MB

## Development Notes 📝

### Adding New Features

1. **UI Changes:** Add to appropriate module in `src/ui/`
2. **Worker Logic:** Update `src/worker/conversion.ts`
3. **Validation:** Add to `src/fileHandler.ts`
4. **Tests:** Create spec in `tests/e2e/`

### Code Style

- TypeScript with strict mode
- ESLint enforced on build
- Prettier formatting required
- No console warnings in production

## Contributing 🤝

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License 📄

MIT License - See LICENSE file for details

## Resources 🔗

- [FFmpeg.wasm Documentation](https://github.com/ffmpegwasm/ffmpeg.wasm)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Playwright Testing](https://playwright.dev/)

---

**Status:** Production Ready | **Last Updated:** February 2026
