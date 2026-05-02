import type { ChimePlaybackStatus, ChimeSong } from "../../types/chime";

export async function playChimeSong(song: ChimeSong | null): Promise<ChimePlaybackStatus> {
  if (!song) {
    return {
      state: "error",
      message: "No chime song is registered.",
      songId: "",
    };
  }

  if (song.assetKind === "midi") {
    return {
      state: "unsupported",
      message: "MIDI chime playback is not supported yet.",
      songId: song.id,
    };
  }

  if (!song.src) {
    return {
      state: "error",
      message: "The selected chime song has no audio file.",
      songId: song.id,
    };
  }

  try {
    const audio = new Audio(song.src);
    await audio.play();

    return {
      state: "played",
      message: `Playing ${song.label}.`,
      songId: song.id,
    };
  } catch {
    return {
      state: "error",
      message: "The browser blocked or failed chime playback.",
      songId: song.id,
    };
  }
}
