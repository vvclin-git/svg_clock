import type { HandType } from "./clock";

export type DragState = {
  isDragging: boolean;
  activeHand: HandType | null;
};
