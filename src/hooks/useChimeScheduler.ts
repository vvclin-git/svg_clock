import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ClockMode, ClockTime } from "../types/clock";
import type { ChimePlaybackStatus, ChimeSong } from "../types/chime";
import type { ChimeSettings } from "../types/settings";
import type { DragState } from "../types/drag";
import { getChimeSong } from "../lib/assets/chimeRegistry";
import { getCrossedChimeEntries, getNextChimeEntry, minuteToTimeString } from "../lib/chime/chimeSchedule";
import { playChimeSong, unlockChimeSong } from "../lib/chime/chimePlayback";

type UseChimeSchedulerArgs = {
  settings: ChimeSettings;
  displayedTime: ClockTime;
  mode: ClockMode;
  dragState: DragState;
};

type PreviousClockState = {
  displayedTime: ClockTime;
  mode: ClockMode;
  isDragging: boolean;
};

export type UseChimeSchedulerResult = {
  selectedSong: ChimeSong | null;
  nextTriggerLabel: string | null;
  nextTargetLabel: string | null;
  playbackStatus: ChimePlaybackStatus;
  playSelectedSong: () => Promise<void>;
  unlockSelectedSong: () => Promise<void>;
};

const idleStatus: ChimePlaybackStatus = {
  state: "idle",
  message: "Chime playback is idle.",
};

export function useChimeScheduler({
  settings,
  displayedTime,
  mode,
  dragState,
}: UseChimeSchedulerArgs): UseChimeSchedulerResult {
  const previousRef = useRef<PreviousClockState | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState<ChimePlaybackStatus>(idleStatus);
  const selectedSong = useMemo(() => getChimeSong(settings.songId), [settings.songId]);
  const nextChimeEntry = useMemo(() => getNextChimeEntry(displayedTime, settings), [displayedTime, settings]);
  const nextTriggerLabel = nextChimeEntry ? minuteToTimeString(nextChimeEntry.triggerMinute) : null;
  const nextTargetLabel = nextChimeEntry ? minuteToTimeString(nextChimeEntry.targetMinute) : null;
  const playSelectedSong = useCallback(async () => {
    const status = await playChimeSong(selectedSong);
    setPlaybackStatus(status);
  }, [selectedSong]);
  const unlockSelectedSong = useCallback(async () => {
    const status = await unlockChimeSong(selectedSong);
    setPlaybackStatus(status);
  }, [selectedSong]);

  useEffect(() => {
    const previous = previousRef.current;
    previousRef.current = {
      displayedTime,
      mode,
      isDragging: dragState.isDragging,
    };

    if (!previous) {
      return;
    }

    if (!settings.enabled || mode !== "live" || dragState.isDragging) {
      return;
    }

    if (previous.mode !== "live" || previous.isDragging) {
      return;
    }

    const crossedEntries = getCrossedChimeEntries(previous.displayedTime, displayedTime, settings);

    if (crossedEntries.length === 0) {
      return;
    }

    void playChimeSong(selectedSong).then(setPlaybackStatus);
  }, [displayedTime, dragState.isDragging, mode, selectedSong, settings]);

  return {
    selectedSong,
    nextTriggerLabel,
    nextTargetLabel,
    playbackStatus,
    playSelectedSong,
    unlockSelectedSong,
  };
}
