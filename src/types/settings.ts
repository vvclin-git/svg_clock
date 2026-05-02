import type { ClockSceneId } from "./scene";

export type ChimeScheduleMode = "hourly" | "intervalCount" | "exactTimes";

export type ChimeSettings = {
  enabled: boolean;
  scheduleMode: ChimeScheduleMode;
  timesPerDay: number;
  exactTargetTimes: string[];
  leadTimeMinutes: number;
  songId: string;
};

export type ClockSettings = {
  showSecondHand: boolean;
  sceneId: ClockSceneId;
  chime: ChimeSettings;
};
