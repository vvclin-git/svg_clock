import { AnalogClock } from "../AnalogClock/AnalogClock";
import { TopControlBar } from "../TopControlBar/TopControlBar";
import styles from "./AppShell.module.css";
import { DEFAULT_CLOCK_SETTINGS } from "../../constants/clock";
import { useClockEngine } from "../../hooks/useClockEngine";

export function AppShell() {
  const clock = useClockEngine(DEFAULT_CLOCK_SETTINGS);

  return (
    <div className={styles.shell}>
      <TopControlBar onSync={clock.syncToNow} mode={clock.mode} />
      <main className={styles.main}>
        <AnalogClock clock={clock} settings={DEFAULT_CLOCK_SETTINGS} />
      </main>
    </div>
  );
}
