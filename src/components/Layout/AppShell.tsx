import { useEffect, useState } from "react";
import { AnalogClock } from "../AnalogClock/AnalogClock";
import { ChimeSettingsPanel } from "../Settings/ChimeSettingsPanel";
import { TopControlBar } from "../TopControlBar/TopControlBar";
import styles from "./AppShell.module.css";
import { useChimeScheduler } from "../../hooks/useChimeScheduler";
import { useClockEngine } from "../../hooks/useClockEngine";
import { loadClockSettings, saveClockSettings } from "../../lib/settings/settingsPersistence";
import type { ClockSettings } from "../../types/settings";

export function AppShell() {
  const [settings, setSettings] = useState<ClockSettings>(() => loadClockSettings());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const clock = useClockEngine(settings);
  const chime = useChimeScheduler({
    settings: settings.chime,
    displayedTime: clock.displayedTime,
    mode: clock.mode,
    dragState: clock.dragState,
  });

  useEffect(() => {
    saveClockSettings(settings);
  }, [settings]);

  return (
    <div className={styles.shell}>
      <TopControlBar
        onSync={clock.syncToNow}
        onToggleSettings={() => setSettingsOpen((isOpen) => !isOpen)}
        mode={clock.mode}
        formattedTime={clock.formattedTime}
        settingsOpen={settingsOpen}
      />
      {settingsOpen ? (
        <ChimeSettingsPanel
          settings={settings}
          onSettingsChange={setSettings}
          playbackStatus={chime.playbackStatus}
          nextTriggerLabel={chime.nextTriggerLabel}
          nextTargetLabel={chime.nextTargetLabel}
          nextSongLabel={chime.nextSongLabel}
          onPrimeChime={chime.unlockSelectedSong}
          onTestChime={chime.playSelectedSong}
        />
      ) : null}
      <main className={styles.main}>
        <AnalogClock clock={clock} settings={settings} visualActionEpoch={chime.visualActionEpoch} />
      </main>
    </div>
  );
}
