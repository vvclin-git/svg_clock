import type { PointerEventHandler } from "react";
import type { HandType } from "../../types/clock";

type HandHitAreaProps = {
  hand: HandType;
  x: number;
  y: number;
  angle: number;
  length: number;
  strokeWidth: number;
  offsetX?: number;
  offsetY?: number;
  onPointerDown: PointerEventHandler<SVGLineElement>;
  onPointerMove: PointerEventHandler<SVGLineElement>;
  onPointerUp: PointerEventHandler<SVGLineElement>;
  onPointerCancel: PointerEventHandler<SVGLineElement>;
};

export function HandHitArea({
  hand,
  x,
  y,
  angle,
  length,
  strokeWidth,
  offsetX,
  offsetY,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: HandHitAreaProps) {
  const localOffsetX = offsetX ?? 0;
  const localOffsetY = offsetY ?? 0;
  const endY = y - length + localOffsetY;

  return (
    <line
      data-hand-hit-area={hand}
      x1={x + localOffsetX}
      y1={y + localOffsetY}
      x2={x + localOffsetX}
      y2={endY}
      stroke="transparent"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      transform={`rotate(${angle} ${x} ${y})`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      style={{ cursor: "grab", pointerEvents: "stroke" }}
    />
  );
}
