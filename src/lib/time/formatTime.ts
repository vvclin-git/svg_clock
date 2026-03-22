import type { ClockTime } from "../../types/clock";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function formatTime(time: ClockTime) {
  return `${pad(time.hours)}:${pad(time.minutes)}:${pad(time.seconds)}`;
}
