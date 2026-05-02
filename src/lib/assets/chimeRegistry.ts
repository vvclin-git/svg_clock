import type { ChimeSong } from "../../types/chime";

export const chimeRegistry: ChimeSong[] = [];

export function getChimeSong(songId: string) {
  return chimeRegistry.find((song) => song.id === songId) ?? null;
}
