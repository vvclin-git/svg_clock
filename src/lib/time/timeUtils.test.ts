import { describe, expect, it } from "vitest";
import { getShortestClockwiseDelta } from "../geometry/angle";
import { totalMinutesToClockTime } from "./clockTime";
import { getHandAngles } from "./timeToAngle";

describe("time helpers", () => {
  it("computes smooth hand angles from a clock time", () => {
    const angles = getHandAngles({
      hours: 3,
      minutes: 15,
      seconds: 30,
      milliseconds: 0,
    });

    expect(angles.hour).toBeCloseTo(97.75);
    expect(angles.minute).toBeCloseTo(93);
    expect(angles.second).toBeCloseTo(180);
  });

  it("unwraps drag deltas across 12 o'clock without reversing", () => {
    expect(getShortestClockwiseDelta(354, 6)).toBe(12);
    expect(getShortestClockwiseDelta(6, 354)).toBe(-12);
  });

  it("wraps manual time across day boundaries", () => {
    expect(totalMinutesToClockTime(-5, 10)).toEqual({
      hours: 23,
      minutes: 55,
      seconds: 10,
      milliseconds: 0,
    });
  });
});
