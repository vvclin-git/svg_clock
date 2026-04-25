# Changelog

All notable changes to this project will be documented in this file.

## [0.3.0] - 2026-04-25

### Added
- Added a scene-based asset registry that supports layered clockface, numeral, decoration, hand, and center-cap assets.
- Added the `fantasia` scene using raster clockface, numeral, and hand assets under `src/assets/fantasia/`.
- Added polar positioning support for easier numeral and decoration placement around the clock face.
- Added a branded `SEIKO FANTASIA` header logo and moved the digital time readout into the top control bar.
- Added adjusted-time ticking behavior after manual hand dragging.

### Changed
- Set the Fantasia scene as the default clock appearance.
- Replaced separate face and hand registries with a single scene registry.
- Changed manual dragging so the clock pauses only while dragging, then continues running from the adjusted time.
- Updated the top control mode label to show `Adjusted mode` until `Sync` returns the clock to real local time.
- Unified top control button sizing and visual treatment.

### Removed
- Removed the old in-face digital time readout.
- Removed the digital time toggle button.
- Removed the legacy fixed `ClockFace`, `ClockHands`, and `ClockCenter` components in favor of layered scene rendering.

## [0.2.0] - 2026-03-25

### Added
- Added a new `dual-ring` clock face style with an outer minute ring and inner full-hour numeral ring.
- Added GitHub Pages deployment workflow for building and publishing the Vite app from GitHub Actions.
- Added per-hand `offsetX`, `offsetY`, and `radialOffset` controls for tuning hand placement without editing SVG assets.

### Changed
- Refined the `dual-ring` face typography and spacing to reduce visual clutter and improve hour/minute hierarchy.
- Set the default face style to `dual-ring`.

## [0.1.0] - 2026-03-23

### Added
- Bootstrapped a Vite + React + TypeScript analog clock web app.
- Implemented live local-time rendering with hour, minute, and second hands.
- Added manual hour-hand and minute-hand dragging via Pointer Events with wrap-safe boundary handling.
- Added a top control bar with a `Sync` action that returns the app to live mode.
- Added digital time display inside the clock face in `HH:MM:SS` format.
- Added external SVG face and hand asset registries with initial face and hand style sets.
- Added responsive styling for desktop and mobile layouts.
- Added unit tests covering time-to-angle conversion and boundary-wrapping time logic.

### Notes
- This release implements the MVP described in the analog clock web app spec v1.2.
