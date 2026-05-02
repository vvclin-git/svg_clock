import type { ChangeEvent } from "react";
import { chimeRegistry } from "../../lib/assets/chimeRegistry";
import type { ChimePlaybackStatus } from "../../types/chime";
import type { ChimeScheduleMode, ClockSettings } from "../../types/settings";
import styles from "./ChimeSettingsPanel.module.css";

type ChimeSettingsPanelProps = {
  settings: ClockSettings;
  onSettingsChange: (settings: ClockSettings) => void;
  playbackStatus: ChimePlaybackStatus;
};

function clampNumber(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function ChimeSettingsPanel({ settings, onSettingsChange, playbackStatus }: ChimeSettingsPanelProps) {
  const updateChime = (partialSettings: Partial<ClockSettings["chime"]>) => {
    onSettingsChange({
      ...settings,
      chime: {
        ...settings.chime,
        ...partialSettings,
      },
    });
  };

  const updateScheduleMode = (event: ChangeEvent<HTMLSelectElement>) => {
    updateChime({ scheduleMode: event.target.value as ChimeScheduleMode });
  };

  const updateExactTime = (index: number, value: string) => {
    updateChime({
      exactTargetTimes: settings.chime.exactTargetTimes.map((time, timeIndex) => (timeIndex === index ? value : time)),
    });
  };

  const addExactTime = () => {
    updateChime({ exactTargetTimes: [...settings.chime.exactTargetTimes, "12:00"] });
  };

  const removeExactTime = (index: number) => {
    const nextTimes = settings.chime.exactTargetTimes.filter((_, timeIndex) => timeIndex !== index);
    updateChime({ exactTargetTimes: nextTimes.length > 0 ? nextTimes : ["12:00"] });
  };

  return (
    <section id="clock-settings" className={styles.panel} aria-label="Clock settings">
      <div className={styles.inner}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Chiming</h2>
            <p className={styles.status} aria-live="polite">
              {playbackStatus.message}
            </p>
          </div>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={settings.chime.enabled}
              onChange={(event) => updateChime({ enabled: event.target.checked })}
            />
            <span>Enabled</span>
          </label>
        </div>

        <div className={styles.grid}>
          <label className={styles.field}>
            <span>Schedule</span>
            <select value={settings.chime.scheduleMode} onChange={updateScheduleMode}>
              <option value="hourly">Hourly</option>
              <option value="intervalCount">Times per day</option>
              <option value="exactTimes">Exact times</option>
            </select>
          </label>

          <label className={styles.field}>
            <span>Times per day</span>
            <input
              type="number"
              min="1"
              max="24"
              step="1"
              value={settings.chime.timesPerDay}
              disabled={settings.chime.scheduleMode !== "intervalCount"}
              onChange={(event) => updateChime({ timesPerDay: clampNumber(Number(event.target.value), 1, 24) })}
            />
          </label>

          <label className={styles.field}>
            <span>Lead time</span>
            <input
              type="number"
              min="0"
              max="1439"
              step="1"
              value={settings.chime.leadTimeMinutes}
              onChange={(event) => updateChime({ leadTimeMinutes: clampNumber(Number(event.target.value), 0, 1439) })}
            />
          </label>

          <label className={styles.field}>
            <span>Song</span>
            <select value={settings.chime.songId} onChange={(event) => updateChime({ songId: event.target.value })}>
              <option value="">No song registered</option>
              {chimeRegistry.map((song) => (
                <option key={song.id} value={song.id}>
                  {song.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={styles.exactTimes} data-disabled={settings.chime.scheduleMode !== "exactTimes"}>
          <div className={styles.exactTimesHeader}>
            <span>Exact target times</span>
            <button type="button" onClick={addExactTime} disabled={settings.chime.scheduleMode !== "exactTimes"}>
              Add
            </button>
          </div>
          <div className={styles.timeList}>
            {settings.chime.exactTargetTimes.map((time, index) => (
              <div className={styles.timeRow} key={`${time}-${index}`}>
                <input
                  aria-label={`Exact target time ${index + 1}`}
                  type="time"
                  value={time}
                  disabled={settings.chime.scheduleMode !== "exactTimes"}
                  onChange={(event) => updateExactTime(index, event.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeExactTime(index)}
                  disabled={settings.chime.scheduleMode !== "exactTimes"}
                  aria-label={`Remove exact target time ${index + 1}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
