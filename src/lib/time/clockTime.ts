import type { ClockTime } from "../../types/clock";

const MINUTES_PER_DAY = 24 * 60;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

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

export function addMillisecondsToClockTime(time: ClockTime, milliseconds: number): ClockTime {
  const currentMilliseconds =
    ((time.hours * 60 + time.minutes) * 60 + time.seconds) * 1000 + time.milliseconds;
  const wrapped = ((currentMilliseconds + milliseconds) % MILLISECONDS_PER_DAY + MILLISECONDS_PER_DAY) % MILLISECONDS_PER_DAY;
  const hours = Math.floor(wrapped / 3600000);
  const minutes = Math.floor((wrapped % 3600000) / 60000);
  const seconds = Math.floor((wrapped % 60000) / 1000);

  return {
    hours,
    minutes,
    seconds,
    milliseconds: wrapped % 1000,
  };
}
