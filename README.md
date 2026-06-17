# NoBlur — Post TikTok Videos Without the Blur

NoBlur is a premium, client-side web application that processes MP4 and MOV video containers locally directly in your browser to bypass aggressive server-side recompression when uploading to TikTok. It offers two pipelines: a full re-encode path with MP4 sample-table frame density inflation, and a 60fps VFI interpolation path. The result preserves original quality, visual fidelity, and audio-video synchronization.

All processing is performed client-side using JavaScript, ArrayBuffers, Blobs, and FFmpeg.wasm. No data is uploaded to external servers.

---

## Technical Architecture

NoBlur runs two distinct pipelines depending on the Interpolation toggle.

### Non-Interpolation Path (7-Pass TikTok Bypass)

The primary path for bypassing TikTok recompression. It re-encodes the video and rewrites the MP4 sample table to mimic a high-frame-density video.

1. **Container Reencode:** FFmpeg.wasm re-encodes to H.264 Main@L4.2, CBR (bitrate auto-scales with resolution), AAC 250k 48kHz stereo, video timescale 90000, faststart. Output FPS follows the input. FFmpeg bakes any rotation metadata into the pixel data.
2. **ZeroLoss Track Bypass:** Rebuilds `edts`/`elst` atoms; the video track receives an edit-list `mediaTime` offset of 6000 ticks for AV sync alignment.
3. **Quantum Matrix Patch:** Patches the `mvhd` display matrix in-place.
4. **Udta Strip:** Removes the FFmpeg encoder signature from the `udta` atom.
5. **Tkhd Matrix Reset:** Resets all track header matrices to identity.
6. **Frame Density Inflation:** Inflates the sample table by a configurable multiplier (default 5x — confirmed sweetspot). Real frames are kept; dummy 8-byte samples are appended with `stts`/`stsz`/`stco`/`stsc` patched and padding written at EOF. TikTok reads the inflated frame count as high-density content and skips heavy recompression.
7. **Comment Udta Injection:** Writes an Apple iTunes-style `©cmt` comment tag.

### Interpolation Path (60fps VFI + Full Pipeline)

When the Interpolation toggle is enabled, the engine runs motion-compensated frame interpolation (`minterpolate`) to 60fps using the output resolution setting (1080p or 2K). The interpolated video is then passed through the complete 7-pass non-interpolation pipeline to ensure TikTok bypass compatibility. After VFI completes, the FFmpeg instance is reset to prevent stale state errors, then the video undergoes full re-encoding and binary patching.

---

## Key Features

- **TikTok Compression Bypass:** Frame density inflation (5x default, confirmed) makes videos pass TikTok's quality-preservation threshold, avoiding the blur from server-side recompression. Works for both 1080p and 2K output.
- **Selectable Output Resolution:** Choose between 1080p and 2K (1440p). Bitrate auto-scales — 1080p at 14261k, 2K at 25000k.
- **Client-Side Only:** 100% of processing happens locally within your browser using FFmpeg.wasm, ensuring total data privacy.
- **Adaptive Orientation:** Detects portrait/landscape directly from the MP4 container (`tkhd` box), correctly handling HEVC inputs and videos with rotation metadata.
- **Multi-Format & Codec Input:** Accepts MP4 and MOV containers with H.264, HEVC/H.265, and other codecs; output is normalized to H.264.
- **Bulk Processing Queue:** Drag and drop or select multiple videos to process in a sequential batch.
- **Screen Wake Lock:** Keeps the screen awake on mobile during processing; re-acquires the lock if the tab loses and regains visibility.
- **TikTok Studio Shortcut:** Direct upload button to TikTok Studio web; on mobile, a modal guides the user to enable desktop mode first.
- **Fast-Start Container Fix:** Recalculates chunk offsets (`stco`/`co64`) on every structural shift to keep output playable.
- **High-Contrast Dark Neo-Brutalist UI:** Flat offset shadows, solid dark panels, tactile click feedback, neon accents.
- **Responsive Mobile Layout:** Relocates the upload drop zone dynamically on mobile viewports; stat text wraps correctly on narrow screens.
- **Local History & Storage Guard:** IndexedDB history with output-buffer thumbnails, 12-hour pruning, and a 200MB limit.

---

## File Structure

```text
NoBlur/
├── public/
│   └── coi-serviceworker.js
├── src/
│   ├── mp4-boxes.mjs
│   ├── mp4-patches.mjs
│   ├── mp4-strip.mjs
│   ├── mp4-inflate.mjs
│   └── transform-utils.mjs
├── index.html
├── style.css
├── app.js
├── db.js
├── coi-serviceworker.js
├── vite.config.js
├── package.json
├── biome.json
├── README.md
└── CHANGELOG.md
```

See [CHANGELOG.md](./CHANGELOG.md) for the full release history.

---

## Disclaimer

This utility re-encodes video and rewrites MP4 container atoms to match optimized format profiles. It is designed to work with valid MP4 and MOV containers. Always keep backups of your original video files before processing.
