import styles from "./SyncButton.module.css";

type SyncButtonProps = {
  onClick: () => void;
};

export function SyncButton({ onClick }: SyncButtonProps) {
  return (
    <button className={styles.button} type="button" onClick={onClick}>
      Sync
    </button>
  );
}
