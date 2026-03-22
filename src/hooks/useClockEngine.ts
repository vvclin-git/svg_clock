import { useCallback, useMemo, useRef, useState } from "react";
import { DEFAULT_DRAG_STATE } from "../constants/clock";
import { useClockTicker } from "./useClockTicker";
import { useHandDrag } from "./useHandDrag";
import type { ClockMode, ClockTime, HandAngles, HandType } from "../types/clock";
import type { ClockSettings } from "../types/settings";
import type { DragState } from "../types/drag";
import { dateToClockTime, normalizeClockTime, totalMinutes, totalMinutesToClockTime } from "../lib/time/clockTime";
import { formatTime } from "../lib/time/formatTime";
import { getHandAngles } from "../lib/time/timeToAngle";
import { angleDeltaToMinuteDelta } from "../lib/time/angleToTime";
import { getShortestClockwiseDelta } from "../lib/geometry/angle";

type DragSession = {
  activeHand: HandType;
  lastAngle: number;
  totalMinutesValue: number;
};

export type UseClockEngineResult = {
  mode: ClockMode;
  displayedTime: ClockTime;
  formattedTime: string;
  dragState: DragState;
  angles: HandAngles;
  syncToNow: () => void;
  getHandDragProps: ReturnType<typeof useHandDrag>["getHandDragProps"];
};

export function useClockEngine(_settings: ClockSettings): UseClockEngineResult {
  const [mode, setMode] = useState<ClockMode>("live");
  const [displayedTime, setDisplayedTime] = useState<ClockTime>(() => dateToClockTime(new Date()));
  const [dragState, setDragState] = useState<DragState>(DEFAULT_DRAG_STATE);
  const dragSessionRef = useRef<DragSession | null>(null);

  const syncToNow = useCallback(() => {
    setDisplayedTime(dateToClockTime(new Date()));
    setMode("live");
    setDragState(DEFAULT_DRAG_STATE);
    dragSessionRef.current = null;
  }, []);

  const tick = useCallback(() => {
    setDisplayedTime(dateToClockTime(new Date()));
  }, []);

  useClockTicker(mode === "live", tick);

  const beginDrag = useCallback(
    (hand: HandType, startAngle: number) => {
      if (hand === "second") {
        return;
      }

      dragSessionRef.current = {
        activeHand: hand,
        lastAngle: startAngle,
        totalMinutesValue: totalMinutes(displayedTime),
      };

      setMode("manual");
      setDragState({ isDragging: true, activeHand: hand });
    },
    [displayedTime],
  );

  const updateDrag = useCallback(
    (nextAngle: number) => {
      const session = dragSessionRef.current;
      if (!session) {
        return;
      }

      const angleDelta = getShortestClockwiseDelta(session.lastAngle, nextAngle);
      session.lastAngle = nextAngle;
      session.totalMinutesValue += angleDeltaToMinuteDelta(session.activeHand, angleDelta);

      const nextTime = normalizeClockTime(
        totalMinutesToClockTime(session.totalMinutesValue, displayedTime.seconds, displayedTime.milliseconds),
      );

      setDisplayedTime(nextTime);
    },
    [displayedTime.seconds, displayedTime.milliseconds],
  );

  const endDrag = useCallback(() => {
    dragSessionRef.current = null;
    setDragState(DEFAULT_DRAG_STATE);
  }, []);

  const { getHandDragProps } = useHandDrag({ beginDrag, updateDrag, endDrag });

  const angles = useMemo(() => getHandAngles(displayedTime), [displayedTime]);
  const formattedTime = useMemo(() => formatTime(displayedTime), [displayedTime]);

  return {
    mode,
    displayedTime,
    formattedTime,
    dragState,
    angles,
    syncToNow,
    getHandDragProps,
  };
}
