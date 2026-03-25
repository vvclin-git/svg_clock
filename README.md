# Analog Clock Web App

A browser-based analog clock built with Vite, React, TypeScript, and SVG. The app shows the device's current local time, lets the user drag the hour and minute hands to adjust the displayed time manually, and provides a `Sync` button to return to live mode.

## Features

- Live local-time display with hour, minute, and second hands
- Manual time adjustment by dragging the hour or minute hand
- Wrap-safe drag behavior across the 12 o'clock boundary
- Top control bar with mode display and `Sync` action
- Digital time readout inside the clock face in `HH:MM:SS`
- External SVG asset registry for interchangeable clock faces and hand styles
- Custom `dual-ring` face with minute labels on the outer ring and full hour numerals on the inner ring
- Per-hand positioning controls for horizontal, vertical, and radial tuning
- Responsive layout for desktop and mobile
- Pointer Events-based interaction for mouse and touch input

## Tech Stack

- Vite
- React
- TypeScript
- SVG
- CSS Modules
- Vitest

## Getting Started

### Prerequisites

- Node.js 18+ recommended
- npm 10+ recommended

### Install

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Run tests

```bash
npm test
```

## Project Structure

```text
public/
  favicon.svg
src/
  assets/
    faces/
    hands/
  components/
    AnalogClock/
    Layout/
    TopControlBar/
  constants/
  hooks/
  lib/
    assets/
    geometry/
    time/
  styles/
  types/
  App.tsx
  main.tsx
```

## Architecture Notes

- `src/hooks/useClockEngine.ts` owns live/manual mode, current displayed time, hand angles, drag updates, and sync behavior.
- `src/hooks/useHandDrag.ts` converts Pointer Events into drag lifecycle events for draggable hands.
- `src/lib/time/` contains pure helpers for time conversion, formatting, and angle calculation.
- `src/lib/assets/` maps logical face and hand style names to SVG assets.
- `src/components/AnalogClock/` contains the layered clock face, hands, hit areas, center cap, and digital time display.

## Face and Hand Styles

Available face styles are defined in `src/types/settings.ts` and registered in `src/lib/assets/faceRegistry.ts`:

- `minimal`
- `classic`
- `roman`
- `dual-ring`

Available hand styles are defined in `src/types/settings.ts` and registered in `src/lib/assets/handRegistry.ts`:

- `bar`
- `sword`
- `breguet`

Default style selection is configured in `src/constants/clock.ts`.

## Hand Position Tuning

Each hand can be tuned independently in `src/constants/clock.ts`:

```ts
export const CLOCK_HAND_DIMENSIONS = {
  hour: { length: 26, width: 12, hitRadius: 13, offsetX: 0, offsetY: 0, radialOffset: 3 },
  minute: { length: 37, width: 8, hitRadius: 11, offsetX: 0, offsetY: 0, radialOffset: 3 },
  second: { length: 39, width: 4, hitRadius: 0, offsetX: 0, offsetY: 0, radialOffset: 3 },
} as const;
```

Meaning of each tuning value:

- `offsetX`: move the hand left or right
- `offsetY`: move the hand up or down in screen coordinates
- `radialOffset`: move the hand inward or outward along its own axis

Interpretation:

- positive `radialOffset` moves the hand inward toward the center
- negative `radialOffset` moves the hand outward away from the center

The drag hit area is kept aligned with these values automatically.

## Current MVP Behavior

- The app starts in live mode and follows the device's local time.
- Dragging the hour or minute hand switches the app into manual mode.
- The second hand is visible but not draggable.
- Pressing `Sync` re-reads the device time and switches the app back to live mode.

## GitHub Pages Deployment

The project includes a GitHub Pages workflow at `.github/workflows/deploy-pages.yml`.

For a repository published at `https://<user>.github.io/svg_clock/`:

- Vite is configured with `base: "/svg_clock/"`
- GitHub Pages should be configured to use `GitHub Actions` as the source
- Pushing to `main` triggers a build and deploy of the `dist/` output

## Verification

The current implementation has been verified with:

- `npm run build`
- `npm test`
