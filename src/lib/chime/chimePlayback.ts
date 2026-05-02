import type { ChimePlaybackStatus, ChimeSong } from "../../types/chime";

const audioElements = new Map<string, HTMLAudioElement>();

function getAudioElement(song: ChimeSong) {
  const existingAudio = audioElements.get(song.id);

  if (existingAudio) {
    return existingAudio;
  }

  const audio = new Audio(song.src);
  audio.preload = "auto";
  audioElements.set(song.id, audio);

  return audio;
}

function getNoSongStatus(): ChimePlaybackStatus {
  return {
    state: "error",
    message: "No chime song is registered.",
    songId: "",
  };
}

function getPlayableSongStatus(song: ChimeSong): ChimePlaybackStatus | null {
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

  return null;
}

export async function unlockChimeSong(song: ChimeSong | null): Promise<ChimePlaybackStatus> {
  if (!song) {
    return getNoSongStatus();
  }

  const status = getPlayableSongStatus(song);

  if (status) {
    return status;
  }

  const audio = getAudioElement(song);

  try {
    audio.muted = true;
    audio.volume = 0;
    audio.currentTime = 0;
    await audio.play();
    audio.pause();
    audio.currentTime = 0;
    audio.muted = false;
    audio.volume = 1;

    return {
      state: "ready",
      message: `${song.label} is ready for scheduled playback.`,
      songId: song.id,
    };
  } catch {
    audio.muted = false;
    audio.volume = 1;

    return {
      state: "error",
      message: "The browser blocked chime audio. Use Test chime once before relying on scheduled playback.",
      songId: song.id,
    };
  }
}

export async function playChimeSong(song: ChimeSong | null): Promise<ChimePlaybackStatus> {
  if (!song) {
    return getNoSongStatus();
  }

  const status = getPlayableSongStatus(song);

  if (status) {
    return status;
  }

  const audio = getAudioElement(song);

  try {
    audio.pause();
    audio.currentTime = 0;
    audio.muted = false;
    audio.volume = 1;
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
