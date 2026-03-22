import type { DragState } from "../types/drag";
import type { ClockSettings } from "../types/settings";

export const DEFAULT_CLOCK_SETTINGS: ClockSettings = {
  showSecondHand: true,
  showDigitalTime: true,
  faceStyle: "minimal",
  handStyle: "bar",
};

export const DEFAULT_DRAG_STATE: DragState = {
  isDragging: false,
  activeHand: null,
};

export const CLOCK_HAND_DIMENSIONS = {
  hour: { length: 26, width: 12, hitRadius: 13 },
  minute: { length: 37, width: 8, hitRadius: 11 },
  second: { length: 39, width: 4, hitRadius: 0 },
} as const;
