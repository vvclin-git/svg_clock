import type { HandType } from "./clock";

export type ClockSceneId = "default" | "fantasia";

export type ElementAnimationKind = "none" | "rotate" | "pulse" | "fade" | "swing";
export type ElementAnimationTrigger =
  | "always"
  | "onLiveTick"
  | "onMinuteChange"
  | "onHourChange"
  | "onPointerDown"
  | "onPointerUp"
  | "manual";
export type ClockElementSlot = "clockface" | "numerals" | "decorations" | "hands" | "center-cap";

export type ElementAnimationConfig = {
  enabled: boolean;
  kind: ElementAnimationKind;
  trigger: ElementAnimationTrigger;
  durationMs?: number;
  delayMs?: number;
  easing?: string;
  iterationCount?: number | "infinite";
};

export type ElementPolarPosition = {
  angle: number;
  radius: number;
  centerX?: number;
  centerY?: number;
};

export type BaseAssetElement = {
  id: string;
  src: string;
  visible?: boolean;
  x: number;
  y: number;
  polar?: ElementPolarPosition;
  width: number;
  height: number;
  rotation?: number;
  scale?: number;
  opacity?: number;
  anchorX?: number;
  anchorY?: number;
  preserveAspectRatio?: string;
  zSlot: ClockElementSlot;
  animation?: ElementAnimationConfig;
};

export type ClockfaceElement = BaseAssetElement & {
  zSlot: "clockface";
};

export type NumeralElement = BaseAssetElement & {
  zSlot: "numerals";
  hourIndex: number;
};

export type DecorationElement = BaseAssetElement & {
  zSlot: "decorations" | "center-cap";
  decorationType?: "logo" | "text" | "jewel" | "plaque" | "center-cap" | "other";
};

export type HandInteractionConfig = {
  draggable?: boolean;
  hitLength: number;
  hitWidth: number;
  offsetX?: number;
  offsetY?: number;
};

export type HandMotionConfig = {
  sweep?: "smooth" | "tick";
};

export type HandElement = BaseAssetElement & {
  zSlot: "hands";
  handType: HandType;
  interaction?: HandInteractionConfig;
  motion?: HandMotionConfig;
};

export type ClockSceneDefinition = {
  id: ClockSceneId;
  label: string;
  clockface: ClockfaceElement[];
  numerals: NumeralElement[];
  decorations: DecorationElement[];
  hands: HandElement[];
};
