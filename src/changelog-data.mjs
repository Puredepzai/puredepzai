export const changelogData = [
  {
    "version": "2.0.0",
    "date": "2026-06-16",
    "changes": [
      "Non-Interpolation path inflates the MP4 sample table — a clip is rewritten to declare more virtual frames (real samples kept + dummy 8-byte samples whose chunk offsets point to a safe padding region at EOF). TikTok detects this as high-density content and skips heavy recompression, preserving original visual quality.",
      "The inflation multiplier is configurable. 5x is the confirmed sweetspot — it passes TikTok compression while keeping the dummy-frame tail (and the brief end-of-video freeze) short. 10x also works but produces a longer freeze.",
      "Output can be scaled to 1080p or 2K (1440p) via a UI dropdown. Bitrate auto-scales with resolution — 1080p uses 14261k, 2K uses 25000k. Both confirmed to bypass TikTok compression.",
      "Extracted all MP4 binary patching functions from `app.js` into four dedicated ES modules under `src/`.",
      "Expanded from 3 passes to 7 passes.",
      "The 60fps VFI path now shares the same metadata treatment — timescale 90000, AAC 250k audio, udta strip, tkhd matrix reset, and comment udta injection.",
      "Switched Non-Interpolation encoder from libx265 CRF 18 to libx264 CBR, Main profile Level 4.2, matching the reference output profile that bypasses TikTok compression.",
      "Added `getDimensionsFromMp4Container` to read video width/height/rotation directly from the `tkhd` box binary.",
      "History thumbnails are now captured from the processed output buffer instead of the original input file.",
      "The screen stays awake during processing on supported mobile browsers.",
      "Added a direct link to TikTok Studio web upload, with a mobile-only modal guiding users to enable desktop mode first.",
      "Replaced libx265 CRF encoding with libx264 CBR pipeline.",
      "Removed `-noautorotate` FFmpeg flag. FFmpeg now bakes rotation metadata into pixel data during encode.",
      "Updated header subtitle and system stats to reflect the re-encode + frame density engine.",
      "Fixed critical bug where audio chunk offsets were not shifted after moov expansion during sample table inflation.",
      "Container-level dimension parsing now correctly identifies orientation for HEVC inputs."
    ]
  },
  {
    "version": "1.4.0",
    "date": "2026-06-16",
    "changes": [
      "Interpolation OFF path now detects video orientation and applies adaptive scaling.",
      "Extended the interpolation OFF path from 1-pass to 3-pass architecture.",
      "Clarified terminology — the FFmpeg pass performs re-encoding, not remuxing."
    ]
  },
  {
    "version": "1.3.0",
    "date": "2026-06-15",
    "changes": [
      "Added FFmpeg.wasm re-encoding pass using libx265 with CRF 18.",
      "Uses `setts=ts='2*TS'` to convert 60fps source to 30fps playback.",
      "Synchronizes audio duration with the re-encoded video duration.",
      "Strips all source metadata including GPS location, device identifiers.",
      "Normalizes the video track timescale to the standard 90kHz value.",
      "The 60fps VFI interpolation path retains the original ZeroLoss + Quantum Matrix pipeline."
    ]
  },
  {
    "version": "1.2.0",
    "date": "2026-05-26",
    "changes": [
      "Dynamically writes version 1 `elst` boxes with 64-bit track durations.",
      "Visible log alerts inside `addFiles` for duplicate files.",
      "Matches output encoder/codec properties with the detected input codec.",
      "Upgraded from linear blending to bilateral motion-compensated interpolation.",
      "Integrated `mpdecimate` filters to drop duplicate frames prior to interpolation.",
      "Instant termination of active WebAssembly worker threads on cancellation.",
      "Skips display matrix patching if a non-identity matrix is present.",
      "Corrected input codec detection to target exact video stream logs.",
      "Cursor-based IndexedDB storage footprint calculation."
    ]
  },
  {
    "version": "1.1.0",
    "date": "2026-05-25",
    "changes": [
      "Client-side video frame rate interpolation using Web Worker-based FFmpeg.wasm.",
      "Cross-origin isolation natively on localhost.",
      "Explicitly releases `<video>` memory to prevent tab crashes.",
      "Strict timeout limits to prevent hangs on corrupted media files.",
      "Proactive cleanup sequence for sticky service worker headers.",
      "Added `try-catch` resetting to safely reboot the FFmpeg engine on crash.",
      "Dynamic portrait/landscape aspect-ratio Full HD boundaries.",
      "Replaced insecure dynamic indexing with explicit store references."
    ]
  },
  {
    "version": "1.0.0",
    "date": "2026-05-24",
    "changes": [
      "NoBlur premium container patch utility.",
      "Automated metadata parsing injecting `edts`/`elst` atom hierarchy.",
      "Big-endian integer manipulation patching the `mvhd` display matrix.",
      "Premium high-contrast dark card interface with flat offset shadows.",
      "IndexedDB local history tracking with 12-hour pruning and 200MB limit."
    ]
  }
];
