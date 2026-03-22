import type { ClockTime, HandAngles } from "../../types/clock";

export function getHandAngles(time: ClockTime): HandAngles {
  const seconds = time.seconds + time.milliseconds / 1000;
  const minutes = time.minutes + seconds / 60;
  const hours = (time.hours % 12) + minutes / 60;

  return {
    second: seconds * 6,
    minute: minutes * 6,
    hour: hours * 30,
  };
}
