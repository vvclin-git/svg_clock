import type { PointerEventHandler } from "react";
import type { HandType } from "../../types/clock";

type HandHitAreaProps = {
  hand: HandType;
  angle: number;
  radius: number;
  onPointerDown: PointerEventHandler<SVGLineElement>;
  onPointerMove: PointerEventHandler<SVGLineElement>;
  onPointerUp: PointerEventHandler<SVGLineElement>;
  onPointerCancel: PointerEventHandler<SVGLineElement>;
};

export function HandHitArea({
  hand,
  angle,
  radius,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: HandHitAreaProps) {
  const endY = hand === "hour" ? 26 : 13;

  return (
    <line
      x1="50"
      y1="50"
      x2="50"
      y2={endY}
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
