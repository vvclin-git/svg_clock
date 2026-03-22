import styles from "./DigitalTimeDisplay.module.css";

type DigitalTimeDisplayProps = {
  value: string;
};

export function DigitalTimeDisplay({ value }: DigitalTimeDisplayProps) {
  return (
    <div className={styles.readout} aria-live="polite">
      {value}
    </div>
  );
}
