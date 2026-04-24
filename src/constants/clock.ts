import type { DragState } from "../types/drag";
import type { ClockSettings } from "../types/settings";

export const DEFAULT_CLOCK_SETTINGS: ClockSettings = {
  showSecondHand: true,
  showDigitalTime: true,
  sceneId: "fantasia",
};

export const DEFAULT_DRAG_STATE: DragState = {
  isDragging: false,
  activeHand: null,
};
