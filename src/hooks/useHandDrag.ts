import { useRef } from "react";
import type { PointerEventHandler } from "react";
import type { HandType } from "../types/clock";
import { usePointerAngle } from "./usePointerAngle";

type DragApi = {
  beginDrag: (hand: HandType, startAngle: number) => void;
  updateDrag: (angle: number) => void;
  endDrag: () => void;
};

type HandDragProps = {
  onPointerDown: PointerEventHandler<SVGLineElement>;
  onPointerMove: PointerEventHandler<SVGLineElement>;
  onPointerUp: PointerEventHandler<SVGLineElement>;
  onPointerCancel: PointerEventHandler<SVGLineElement>;
};

export function useHandDrag(api: DragApi) {
  const activePointerIdRef = useRef<number | null>(null);
  const pointerAngle = usePointerAngle();

  const getHandDragProps = (hand: HandType): HandDragProps => ({
    onPointerDown: (event) => {
      event.preventDefault();
      activePointerIdRef.current = event.pointerId;
      event.currentTarget.setPointerCapture(event.pointerId);
      api.beginDrag(hand, pointerAngle(event));
    },
    onPointerMove: (event) => {
      if (activePointerIdRef.current !== event.pointerId) {
        return;
      }

      api.updateDrag(pointerAngle(event));
    },
    onPointerUp: (event) => {
      if (activePointerIdRef.current !== event.pointerId) {
        return;
      }

      event.currentTarget.releasePointerCapture(event.pointerId);
      activePointerIdRef.current = null;
      api.endDrag();
    },
    onPointerCancel: (event) => {
      if (activePointerIdRef.current !== event.pointerId) {
        return;
      }

      activePointerIdRef.current = null;
      api.endDrag();
    },
  });

  return { getHandDragProps };
}
