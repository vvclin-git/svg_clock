import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ChimeSong } from "../../types/chime";
import { playChimeSong, unlockChimeSong } from "./chimePlayback";

const audioSong: ChimeSong = {
  id: "test-audio",
  label: "Test audio",
  assetKind: "audio",
  src: "/test.wav",
};

const midiSong: ChimeSong = {
  id: "test-midi",
  label: "Test MIDI",
  assetKind: "midi",
  src: "/test.mid",
};

const audioInstances: FakeAudio[] = [];

class FakeAudio {
  currentTime = 0;
  muted = false;
  pause = vi.fn();
  play = vi.fn<() => Promise<void>>(async () => undefined);
  preload = "";
  src: string;
  volume = 1;

  constructor(src?: string) {
    this.src = src ?? "";
    audioInstances.push(this);
  }
}

describe("chimePlayback", () => {
  beforeEach(() => {
    audioInstances.length = 0;
    vi.stubGlobal("Audio", FakeAudio);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("plays registered browser audio files", async () => {
    const status = await playChimeSong(audioSong);

    expect(status).toMatchObject({ state: "played", songId: "test-audio" });
    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0].src).toBe("/test.wav");
    expect(audioInstances[0].play).toHaveBeenCalledTimes(1);
  });

  it("unlocks audio from a user gesture without leaving it playing", async () => {
    const status = await unlockChimeSong({ ...audioSong, id: "unlock-audio" });

    expect(status).toMatchObject({ state: "ready", songId: "unlock-audio" });
    expect(audioInstances[0].play).toHaveBeenCalledTimes(1);
    expect(audioInstances[0].pause).toHaveBeenCalledTimes(1);
    expect(audioInstances[0].currentTime).toBe(0);
    expect(audioInstances[0].muted).toBe(false);
    expect(audioInstances[0].volume).toBe(1);
  });

  it("keeps MIDI entries unsupported for static GitHub Pages playback", async () => {
    const status = await playChimeSong(midiSong);

    expect(status).toMatchObject({ state: "unsupported", songId: "test-midi" });
    expect(audioInstances).toHaveLength(0);
  });
});
