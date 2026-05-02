import type { ClockTime } from "../../types/clock";
import type { ChimeSettings } from "../../types/settings";

const MINUTES_PER_DAY = 24 * 60;
const MILLISECONDS_PER_DAY = MINUTES_PER_DAY * 60 * 1000;

export type ChimeScheduleEntry = {
  targetMinute: number;
  triggerMinute: number;
};

function wrapMinute(value: number) {
  return ((value % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
}

export function clockTimeToMilliseconds(time: ClockTime) {
  return ((time.hours * 60 + time.minutes) * 60 + time.seconds) * 1000 + time.milliseconds;
}

export function parseTimeStringToMinute(value: string) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);

  if (!match) {
    return null;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

export function minuteToTimeString(minute: number) {
  const wrapped = wrapMinute(minute);
  const hours = Math.floor(wrapped / 60);
  const minutes = wrapped % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function getTargetMinutes(settings: ChimeSettings) {
  switch (settings.scheduleMode) {
    case "hourly":
      return Array.from({ length: 24 }, (_, index) => index * 60);
    case "intervalCount": {
      const count = Math.max(1, Math.min(24, Math.floor(settings.timesPerDay)));
      const interval = MINUTES_PER_DAY / count;

      return Array.from({ length: count }, (_, index) => Math.round(index * interval));
    }
    case "exactTimes":
      return Array.from(
        new Set(
          settings.exactTargetTimes
            .map(parseTimeStringToMinute)
            .filter((minute): minute is number => minute !== null),
        ),
      ).sort((left, right) => left - right);
  }
}

export function getChimeSchedule(settings: ChimeSettings): ChimeScheduleEntry[] {
  const leadTime = Math.max(0, Math.min(MINUTES_PER_DAY - 1, Math.floor(settings.leadTimeMinutes)));

  return getTargetMinutes(settings)
    .map((targetMinute) => ({
      targetMinute,
      triggerMinute: wrapMinute(targetMinute - leadTime),
    }))
    .sort((left, right) => left.triggerMinute - right.triggerMinute);
}

export function crossedDailyMinute(previousMilliseconds: number, currentMilliseconds: number, minute: number) {
  const triggerMilliseconds = minute * 60 * 1000;

  if (previousMilliseconds === currentMilliseconds) {
    return false;
  }

  if (currentMilliseconds > previousMilliseconds) {
    return previousMilliseconds < triggerMilliseconds && triggerMilliseconds <= currentMilliseconds;
  }

  return previousMilliseconds < triggerMilliseconds || triggerMilliseconds <= currentMilliseconds;
}

export function getCrossedChimeEntries(
  previousTime: ClockTime,
  currentTime: ClockTime,
  settings: ChimeSettings,
): ChimeScheduleEntry[] {
  const previousMilliseconds = clockTimeToMilliseconds(previousTime);
  const currentMilliseconds = clockTimeToMilliseconds(currentTime);

  return getChimeSchedule(settings).filter((entry) =>
    crossedDailyMinute(previousMilliseconds, currentMilliseconds, entry.triggerMinute),
  );
}

export { MILLISECONDS_PER_DAY };
