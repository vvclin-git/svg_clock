# Changelog

All notable changes to this project will be documented in this file.

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
