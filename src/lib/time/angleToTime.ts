import type { HandType } from "../../types/clock";

export function angleDeltaToMinuteDelta(hand: HandType, angleDelta: number) {
  if (hand === "minute") {
    return angleDelta / 6;
  }

  if (hand === "hour") {
    return angleDelta * 2;
  }

  return 0;
}
