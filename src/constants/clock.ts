import type { DragState } from "../types/drag";
import type { ClockSettings } from "../types/settings";

export const DEFAULT_CLOCK_SETTINGS: ClockSettings = {
  showSecondHand: true,
  sceneId: "fantasia",
  chime: {
    enabled: false,
    scheduleMode: "hourly",
    timesPerDay: 6,
    exactTargetTimes: ["09:00", "12:00", "18:00"],
    leadTimeMinutes: 5,
    songId: "",
  },
};

export const DEFAULT_DRAG_STATE: DragState = {
  isDragging: false,
  activeHand: null,
};
