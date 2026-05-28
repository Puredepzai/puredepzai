# Changelog

All notable changes to the NoBlur project are documented in this file.


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

