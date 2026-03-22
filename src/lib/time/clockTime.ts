import type { ClockTime } from "../../types/clock";

const MINUTES_PER_DAY = 24 * 60;

export function dateToClockTime(date: Date): ClockTime {
  return {
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
    milliseconds: date.getMilliseconds(),
  };
}

export function totalMinutes(time: ClockTime) {
  return time.hours * 60 + time.minutes + time.seconds / 60 + time.milliseconds / 60000;
}

export function totalMinutesToClockTime(value: number, seconds = 0, milliseconds = 0): ClockTime {
  const wrapped = ((value % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const totalWholeMinutes = Math.floor(wrapped);

  return {
    hours: Math.floor(totalWholeMinutes / 60),
    minutes: totalWholeMinutes % 60,
    seconds,
    milliseconds,
  };
}

export function normalizeClockTime(time: ClockTime): ClockTime {
  return totalMinutesToClockTime(totalMinutes(time), time.seconds, time.milliseconds);
}
