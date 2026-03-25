import type { PointerEventHandler } from "react";
import type { HandType } from "../../types/clock";

type HandHitAreaProps = {
  hand: HandType;
  angle: number;
  radius: number;
  offsetX: number;
  offsetY: number;
  radialOffset: number;
  onPointerDown: PointerEventHandler<SVGLineElement>;
  onPointerMove: PointerEventHandler<SVGLineElement>;
  onPointerUp: PointerEventHandler<SVGLineElement>;
  onPointerCancel: PointerEventHandler<SVGLineElement>;
};

export function HandHitArea({
  hand,
  angle,
  radius,
  offsetX,
  offsetY,
  radialOffset,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: HandHitAreaProps) {
  const endY = hand === "hour" ? 26 : 13;

  return (
    <line
      x1={50 + offsetX}
      y1={50 + offsetY + radialOffset}
      x2={50 + offsetX}
      y2={endY + offsetY + radialOffset}
      stroke="transparent"
      strokeWidth={radius}
      strokeLinecap="round"
      transform={`rotate(${angle} 50 50)`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      style={{ cursor: "grab", pointerEvents: "stroke" }}
    />
  );
}
