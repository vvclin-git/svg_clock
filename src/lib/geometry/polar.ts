export function pointToClockAngle(x: number, y: number, centerX: number, centerY: number) {
  const radians = Math.atan2(y - centerY, x - centerX);
  const degrees = (radians * 180) / Math.PI;
  return (degrees + 90 + 360) % 360;
}

export function clockPolarToPoint(angle: number, radius: number, centerX: number, centerY: number) {
  const radians = ((angle - 90) * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(radians),
    y: centerY + radius * Math.sin(radians),
  };
}
