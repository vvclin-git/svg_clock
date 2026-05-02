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
  exactTargetTimes: ["09:00", "12:30"],
  leadTimeMinutes: 5,
  songId: "",
};

describe("chimeSchedule", () => {
  it("generates hourly targets", () => {
    expect(getTargetMinutes({ ...baseSettings, scheduleMode: "hourly" })).toHaveLength(24);
    expect(getTargetMinutes({ ...baseSettings, scheduleMode: "hourly" }).slice(0, 3)).toEqual([0, 60, 120]);
  });

  it("generates evenly spaced times per day", () => {
    expect(getTargetMinutes({ ...baseSettings, scheduleMode: "intervalCount", timesPerDay: 6 })).toEqual([
      0, 240, 480, 720, 960, 1200,
    ]);
  });

  it("generates exact target times", () => {
    expect(getTargetMinutes({ ...baseSettings, scheduleMode: "exactTimes", exactTargetTimes: ["18:00", "09:30"] })).toEqual([
      570, 1080,
    ]);
  });

  it("subtracts lead time across midnight", () => {
    const schedule = getChimeSchedule({ ...baseSettings, scheduleMode: "exactTimes", exactTargetTimes: ["00:00"] });

    expect(schedule).toEqual([{ targetMinute: 0, triggerMinute: 1435 }]);
    expect(minuteToTimeString(schedule[0].triggerMinute)).toBe("23:55");
  });

  it("finds trigger crossings once per natural pass", () => {
    const settings: ChimeSettings = { ...baseSettings, scheduleMode: "exactTimes", exactTargetTimes: ["10:00"], leadTimeMinutes: 5 };
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
    expect(repeated).toHaveLength(0);
  });

  it("finds the next upcoming trigger relative to the current clock time", () => {
    const nextEntry = getNextChimeEntry(
      { hours: 9, minutes: 54, seconds: 30, milliseconds: 0 },
      { ...baseSettings, scheduleMode: "exactTimes", exactTargetTimes: ["09:00", "10:00"], leadTimeMinutes: 5 },
    );

    expect(nextEntry).toMatchObject({
      targetMinute: 600,
      triggerMinute: 595,
    });
    expect(nextEntry?.minutesUntilTrigger).toBe(1);
  });

  it("wraps the next upcoming trigger across midnight", () => {
    const nextEntry = getNextChimeEntry(
      { hours: 23, minutes: 58, seconds: 0, milliseconds: 0 },
      { ...baseSettings, scheduleMode: "exactTimes", exactTargetTimes: ["00:00"], leadTimeMinutes: 0 },
    );

    expect(nextEntry).toMatchObject({
      targetMinute: 0,
      triggerMinute: 0,
      minutesUntilTrigger: 2,
    });
  });
});
