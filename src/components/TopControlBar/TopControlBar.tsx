import styles from "./TopControlBar.module.css";
import { SyncButton } from "./SyncButton";
import type { ClockMode } from "../../types/clock";

type TopControlBarProps = {
  onSync: () => void;
  mode: ClockMode;
};

export function TopControlBar({ onSync, mode }: TopControlBarProps) {
  return (
    <header className={styles.bar}>
      <div>
        <p className={styles.eyebrow}>Analog Clock MVP</p>
        <h1 className={styles.title}>Local time with direct hand control</h1>
      </div>
      <div className={styles.actions}>
        <span className={styles.modePill} data-mode={mode}>
          {mode === "live" ? "Live mode" : "Manual mode"}
        </span>
        <SyncButton onClick={onSync} />
      </div>
    </header>
  );
}
