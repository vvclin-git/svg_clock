import type { PointerEvent as ReactPointerEvent } from "react";
import { pointToClockAngle } from "../lib/geometry/polar";

export function usePointerAngle() {
  return (event: ReactPointerEvent<SVGElement>) => {
    const svg = event.currentTarget.ownerSVGElement ?? (event.currentTarget as SVGElement);
    const bounds = svg.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;

    return pointToClockAngle(event.clientX, event.clientY, centerX, centerY);
  };
}
