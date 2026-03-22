export type ClockMode = "live" | "manual";

export type HandType = "hour" | "minute" | "second";

export type ClockTime = {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
};

export type HandAngles = Record<HandType, number>;
