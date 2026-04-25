import fantasiaLogo from "../../assets/fantasia/logo/seiko-fantasia-logo.svg";
import styles from "./TopControlBar.module.css";
import { SyncButton } from "./SyncButton";
import type { ClockMode } from "../../types/clock";

type TopControlBarProps = {
  onSync: () => void;
  mode: ClockMode;
  formattedTime: string;
};

export function TopControlBar({ onSync, mode, formattedTime }: TopControlBarProps) {
  return (
    <header className={styles.bar}>
      <img className={styles.logo} src={fantasiaLogo} alt="SEIKO FANTASIA" />
      <div className={styles.actions}>
        <span className={styles.modePill} data-mode={mode}>
          {mode === "live" ? "Live mode" : "Adjusted mode"}
        </span>
        <div className={styles.digitalTime} aria-label="Digital time" aria-live="polite">
          {formattedTime}
        </div>
        <SyncButton onClick={onSync} />
      </div>
    </header>
  );
}
