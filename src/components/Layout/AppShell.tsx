import { useState } from "react";
import { AnalogClock } from "../AnalogClock/AnalogClock";
import { TopControlBar } from "../TopControlBar/TopControlBar";
import styles from "./AppShell.module.css";
import { DEFAULT_CLOCK_SETTINGS } from "../../constants/clock";
import { useClockEngine } from "../../hooks/useClockEngine";

export function AppShell() {
  const [settings, setSettings] = useState(DEFAULT_CLOCK_SETTINGS);
  const clock = useClockEngine(settings);

  const toggleDigitalTime = () => {
    setSettings((current) => ({
      ...current,
      showDigitalTime: !current.showDigitalTime,
    }));
  };

  return (
    <div className={styles.shell}>
      <TopControlBar
        onSync={clock.syncToNow}
        mode={clock.mode}
        showDigitalTime={settings.showDigitalTime}
        onToggleDigitalTime={toggleDigitalTime}
      />
      <main className={styles.main}>
        <AnalogClock clock={clock} settings={settings} />
      </main>
    </div>
  );
}
