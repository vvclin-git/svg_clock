import minimalFace from "../../assets/faces/minimal-face.svg";
import classicFace from "../../assets/faces/classic-face.svg";
import romanFace from "../../assets/faces/roman-face.svg";
import type { FaceStyle } from "../../types/settings";

export const faceRegistry: Record<FaceStyle, string> = {
  minimal: minimalFace,
  classic: classicFace,
  roman: romanFace,
};
