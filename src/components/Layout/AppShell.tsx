import { useState } from "react";
import { AnalogClock } from "../AnalogClock/AnalogClock";
import { ChimeSettingsPanel } from "../Settings/ChimeSettingsPanel";
import { TopControlBar } from "../TopControlBar/TopControlBar";
import styles from "./AppShell.module.css";
import { DEFAULT_CLOCK_SETTINGS } from "../../constants/clock";
import { useChimeScheduler } from "../../hooks/useChimeScheduler";
import { useClockEngine } from "../../hooks/useClockEngine";
import type { ClockSettings } from "../../types/settings";

export function AppShell() {
  const [settings, setSettings] = useState<ClockSettings>(DEFAULT_CLOCK_SETTINGS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const clock = useClockEngine(settings);
  const chime = useChimeScheduler({
    settings: settings.chime,
    displayedTime: clock.displayedTime,
    mode: clock.mode,
    dragState: clock.dragState,
  });

  return (
    <div className={styles.shell}>
      <TopControlBar
        onSync={clock.syncToNow}
        onToggleSettings={() => setSettingsOpen((isOpen) => !isOpen)}
        mode={clock.mode}
        formattedTime={clock.formattedTime}
        settingsOpen={settingsOpen}
      />
      {settingsOpen ? <ChimeSettingsPanel settings={settings} onSettingsChange={setSettings} playbackStatus={chime.playbackStatus} /> : null}
      <main className={styles.main}>
        <AnalogClock clock={clock} settings={settings} />
      </main>
    </div>
  );
}
