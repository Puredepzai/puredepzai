# Changelog

All notable changes to the NoBlur project are documented in this file.

## [2.0.0] - 2026-06-16

### Added
- **TikTok Frame Density Bypass:** Non-Interpolation path inflates the MP4 sample table — a clip is rewritten to declare more virtual frames (real samples kept + dummy 8-byte samples whose chunk offsets point to a safe padding region at EOF). TikTok detects this as high-density content and skips heavy recompression, preserving original visual quality.
- **Selectable Density Multiplier (5x default):** The inflation multiplier is configurable. 5x is the confirmed sweetspot — it passes TikTok compression while keeping the dummy-frame tail (and the brief end-of-video freeze) short. 10x also works but produces a longer freeze.
- **Output Resolution Selector (1080p / 2K):** Output can be scaled to 1080p or 2K (1440p) via a UI dropdown. Bitrate auto-scales with resolution — 1080p uses 14261k, 2K uses 25000k. Both confirmed to bypass TikTok compression.
- **Modular Binary Patching Architecture:** Extracted all MP4 binary patching functions from `app.js` into four dedicated ES modules under `src/`:
  - `src/mp4-boxes.mjs` — core box parsing, size update, chunk offset helpers
  - `src/mp4-patches.mjs` — edts/elst rebuild, mvhd matrix patch
  - `src/mp4-strip.mjs` — udta strip, comment udta injection, tkhd matrix reset
  - `src/mp4-inflate.mjs` — sample table inflation (Frame Density Bypass)
- **7-Pass Non-Interpolation Pipeline:** Expanded from 3 passes to 7 passes:
  1. FFmpeg container reencode (libx264, CBR, aac 250k, timescale 90000)
  2. ZeroLoss Track Bypass (edts/elst with video mediaTime offset 6000)
  3. Quantum Matrix Patch (mvhd matrix_b)
  4. Udta Strip (removes FFmpeg encoder tag)
  5. Tkhd Matrix Reset (identity matrix on all tracks)
  6. Frame Density Inflation (sample table expansion)
  7. Comment Udta Injection (Apple iTunes-style ©cmt tag)
- **Aligned Interpolation Pipeline:** The 60fps VFI path now shares the same metadata treatment — timescale 90000, AAC 250k audio, udta strip, tkhd matrix reset, and comment udta injection (frame density inflation is skipped since VFI already produces real high-fps frames).
- **H.264 Output Profile:** Switched Non-Interpolation encoder from libx265 CRF 18 to libx264 CBR, Main profile Level 4.2, matching the reference output profile that bypasses TikTok compression.
- **MP4 Container Dimension Parser:** Added `getDimensionsFromMp4Container` to read video width/height/rotation directly from the `tkhd` box binary, fixing orientation errors on HEVC/H.265 inputs and videos with rotation metadata.
- **Output Thumbnail Capture:** History thumbnails are now captured from the processed output buffer instead of the original input file, fixing blank thumbnails on HEVC and rotated video inputs.
- **Screen Wake Lock:** The screen stays awake during processing on supported mobile browsers, re-acquiring the lock when the tab regains visibility.
- **Upload to TikTok Studio Button:** Added a direct link to TikTok Studio web upload, with a mobile-only modal guiding users to enable desktop mode first.

### Changed
- **Non-Interpolation Output Format:** Replaced libx265 CRF encoding with libx264 CBR pipeline. Output is now H.264 Main@L4.2 with standard timescale, matching professionally encoded reference files.
- **Rotation Handling:** Removed `-noautorotate` FFmpeg flag. FFmpeg now bakes rotation metadata into pixel data during encode, producing correctly oriented output.
- **stsc Patch for Multi-FPS Inputs:** `inflateSampleTableVideo` now also patches the `stsc` (Sample-to-Chunk) table by appending a terminal entry `{first_chunk: origCount+1, spc: 1}` to prevent sample count mismatches on 60fps and variable-fps inputs.
- **UI Copy & Layout:** Updated header subtitle and system stats to reflect the re-encode + frame density engine; fixed tablet (901-1100px) three-column layout and `stat-value-small` text overflow on mobile.

### Fixed
- **Audio Corruption After Inflation:** Fixed critical bug where audio chunk offsets were not shifted after moov expansion during sample table inflation, causing audio decode failures on all inflated files.
- **Portrait/Landscape Detection for HEVC:** Browser `<video>` cannot decode HEVC on most platforms, causing it to report 0×0 or wrong dimensions. Container-level dimension parsing now correctly identifies orientation for HEVC inputs.

## [1.4.0] - 2026-06-16

### Added
- **Adaptive Rotation Scaling:** Interpolation OFF path now detects video orientation and applies adaptive scaling — landscape videos scale to height 1080px, portrait videos scale to width 1080px, preserving aspect ratio without black padding bars.
- **Full 3-Pass Pipeline for Non-VFI:** Extended the interpolation OFF path from 1-pass to 3-pass architecture, adding ZeroLoss Track Bypass (edts/elst atom patching) and Quantum Matrix (mvhd display matrix) after FFmpeg re-encoding, matching the VFI path's completeness.

### Changed
- **Container Reencode (Pass 1/3):** Clarified terminology — the FFmpeg pass performs re-encoding (`-c:v libx265`), not remuxing, to accurately reflect the transcode operation.

## [1.3.0] - 2026-06-15

### Changed
- **FFmpeg-Native Container Reencode:** Added FFmpeg.wasm re-encoding pass using libx265 with CRF 18, bitstream filters `setts=ts='2*TS'` on both video and audio tracks, and full metadata strip for the interpolation OFF path.
- **Video Timing Normalization:** Uses `-bsf:v setts=ts='2*TS'` to double all video presentation timestamps, converting 60fps source to 30fps playback (2x slow-motion).
- **Audio Timing Normalization:** Uses `-bsf:a setts=ts='2*TS'` to double all audio timestamps, synchronizing audio duration with the re-encoded video duration.
- **Metadata Strip:** Uses `-map_metadata -1` to strip all source metadata including GPS location, device identifiers, Android version, and capture frame rate tags.
- **Track Timescale Lock:** Uses `-video_track_timescale 90000` to normalize the video track timescale to the standard 90kHz value.
- **VFI Path Preserved:** The 60fps VFI interpolation path (enabled via checkbox) retains the original ZeroLoss + Quantum Matrix pipeline as before.

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
