export type FaceStyle = "minimal" | "classic" | "roman";
export type HandStyle = "bar" | "sword" | "breguet";

export type ClockSettings = {
  showSecondHand: boolean;
  showDigitalTime: boolean;
  faceStyle: FaceStyle;
  handStyle: HandStyle;
};
