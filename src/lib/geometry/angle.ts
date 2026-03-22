export function getShortestClockwiseDelta(previousAngle: number, nextAngle: number) {
  let delta = nextAngle - previousAngle;

  if (delta > 180) {
    delta -= 360;
  } else if (delta < -180) {
    delta += 360;
  }

  return delta;
}
