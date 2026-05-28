# Changelog

All notable changes to the NoBlur project are documented in this file.

## [1.2.0] - 2026-05-26

### Added
- **64-Bit Edit List Support:** Upgraded `buildEdtsAtom` to dynamically write version 1 `elst` boxes with 64-bit track durations for huge scale timelines, preventing overflow truncation corruption.
- **Duplicate Upload Warning Notice:** Replaced silent duplicate skips with visible log alerts inside `addFiles` to improve queue feedback.
- **Same-Codec Output Alignment:** Matches output encoder/codec properties directly with the detected input codec, preventing heavy transcode processing burden and maintaining bitrate consistency.
- **Fast Motion-Compensated VFI:** Upgraded the 60FPS interpolator from linear blending to optimized bilateral motion-compensated interpolation (`minterpolate`), delivering smooth optical-flow motion vectors with very low CPU overhead.
- **VFI Workload Lightening:** Integrated `mpdecimate` filters to drop duplicate frames prior to interpolation, drastically lowering CPU processing overhead and accelerating VFI rendering.

### Fixed
- **Active VFI Worker Interruption:** Enabled instant termination of active WebAssembly worker threads and queue halting upon user cancellation.
- **Portrait Video Rotation Protection:** Preserves upright display of phone-recorded portrait videos by skipping display matrix patching if a non-identity matrix is present.
- **Stream-Specific Codec Probing:** Corrected input codec detection to target exact video stream logs, preventing banner text metadata conflicts.
- **Lightweight DB Size Audits:** Implemented cursor-based IndexedDB storage footprint calculation to prevent high RAM spikes from thumbnail loading.

## [1.1.0] - 2026-05-25

### Added
- **60FPS Hybrid Interpolator (Beta):** Integrated client-side video frame rate interpolation using a Web Worker-based FFmpeg.wasm compilation.
- **Vite Dev Server COOP/COEP Headers:** Added server header configuration to native Vite config to enable cross-origin isolation natively on localhost.
- **Hardware Decoder Memory Guard:** Explicitly releases `<video>` memory inside `captureVideoFrame()` and `getVideoDurationAndResolution()` by clearing sources and reloading them on completion to prevent tab crashes.
- **10-Second Metadata Timeout:** Added strict timeout limits inside `getVideoDurationAndResolution()` to prevent hangs on corrupted media files.
- **Loopback Service Worker Bypass:** Proactive `getRegistrations` cleanup sequence inside `coi-serviceworker.js` to automatically clear sticky service worker headers on `127.0.0.1` and `::1`.

### Fixed
- **FFmpeg Crash State Recovery:** Added `try-catch` resetting to runVFI to safely reboot the FFmpeg engine if any encoding crash occurs.
- **Always-Even & Adaptive Full HD Scaling:** Implemented dynamic portrait/landscape aspect-ratio Full HD boundaries (yielding exactly `1080p` base width or height proportionally) to guarantee high-definition adaptive output for all source resolutions.
- **Safe Database Transactions:** Replaced all insecure dynamic indexing references `transaction.objectStore(transaction.objectStoreNames[0])` in `db.js` with explicit `transaction.objectStore(STORE_NAME)` references.
- **File Picker Click-Freeze & UI Relocation:** Removed the flaky `pickerOpen` click-blocking state logic from `dropZone`'s click listener and relocated the 60FPS Hybrid Interpolator box card to be nested right below the system stats card for a highly compact visual flow.
- **Sleek Console Scrollbar:** Customized status log console scrollbar to be extremely thin (`4px`) and dark-themed, matching the visual styles across all browsers.
- **Vite Pre-bundling Exclusions:** Added `@ffmpeg/ffmpeg` and `@ffmpeg/util` to `optimizeDeps.exclude` in `vite.config.js` to prevent Vite from serving broken module workers.
- **Cross-Origin Worker Security Bypass:** Resolved the Same-Origin Policy constraint on GitHub Pages Web Workers by dynamically fetching the self-contained ES module worker bundle (`worker.bundle.mjs` from `esm.sh`) and instantiating it through a local Same-Origin Blob URL wrapper.
- **Unified Lucide Icon Registry:** Fixed runtime console errors where icon names were not found by introducing a unified global icon registry `ALL_ICONS` in `app.js` and passing it to all `createIcons` invocations to guarantee that all dynamically rendered elements resolve their icons successfully.

## [1.0.0] - 2026-05-24

### Added
- **Initial Release:** Developed the NoBlur premium container patch utility.
- **ZeroLoss Track Bypass:** Automated metadata parsing that injects `edts`/`elst` atom hierarchy and recalculates chunk offsets (`stco`/`co64`) to preserve structural alignment.
- **Quantum Matrix Patch:** Big-endian integer manipulation that patches the `mvhd` display matrix `matrix_b` from `0` to `1` in-place.
- **Tactile Neo-Brutalist Layout:** Designed a premium high-contrast dark card interface with flat offset shadows, fluid drag-and-drop queues, and dynamic responsive mobile viewport relocation.
- **Local Persistence Storage:** Implemented secure IndexedDB local history tracking with automated 12-hour pruning and a strict 200MB limit guard.
