import type { ClockSettings } from "../../types/settings";
import type { UseClockEngineResult } from "../../hooks/useClockEngine";
import { ClockStage } from "./ClockStage";
import styles from "./AnalogClock.module.css";

type AnalogClockProps = {
  clock: UseClockEngineResult;
  settings: ClockSettings;
};

export function AnalogClock({ clock, settings }: AnalogClockProps) {
  return (
    <section className={styles.wrapper} aria-label="Analog clock">
      <ClockStage clock={clock} settings={settings} />
    </section>
  );
}
