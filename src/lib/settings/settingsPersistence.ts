import { DEFAULT_CLOCK_SETTINGS } from "../../constants/clock";
import { chimeRegistry } from "../assets/chimeRegistry";
import type { ClockSettings, ChimeScheduleMode, ExactChimeEvent } from "../../types/settings";
import type { ClockSceneId } from "../../types/scene";

export const CLOCK_SETTINGS_STORAGE_KEY = "svg-clock-settings-v1";

const scheduleModes = new Set<ChimeScheduleMode>(["hourly", "intervalCount", "exactTimes"]);
const sceneIds = new Set<ClockSceneId>(["default", "fantasia"]);
const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getDefaultStorage() {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const numberValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Math.max(min, Math.min(max, Math.floor(numberValue)));
}

function normalizeExactTargetTimes(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const exactTargetTimes = Array.from(
    new Set(value.filter((time): time is string => typeof time === "string" && timePattern.test(time))),
  );

  return exactTargetTimes.length > 0 ? exactTargetTimes : fallback;
}

function normalizeSongId(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  return chimeRegistry.some((song) => song.id === value) ? value : fallback;
}

function normalizeExactChimeEvents(chime: Record<string, unknown>, fallbackSongId: string): ExactChimeEvent[] {
  if (Array.isArray(chime.exactChimeEvents)) {
    const exactChimeEvents = chime.exactChimeEvents
      .filter(isRecord)
      .filter((event): event is { time: string; songId?: unknown } => typeof event.time === "string" && timePattern.test(event.time))
      .map((event) => ({
        time: event.time,
        songId: normalizeSongId(event.songId, fallbackSongId),
      }));

    if (exactChimeEvents.length > 0) {
      return exactChimeEvents;
    }
  }

  const migratedTimes = normalizeExactTargetTimes(
    chime.exactTargetTimes,
    DEFAULT_CLOCK_SETTINGS.chime.exactChimeEvents.map((event) => event.time),
  );

  return migratedTimes.map((time) => ({
    time,
    songId: fallbackSongId,
  }));
}

export function normalizeClockSettings(value: unknown): ClockSettings {
  const defaults = DEFAULT_CLOCK_SETTINGS;

  if (!isRecord(value)) {
    return defaults;
  }

  const chime = isRecord(value.chime) ? value.chime : {};
  const scheduleMode = typeof chime.scheduleMode === "string" && scheduleModes.has(chime.scheduleMode as ChimeScheduleMode)
    ? (chime.scheduleMode as ChimeScheduleMode)
    : defaults.chime.scheduleMode;
  const songId = normalizeSongId(chime.songId, defaults.chime.songId);

  return {
    showSecondHand: typeof value.showSecondHand === "boolean" ? value.showSecondHand : defaults.showSecondHand,
    sceneId:
      typeof value.sceneId === "string" && sceneIds.has(value.sceneId as ClockSceneId)
        ? (value.sceneId as ClockSceneId)
        : defaults.sceneId,
    chime: {
      enabled: typeof chime.enabled === "boolean" ? chime.enabled : defaults.chime.enabled,
      scheduleMode,
      timesPerDay: clampNumber(chime.timesPerDay, 1, 24, defaults.chime.timesPerDay),
      exactChimeEvents: normalizeExactChimeEvents(chime, songId),
      leadTimeMinutes: clampNumber(chime.leadTimeMinutes, 0, 1439, defaults.chime.leadTimeMinutes),
      songId,
    },
  };
}

export function loadClockSettings(storage?: Storage): ClockSettings {
  const targetStorage = storage ?? getDefaultStorage();

  if (!targetStorage) {
    return DEFAULT_CLOCK_SETTINGS;
  }

  try {
    const storedSettings = targetStorage.getItem(CLOCK_SETTINGS_STORAGE_KEY);

    if (!storedSettings) {
      return DEFAULT_CLOCK_SETTINGS;
    }

    return normalizeClockSettings(JSON.parse(storedSettings));
  } catch {
    return DEFAULT_CLOCK_SETTINGS;
  }
}

export function saveClockSettings(
  settings: ClockSettings,
  storage?: Storage,
): void {
  const targetStorage = storage ?? getDefaultStorage();

  if (!targetStorage) {
    return;
  }

  try {
    targetStorage.setItem(CLOCK_SETTINGS_STORAGE_KEY, JSON.stringify(normalizeClockSettings(settings)));
  } catch {
    // Storage can fail in private browsing, blocked-storage, or quota-limited contexts.
  }
}
