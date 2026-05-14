import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ClockMode, ClockTime } from "../types/clock";
import type { ChimePlaybackStatus, ChimeSong } from "../types/chime";
import type { ChimeSettings } from "../types/settings";
import type { DragState } from "../types/drag";
import { chimeRegistry, getChimeSong } from "../lib/assets/chimeRegistry";
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
  nextSongLabel: string | null;
  playbackStatus: ChimePlaybackStatus;
  visualActionEpoch: number;
  defaultSong: ChimeSong | null;
  playDefaultSong: () => Promise<void>;
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
  const [visualActionEpoch, setVisualActionEpoch] = useState(0);
  const selectedSong = useMemo(() => getChimeSong(settings.songId), [settings.songId]);
  const defaultSong = chimeRegistry[0] ?? null;
  const nextChimeEntry = useMemo(() => getNextChimeEntry(displayedTime, settings), [displayedTime, settings]);
  const nextTriggerLabel = nextChimeEntry ? minuteToTimeString(nextChimeEntry.triggerMinute) : null;
  const nextTargetLabel = nextChimeEntry ? minuteToTimeString(nextChimeEntry.targetMinute) : null;
  const nextSong = useMemo(() => getChimeSong(nextChimeEntry?.songId ?? ""), [nextChimeEntry?.songId]);
  const nextSongLabel = nextSong?.label ?? null;
  const playSelectedSong = useCallback(async () => {
    setVisualActionEpoch((epoch) => epoch + 1);
    const status = await playChimeSong(selectedSong);
    setPlaybackStatus(status);
  }, [selectedSong]);
  const playDefaultSong = useCallback(async () => {
    setVisualActionEpoch((epoch) => epoch + 1);
    const status = await playChimeSong(defaultSong);
    setPlaybackStatus(status);
  }, [defaultSong]);
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

    const triggeredSong = getChimeSong(crossedEntries[0].songId) ?? selectedSong;

    setVisualActionEpoch((epoch) => epoch + 1);
    void playChimeSong(triggeredSong).then(setPlaybackStatus);
  }, [displayedTime, dragState.isDragging, mode, selectedSong, settings]);

  return {
    selectedSong,
    nextTriggerLabel,
    nextTargetLabel,
    nextSongLabel,
    playbackStatus,
    visualActionEpoch,
    defaultSong,
    playDefaultSong,
    playSelectedSong,
    unlockSelectedSong,
  };
}
