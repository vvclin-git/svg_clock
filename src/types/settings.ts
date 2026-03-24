export type FaceStyle = "minimal" | "classic" | "roman" | "dual-ring";
export type HandStyle = "bar" | "sword" | "breguet";

export type ClockSettings = {
  showSecondHand: boolean;
  showDigitalTime: boolean;
  faceStyle: FaceStyle;
  handStyle: HandStyle;
};
