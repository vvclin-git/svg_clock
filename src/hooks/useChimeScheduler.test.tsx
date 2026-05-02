// @vitest-environment jsdom

import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useChimeScheduler } from "./useChimeScheduler";
import type { ClockMode, ClockTime } from "../types/clock";
import type { DragState } from "../types/drag";
import type { ChimeSettings } from "../types/settings";

const playChimeSong = vi.fn<(song: unknown) => Promise<{ state: "error"; message: string; songId: string }>>(async () => ({
  state: "error" as const,
  message: "No chime song is registered.",
  songId: "",
}));

vi.mock("../lib/chime/chimePlayback", () => ({
  playChimeSong: (song: unknown) => playChimeSong(song),
}));

const settings: ChimeSettings = {
  enabled: true,
  scheduleMode: "exactTimes",
  timesPerDay: 6,
  exactChimeEvents: [{ time: "10:00", songId: "open-your-hand" }],
  leadTimeMinutes: 5,
  songId: "grand-fathers-clock",
};

const idleDragState: DragState = {
  isDragging: false,
  activeHand: null,
};

type HarnessProps = {
  time: ClockTime;
  mode?: ClockMode;
  dragState?: DragState;
};

function Harness({ time, mode = "live", dragState = idleDragState }: HarnessProps) {
  useChimeScheduler({
    settings,
    displayedTime: time,
    mode,
    dragState,
  });

  return null;
}

describe("useChimeScheduler", () => {
  beforeEach(() => {
    playChimeSong.mockClear();
  });

  it("triggers when live clock crosses a trigger time", async () => {
    const { rerender } = render(<Harness time={{ hours: 9, minutes: 54, seconds: 59, milliseconds: 900 }} />);

    rerender(<Harness time={{ hours: 9, minutes: 55, seconds: 0, milliseconds: 0 }} />);

    await waitFor(() => expect(playChimeSong).toHaveBeenCalledTimes(1));
    expect(playChimeSong).toHaveBeenCalledWith(expect.objectContaining({ id: "open-your-hand" }));
  });

  it("does not repeat after the trigger has already been crossed", async () => {
    const { rerender } = render(<Harness time={{ hours: 9, minutes: 54, seconds: 59, milliseconds: 900 }} />);

    rerender(<Harness time={{ hours: 9, minutes: 55, seconds: 0, milliseconds: 0 }} />);
    rerender(<Harness time={{ hours: 9, minutes: 55, seconds: 0, milliseconds: 100 }} />);

    await waitFor(() => expect(playChimeSong).toHaveBeenCalledTimes(1));
  });

  it("does not trigger in adjusted mode", () => {
    const { rerender } = render(<Harness mode="adjusted" time={{ hours: 9, minutes: 54, seconds: 59, milliseconds: 900 }} />);

    rerender(<Harness mode="adjusted" time={{ hours: 9, minutes: 55, seconds: 0, milliseconds: 0 }} />);

    expect(playChimeSong).not.toHaveBeenCalled();
  });

  it("does not trigger while dragging", () => {
    const draggingState: DragState = {
      isDragging: true,
      activeHand: "minute",
    };
    const { rerender } = render(<Harness dragState={draggingState} time={{ hours: 9, minutes: 54, seconds: 59, milliseconds: 900 }} />);

    rerender(<Harness dragState={draggingState} time={{ hours: 9, minutes: 55, seconds: 0, milliseconds: 0 }} />);

    expect(playChimeSong).not.toHaveBeenCalled();
  });
});
