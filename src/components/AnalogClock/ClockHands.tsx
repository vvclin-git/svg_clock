import type { ClockSettings } from "../../types/settings";
import type { UseClockEngineResult } from "../../hooks/useClockEngine";
import { handRegistry } from "../../lib/assets/handRegistry";
import { CLOCK_HAND_DIMENSIONS } from "../../constants/clock";
import { HandHitArea } from "./HandHitArea";

type ClockHandsProps = {
  clock: UseClockEngineResult;
  settings: ClockSettings;
};

type HandVisualProps = {
  asset: string;
  angle: number;
  length: number;
  width: number;
};

function HandVisual({ asset, angle, length, width }: HandVisualProps) {
  return (
    <g transform={`translate(50 50) rotate(${angle})`}>
      <image href={asset} x={-width / 2} y={-length} width={width} height={length} preserveAspectRatio="xMidYMid meet" />
    </g>
  );
}

export function ClockHands({ clock, settings }: ClockHandsProps) {
  const handSet = handRegistry[settings.handStyle];
  const hourProps = clock.getHandDragProps("hour");
  const minuteProps = clock.getHandDragProps("minute");

  return (
    <>
      <HandVisual asset={handSet.hour} angle={clock.angles.hour} length={CLOCK_HAND_DIMENSIONS.hour.length} width={CLOCK_HAND_DIMENSIONS.hour.width} />
      <HandVisual asset={handSet.minute} angle={clock.angles.minute} length={CLOCK_HAND_DIMENSIONS.minute.length} width={CLOCK_HAND_DIMENSIONS.minute.width} />
      {settings.showSecondHand ? (
        <HandVisual asset={handSet.second} angle={clock.angles.second} length={CLOCK_HAND_DIMENSIONS.second.length} width={CLOCK_HAND_DIMENSIONS.second.width} />
      ) : null}

      <HandHitArea hand="hour" angle={clock.angles.hour} radius={CLOCK_HAND_DIMENSIONS.hour.hitRadius} {...hourProps} />
      <HandHitArea hand="minute" angle={clock.angles.minute} radius={CLOCK_HAND_DIMENSIONS.minute.hitRadius} {...minuteProps} />
    </>
  );
}
