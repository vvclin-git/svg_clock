import type { DragState } from "../types/drag";
import type { ClockSettings } from "../types/settings";

export const DEFAULT_CLOCK_SETTINGS: ClockSettings = {
  showSecondHand: true,
  sceneId: "fantasia",
  chime: {
    enabled: false,
    scheduleMode: "hourly",
    timesPerDay: 6,
    exactChimeEvents: [
      { time: "09:00", songId: "grand-fathers-clock" },
      { time: "12:00", songId: "grand-fathers-clock" },
      { time: "18:00", songId: "grand-fathers-clock" },
    ],
    leadTimeMinutes: 5,
    songId: "grand-fathers-clock",
  },
};

export const DEFAULT_DRAG_STATE: DragState = {
  isDragging: false,
  activeHand: null,
};
