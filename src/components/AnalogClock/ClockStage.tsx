import type { ClockSettings } from "../../types/settings";
import type { UseClockEngineResult } from "../../hooks/useClockEngine";
import { ClockFace } from "./ClockFace";
import { ClockHands } from "./ClockHands";
import { ClockCenter } from "./ClockCenter";
import { DigitalTimeDisplay } from "./DigitalTimeDisplay";
import styles from "./ClockStage.module.css";

type ClockStageProps = {
  clock: UseClockEngineResult;
  settings: ClockSettings;
};

export function ClockStage({ clock, settings }: ClockStageProps) {
  return (
    <div className={styles.stage}>
      <svg className={styles.svg} viewBox="0 0 100 100" role="img" aria-label={clock.formattedTime}>
        <ClockFace faceStyle={settings.faceStyle} />
        <ClockHands clock={clock} settings={settings} />
        <ClockCenter />
      </svg>
      {settings.showDigitalTime ? <DigitalTimeDisplay value={clock.formattedTime} /> : null}
    </div>
  );
}
