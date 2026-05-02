import { describe, expect, it } from "vitest";
import type { ChimeSettings } from "../../types/settings";
import {
  getChimeSchedule,
  getCrossedChimeEntries,
  getNextChimeEntry,
  getTargetMinutes,
  minuteToTimeString,
} from "./chimeSchedule";

const baseSettings: ChimeSettings = {
  enabled: true,
  scheduleMode: "hourly",
  timesPerDay: 6,
  exactChimeEvents: [
    { time: "09:00", songId: "grand-fathers-clock" },
    { time: "12:30", songId: "open-your-hand" },
  ],
  leadTimeMinutes: 5,
  songId: "grand-fathers-clock",
};

describe("chimeSchedule", () => {
  it("generates hourly targets", () => {
    expect(getTargetMinutes({ ...baseSettings, scheduleMode: "hourly" })).toHaveLength(24);
    expect(getTargetMinutes({ ...baseSettings, scheduleMode: "hourly" }).slice(0, 3)).toEqual([0, 60, 120]);
    expect(getChimeSchedule({ ...baseSettings, scheduleMode: "hourly" })[0].songId).toBe("grand-fathers-clock");
  });

  it("generates evenly spaced times per day", () => {
    expect(getTargetMinutes({ ...baseSettings, scheduleMode: "intervalCount", timesPerDay: 6 })).toEqual([
      0, 240, 480, 720, 960, 1200,
    ]);
  });

  it("generates exact target times", () => {
    expect(
      getTargetMinutes({
        ...baseSettings,
        scheduleMode: "exactTimes",
        exactChimeEvents: [
          { time: "18:00", songId: "grand-fathers-clock" },
          { time: "09:30", songId: "open-your-hand" },
        ],
      }),
    ).toEqual([570, 1080]);
  });

  it("subtracts lead time across midnight", () => {
    const schedule = getChimeSchedule({
      ...baseSettings,
      scheduleMode: "exactTimes",
      exactChimeEvents: [{ time: "00:00", songId: "open-your-hand" }],
    });

    expect(schedule).toEqual([{ targetMinute: 0, triggerMinute: 1435, songId: "open-your-hand" }]);
    expect(minuteToTimeString(schedule[0].triggerMinute)).toBe("23:55");
  });

  it("preserves per-event songs for exact schedules", () => {
    const schedule = getChimeSchedule({
      ...baseSettings,
      scheduleMode: "exactTimes",
      exactChimeEvents: [
        { time: "08:00", songId: "open-your-hand" },
        { time: "09:00", songId: "shoujyouji-xf" },
      ],
    });

    expect(schedule.map((entry) => entry.songId)).toEqual(["open-your-hand", "shoujyouji-xf"]);
  });

  it("finds trigger crossings once per natural pass", () => {
    const settings: ChimeSettings = {
      ...baseSettings,
      scheduleMode: "exactTimes",
      exactChimeEvents: [{ time: "10:00", songId: "shoujyouji-xf" }],
      leadTimeMinutes: 5,
    };
    const crossed = getCrossedChimeEntries(
      { hours: 9, minutes: 54, seconds: 59, milliseconds: 900 },
      { hours: 9, minutes: 55, seconds: 0, milliseconds: 0 },
      settings,
    );
    const repeated = getCrossedChimeEntries(
      { hours: 9, minutes: 55, seconds: 0, milliseconds: 0 },
      { hours: 9, minutes: 55, seconds: 0, milliseconds: 100 },
      settings,
    );

    expect(crossed).toHaveLength(1);
    expect(crossed[0].songId).toBe("shoujyouji-xf");
    expect(repeated).toHaveLength(0);
  });

  it("finds the next upcoming trigger relative to the current clock time", () => {
    const nextEntry = getNextChimeEntry(
      { hours: 9, minutes: 54, seconds: 30, milliseconds: 0 },
      {
        ...baseSettings,
        scheduleMode: "exactTimes",
        exactChimeEvents: [
          { time: "09:00", songId: "open-your-hand" },
          { time: "10:00", songId: "shoujyouji-xf" },
        ],
        leadTimeMinutes: 5,
      },
    );

    expect(nextEntry).toMatchObject({
      targetMinute: 600,
      triggerMinute: 595,
      songId: "shoujyouji-xf",
    });
    expect(nextEntry?.minutesUntilTrigger).toBe(1);
  });

  it("wraps the next upcoming trigger across midnight", () => {
    const nextEntry = getNextChimeEntry(
      { hours: 23, minutes: 58, seconds: 0, milliseconds: 0 },
      {
        ...baseSettings,
        scheduleMode: "exactTimes",
        exactChimeEvents: [{ time: "00:00", songId: "open-your-hand" }],
        leadTimeMinutes: 0,
      },
    );

    expect(nextEntry).toMatchObject({
      targetMinute: 0,
      triggerMinute: 0,
      minutesUntilTrigger: 2,
    });
  });
});
