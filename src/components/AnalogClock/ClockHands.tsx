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
  offsetX: number;
  offsetY: number;
  radialOffset: number;
};

function HandVisual({ asset, angle, length, width, offsetX, offsetY, radialOffset }: HandVisualProps) {
  return (
    <g transform={`translate(50 50) rotate(${angle})`}>
      <image
        href={asset}
        x={-width / 2 + offsetX}
        y={-length + offsetY + radialOffset}
        width={width}
        height={length}
        preserveAspectRatio="xMidYMid meet"
      />
    </g>
  );
}

export function ClockHands({ clock, settings }: ClockHandsProps) {
  const handSet = handRegistry[settings.handStyle];
  const hourProps = clock.getHandDragProps("hour");
  const minuteProps = clock.getHandDragProps("minute");

  return (
    <>
      <HandVisual
        asset={handSet.hour}
        angle={clock.angles.hour}
        length={CLOCK_HAND_DIMENSIONS.hour.length}
        width={CLOCK_HAND_DIMENSIONS.hour.width}
        offsetX={CLOCK_HAND_DIMENSIONS.hour.offsetX}
        offsetY={CLOCK_HAND_DIMENSIONS.hour.offsetY}
        radialOffset={CLOCK_HAND_DIMENSIONS.hour.radialOffset}
      />
      <HandVisual
        asset={handSet.minute}
        angle={clock.angles.minute}
        length={CLOCK_HAND_DIMENSIONS.minute.length}
        width={CLOCK_HAND_DIMENSIONS.minute.width}
        offsetX={CLOCK_HAND_DIMENSIONS.minute.offsetX}
        offsetY={CLOCK_HAND_DIMENSIONS.minute.offsetY}
        radialOffset={CLOCK_HAND_DIMENSIONS.minute.radialOffset}
      />
      {settings.showSecondHand ? (
        <HandVisual
          asset={handSet.second}
          angle={clock.angles.second}
          length={CLOCK_HAND_DIMENSIONS.second.length}
          width={CLOCK_HAND_DIMENSIONS.second.width}
          offsetX={CLOCK_HAND_DIMENSIONS.second.offsetX}
          offsetY={CLOCK_HAND_DIMENSIONS.second.offsetY}
          radialOffset={CLOCK_HAND_DIMENSIONS.second.radialOffset}
        />
      ) : null}

      <HandHitArea
        hand="hour"
        angle={clock.angles.hour}
        radius={CLOCK_HAND_DIMENSIONS.hour.hitRadius}
        offsetX={CLOCK_HAND_DIMENSIONS.hour.offsetX}
        offsetY={CLOCK_HAND_DIMENSIONS.hour.offsetY}
        radialOffset={CLOCK_HAND_DIMENSIONS.hour.radialOffset}
        {...hourProps}
      />
      <HandHitArea
        hand="minute"
        angle={clock.angles.minute}
        radius={CLOCK_HAND_DIMENSIONS.minute.hitRadius}
        offsetX={CLOCK_HAND_DIMENSIONS.minute.offsetX}
        offsetY={CLOCK_HAND_DIMENSIONS.minute.offsetY}
        radialOffset={CLOCK_HAND_DIMENSIONS.minute.radialOffset}
        {...minuteProps}
      />
    </>
  );
}
