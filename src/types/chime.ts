export type ChimeAssetKind = "audio" | "midi";

export type ChimeSong = {
  id: string;
  label: string;
  assetKind: ChimeAssetKind;
  src?: string;
};

export type ChimePlaybackStatus =
  | {
      state: "idle";
      message: string;
    }
  | {
      state: "played";
      message: string;
      songId: string;
    }
  | {
      state: "unsupported";
      message: string;
      songId: string;
    }
  | {
      state: "error";
      message: string;
      songId: string;
    };
