import styles from "./DigitalTimeDisplay.module.css";

type DigitalTimeDisplayProps = {
  value: string;
};

export function DigitalTimeDisplay({ value }: DigitalTimeDisplayProps) {
  return (
    <div className={styles.readout} aria-label="Digital time" aria-live="polite">
      {value}
    </div>
  );
}
