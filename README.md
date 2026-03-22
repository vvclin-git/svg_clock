# Analog Clock Web App

A browser-based analog clock built with Vite, React, TypeScript, and SVG. The app shows the device's current local time, lets the user drag the hour and minute hands to adjust the displayed time manually, and provides a `Sync` button to return to live mode.

## Features

- Live local-time display with hour, minute, and second hands
- Manual time adjustment by dragging the hour or minute hand
- Wrap-safe drag behavior across the 12 o'clock boundary
- Top control bar with mode display and `Sync` action
- Digital time readout inside the clock face in `HH:MM:SS`
- External SVG asset registry for interchangeable clock faces and hand styles
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

## Current MVP Behavior

- The app starts in live mode and follows the device's local time.
- Dragging the hour or minute hand switches the app into manual mode.
- The second hand is visible but not draggable.
- Pressing `Sync` re-reads the device time and switches the app back to live mode.

## Verification

The current implementation has been verified with:

- `npm run build`
- `npm test`
