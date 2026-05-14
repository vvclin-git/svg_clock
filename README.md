# SEIKO FANTASIA Clock Web App

A browser-based Fantasia-style musical clock built with Vite, React, TypeScript, SVG, and raster image assets. The app shows local time, lets the user drag the hour and minute hands to set an adjusted time, continues running from that adjusted time, and provides a `Sync` button to return to real local time.

## Features

- Live local-time display with hour, minute, and second hands
- Manual time adjustment by dragging the hour or minute hand, then continuing from the adjusted time
- Wrap-safe drag behavior across the 12 o'clock boundary
- Branded top control bar with mode display, digital `HH:MM:SS` readout, settings access, and `Sync` action
- Chiming settings panel with hourly, times-per-day, and exact-time schedule modes
- Configurable chime lead time, such as starting 5 minutes before the next hour
- Chime song registry with a bundled browser audio chime for static GitHub Pages playback
- MIDI asset typing for source `.mid` and `.midi` files that can be rendered into browser audio assets
- Scene-based asset registry for layered clockface, numerals, decorations, hands, and center-cap assets
- Raster Fantasia clock assets with independently positioned numeral and hand layers
- Polar coordinate positioning for easier circular numeral and decoration placement
- Per-hand image sizing, anchor, pivot, hit-area, and animation configuration
- Responsive layout for desktop and mobile
- Pointer Events-based interaction for mouse and touch input

## Tech Stack

- Vite
- React
- TypeScript
- SVG
- Raster image assets
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
    fantasia/
    faces/
    hands/
  components/
    AnalogClock/
    Layout/
    Settings/
    TopControlBar/
  constants/
  hooks/
  lib/
    assets/
    chime/
    geometry/
    time/
  styles/
  types/
  App.tsx
  main.tsx
```

## Architecture Notes

- `src/hooks/useClockEngine.ts` owns live/adjusted mode, current displayed time, hand angles, drag updates, adjusted ticking, and sync behavior.
- `src/hooks/useChimeScheduler.ts` watches the displayed clock time and triggers chimes only during natural live-mode crossings.
- `src/hooks/useHandDrag.ts` converts Pointer Events into drag lifecycle events for draggable hands.
- `src/lib/chime/` contains pure helpers for schedule generation, lead-time subtraction, trigger crossing detection, and playback adaptation.
- `src/lib/time/` contains pure helpers for time conversion, formatting, and angle calculation.
- `src/lib/assets/sceneRegistry.ts` defines scene-level asset composition for faces, numerals, decorations, hands, and center-cap layers.
- `src/lib/assets/chimeRegistry.ts` is the registry for selectable chime songs.
- `src/components/AnalogClock/` contains the layered SVG scene renderer and hand hit areas.
- `src/components/Settings/` contains the chiming settings panel.
- `src/components/TopControlBar/` contains the branded header, digital time readout, mode label, settings action, and sync action.

## Chiming Settings

Open `Settings` from the top control bar to configure chiming.

Available controls:

- `Enabled`: turns chiming on or off
- `Schedule`: chooses `Hourly`, `Times per day`, or `Exact times`
- `Times per day`: creates evenly spaced target times across the day
- `Lead time`: starts the chime before the target time by the configured number of minutes
- `Song`: selects the default registered chime song for hourly and times-per-day schedules
- `Exact target times`: edits target times with 24-hour `HH:MM` text fields when using exact-time scheduling
- `Exact target song`: selects the song for each exact-time chime event

Chime target times are the intended clock times. Trigger times are calculated as `target time - lead time`; for example, a `10:00` target with a `5` minute lead time triggers at `09:55`.

Chiming only triggers while the clock is in live mode and crosses a trigger time by itself. Dragging the hour or minute hand switches the clock into adjusted mode, and chiming stays disabled until `Sync` returns the clock to real local time.

Clock settings are saved in the browser with `localStorage`, so each browser and device remembers its own chiming schedule, lead time, and selected song. This works with the static GitHub Pages deployment and does not sync settings between devices.

Exact-time schedule rows can each use their own song. Hourly and times-per-day schedules use the default `Song` selector.

The default chime is a pre-rendered browser audio asset registered in `src/lib/assets/chimeRegistry.ts`. Pressing `Test` plays the selected song immediately, and enabling chiming primes the selected audio element from the user's click so scheduled playback is less likely to be blocked by browser autoplay rules.

MIDI files are supported at the TypeScript asset level for source material. Source MIDI files can live under `src/assets/chimes/source/`; generated browser-ready files should live beside them in `src/assets/chimes/` and be registered as `assetKind: "audio"`. Direct browser MIDI playback is intentionally not used for GitHub Pages. MIDI registry entries remain unsupported until a future MIDI playback adapter is added.

## Scene Assets

Scene ids are defined in `src/types/scene.ts` and registered in `src/lib/assets/sceneRegistry.ts`.

Available scenes:

- `default`: legacy dual-ring SVG-based scene
- `fantasia`: raster Fantasia musical clock scene

Default scene selection is configured in `src/constants/clock.ts`.

Each scene can define:

- `clockface`: base dial/background images
- `numerals`: independent hour numeral assets
- `decorations`: logos, labels, jewels, plaques, or other static overlays
- `hands`: hour, minute, and second image assets with per-hand interaction config
- `center-cap`: topmost center decorative assets

## Asset Position Tuning

Fantasia asset placement is tuned in `src/lib/assets/sceneRegistry.ts`.

Numerals are generated with shared polar settings:

```ts
const FANTASIA_NUMERAL_RADIUS = 32;
const FANTASIA_NUMERAL_SIZE = 15.2;
```

Meaning:

- `radius`: moves numerals inward or outward from the center
- `angle`: uses clock-style degrees where `0` is 12 o'clock, `90` is 3 o'clock, `180` is 6 o'clock, and `270` is 9 o'clock
- `width` / `height`: controls rendered asset size in the `0 0 100 100` SVG viewBox

Hands are tuned per asset with:

- `x` / `y`: rotation pivot position, usually near `50, 50`
- `width` / `height`: rendered hand size
- `anchorX` / `anchorY`: pivot location inside the image
- `interaction.hitLength` / `interaction.hitWidth`: invisible drag area

The drag hit area is kept separate from the visible hand image so decorative raster shapes do not reduce usability.

## Current Behavior

- The app starts in live mode and follows the device's local time.
- Dragging the hour or minute hand switches the app into adjusted mode.
- The clock pauses while dragging for precise adjustment.
- Releasing the hand continues ticking forward from the adjusted time.
- The second hand is visible but not draggable.
- Pressing `Sync` re-reads the device time and switches the app back to live mode.
- Chiming only triggers in live mode when the clock naturally crosses a scheduled trigger time.

## GitHub Pages Deployment

The project includes a GitHub Pages workflow at `.github/workflows/deploy-pages.yml`.

For this repository, the app is published at:

```text
https://vvclin-git.github.io/svg_clock/
```

Deployment details:

- Vite is configured with `base: "/svg_clock/"`
- The workflow runs `npm run build`, including strict TypeScript checks, before publishing
- GitHub Pages should be configured to use `GitHub Actions` as the source
- Pushing to `main` triggers a build and deploy of the `dist/` output

## Verification

The current implementation has been verified with:

- `npm run build`
- `npm test`
