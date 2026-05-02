import type { ClockSceneId } from "./scene";

export type ChimeScheduleMode = "hourly" | "intervalCount" | "exactTimes";

export type ExactChimeEvent = {
  time: string;
  songId: string;
};

export type ChimeSettings = {
  enabled: boolean;
  scheduleMode: ChimeScheduleMode;
  timesPerDay: number;
  exactChimeEvents: ExactChimeEvent[];
  leadTimeMinutes: number;
  songId: string;
};

export type ClockSettings = {
  showSecondHand: boolean;
  sceneId: ClockSceneId;
  chime: ChimeSettings;
};
