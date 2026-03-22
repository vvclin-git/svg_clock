import { useEffect } from "react";

export function useClockTicker(enabled: boolean, onTick: () => void) {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    onTick();
    const intervalId = window.setInterval(onTick, 100);

    return () => window.clearInterval(intervalId);
  }, [enabled, onTick]);
}
