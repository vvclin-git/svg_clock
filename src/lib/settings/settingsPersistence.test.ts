import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_CLOCK_SETTINGS } from "../../constants/clock";
import {
  CLOCK_SETTINGS_STORAGE_KEY,
  loadClockSettings,
  normalizeClockSettings,
  saveClockSettings,
} from "./settingsPersistence";

function createMemoryStorage() {
  const items = new Map<string, string>();

  return {
    clear: vi.fn(() => items.clear()),
    getItem: vi.fn((key: string) => items.get(key) ?? null),
    key: vi.fn((index: number) => Array.from(items.keys())[index] ?? null),
    removeItem: vi.fn((key: string) => {
      items.delete(key);
    }),
    setItem: vi.fn((key: string, value: string) => {
      items.set(key, value);
    }),
    get length() {
      return items.size;
    },
  } satisfies Storage;
}

describe("settingsPersistence", () => {
  let storage: Storage;

  beforeEach(() => {
    storage = createMemoryStorage();
  });

  it("returns defaults when no settings are stored", () => {
    expect(loadClockSettings(storage)).toEqual(DEFAULT_CLOCK_SETTINGS);
  });

  it("restores valid saved chime settings", () => {
    const savedSettings = {
      showSecondHand: false,
      sceneId: "default",
      chime: {
        enabled: true,
        scheduleMode: "exactTimes",
        timesPerDay: 12,
        exactTargetTimes: ["08:15", "21:45"],
        leadTimeMinutes: 10,
        songId: "open-your-hand",
      },
    };

    storage.setItem(CLOCK_SETTINGS_STORAGE_KEY, JSON.stringify(savedSettings));

    expect(loadClockSettings(storage)).toEqual(savedSettings);
  });

  it("falls back safely for corrupt JSON", () => {
    storage.setItem(CLOCK_SETTINGS_STORAGE_KEY, "{not json");

    expect(loadClockSettings(storage)).toEqual(DEFAULT_CLOCK_SETTINGS);
  });

  it("normalizes invalid saved values", () => {
    expect(
      normalizeClockSettings({
        showSecondHand: "yes",
        sceneId: "missing",
        chime: {
          enabled: "true",
          scheduleMode: "quarterly",
          timesPerDay: 99,
          exactTargetTimes: ["25:00", "12:30", "12:30"],
          leadTimeMinutes: -20,
          songId: "missing-song",
        },
      }),
    ).toEqual({
      ...DEFAULT_CLOCK_SETTINGS,
      chime: {
        ...DEFAULT_CLOCK_SETTINGS.chime,
        timesPerDay: 24,
        exactTargetTimes: ["12:30"],
        leadTimeMinutes: 0,
      },
    });
  });

  it("does not throw when storage read or write fails", () => {
    const throwingStorage = {
      ...createMemoryStorage(),
      getItem: vi.fn(() => {
        throw new Error("blocked");
      }),
      setItem: vi.fn(() => {
        throw new Error("blocked");
      }),
    } satisfies Storage;

    expect(loadClockSettings(throwingStorage)).toEqual(DEFAULT_CLOCK_SETTINGS);
    expect(() => saveClockSettings(DEFAULT_CLOCK_SETTINGS, throwingStorage)).not.toThrow();
  });

  it("saves normalized settings", () => {
    saveClockSettings({ ...DEFAULT_CLOCK_SETTINGS, chime: { ...DEFAULT_CLOCK_SETTINGS.chime, songId: "open-your-hand" } }, storage);

    expect(storage.setItem).toHaveBeenCalledWith(
      CLOCK_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        ...DEFAULT_CLOCK_SETTINGS,
        chime: {
          ...DEFAULT_CLOCK_SETTINGS.chime,
          songId: "open-your-hand",
        },
      }),
    );
  });
});
