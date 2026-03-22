import barHour from "../../assets/hands/bar/hour.svg";
import barMinute from "../../assets/hands/bar/minute.svg";
import barSecond from "../../assets/hands/bar/second.svg";
import swordHour from "../../assets/hands/sword/hour.svg";
import swordMinute from "../../assets/hands/sword/minute.svg";
import swordSecond from "../../assets/hands/sword/second.svg";
import breguetHour from "../../assets/hands/breguet/hour.svg";
import breguetMinute from "../../assets/hands/breguet/minute.svg";
import breguetSecond from "../../assets/hands/breguet/second.svg";
import type { HandStyle } from "../../types/settings";

export const handRegistry: Record<HandStyle, { hour: string; minute: string; second: string }> = {
  bar: {
    hour: barHour,
    minute: barMinute,
    second: barSecond,
  },
  sword: {
    hour: swordHour,
    minute: swordMinute,
    second: swordSecond,
  },
  breguet: {
    hour: breguetHour,
    minute: breguetMinute,
    second: breguetSecond,
  },
};
