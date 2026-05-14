import type { ChimeSong } from "../../types/chime";
import grandFathersClockSrc from "../../assets/chimes/grand-fathers-clock.mp3";
import openYourHandSrc from "../../assets/chimes/open-your-hand.mp3";
import shoujyoujiXfSrc from "../../assets/chimes/shoujyouji-xf.mp3";

export const chimeRegistry: ChimeSong[] = [
  {
    id: "grand-fathers-clock",
    label: "Grand Fathers Clock",
    assetKind: "audio",
    src: grandFathersClockSrc,
  },
  {
    id: "open-your-hand",
    label: "Open your hand",
    assetKind: "audio",
    src: openYourHandSrc,
  },
  {
    id: "shoujyouji-xf",
    label: "shoujyouji xf",
    assetKind: "audio",
    src: shoujyoujiXfSrc,
  },
];

export function getChimeSong(songId: string) {
  return chimeRegistry.find((song) => song.id === songId) ?? null;
}
