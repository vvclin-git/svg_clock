export function pointToClockAngle(x: number, y: number, centerX: number, centerY: number) {
  const radians = Math.atan2(y - centerY, x - centerX);
  const degrees = (radians * 180) / Math.PI;
  return (degrees + 90 + 360) % 360;
}
