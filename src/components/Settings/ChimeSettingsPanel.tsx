import type { ChangeEvent } from "react";
import { chimeRegistry } from "../../lib/assets/chimeRegistry";
import type { ChimePlaybackStatus } from "../../types/chime";
import type { ChimeScheduleMode, ClockSettings } from "../../types/settings";
import styles from "./ChimeSettingsPanel.module.css";

type ChimeSettingsPanelProps = {
  settings: ClockSettings;
  onSettingsChange: (settings: ClockSettings) => void;
  playbackStatus: ChimePlaybackStatus;
  nextTriggerLabel: string | null;
  nextTargetLabel: string | null;
  nextSongLabel: string | null;
  onPrimeChime: () => Promise<void>;
  onTestChime: () => Promise<void>;
};

function clampNumber(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function ChimeSettingsPanel({
  settings,
  onSettingsChange,
  playbackStatus,
  nextTriggerLabel,
  nextTargetLabel,
  nextSongLabel,
  onPrimeChime,
  onTestChime,
}: ChimeSettingsPanelProps) {
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

  const updateEnabled = (event: ChangeEvent<HTMLInputElement>) => {
    updateChime({ enabled: event.target.checked });

    if (event.target.checked) {
      void onPrimeChime();
    }
  };

  const updateExactEventTime = (index: number, value: string) => {
    updateChime({
      exactChimeEvents: settings.chime.exactChimeEvents.map((event, eventIndex) =>
        eventIndex === index ? { ...event, time: value } : event,
      ),
    });
  };

  const updateExactEventSong = (index: number, songId: string) => {
    updateChime({
      exactChimeEvents: settings.chime.exactChimeEvents.map((event, eventIndex) =>
        eventIndex === index ? { ...event, songId } : event,
      ),
    });
  };

  const addExactTime = () => {
    updateChime({
      exactChimeEvents: [...settings.chime.exactChimeEvents, { time: "12:00", songId: settings.chime.songId }],
    });
  };

  const removeExactTime = (index: number) => {
    const nextEvents = settings.chime.exactChimeEvents.filter((_, eventIndex) => eventIndex !== index);
    updateChime({
      exactChimeEvents: nextEvents.length > 0 ? nextEvents : [{ time: "12:00", songId: settings.chime.songId }],
    });
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
            <p className={styles.nextChime}>
              {settings.chime.enabled && nextTriggerLabel
                ? `Next trigger ${nextTriggerLabel}${nextTargetLabel && nextTargetLabel !== nextTriggerLabel ? ` for ${nextTargetLabel}` : ""}${
                    nextSongLabel ? ` - ${nextSongLabel}` : ""
                  }`
                : "Chiming is disabled."}
            </p>
          </div>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={settings.chime.enabled}
              onChange={updateEnabled}
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
            <span>Lead time (min before)</span>
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
            <div className={styles.songControls}>
              <select
                aria-label="Song"
                value={settings.chime.songId}
                onChange={(event) => updateChime({ songId: event.target.value })}
              >
                <option value="">No song registered</option>
                {chimeRegistry.map((song) => (
                  <option key={song.id} value={song.id}>
                    {song.label}
                  </option>
                ))}
              </select>
              <button type="button" onClick={() => void onTestChime()} disabled={!settings.chime.songId}>
                Test
              </button>
            </div>
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
            {settings.chime.exactChimeEvents.map((event, index) => (
              <div className={styles.timeRow} key={`${event.time}-${index}`}>
                <input
                  aria-label={`Exact target time ${index + 1}`}
                  type="text"
                  inputMode="numeric"
                  pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
                  placeholder="HH:MM"
                  value={event.time}
                  disabled={settings.chime.scheduleMode !== "exactTimes"}
                  onChange={(changeEvent) => updateExactEventTime(index, changeEvent.target.value)}
                />
                <select
                  aria-label={`Exact target song ${index + 1}`}
                  value={event.songId}
                  disabled={settings.chime.scheduleMode !== "exactTimes"}
                  onChange={(changeEvent) => updateExactEventSong(index, changeEvent.target.value)}
                >
                  {chimeRegistry.map((song) => (
                    <option key={song.id} value={song.id}>
                      {song.label}
                    </option>
                  ))}
                </select>
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
