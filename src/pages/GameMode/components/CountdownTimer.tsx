type Props = {
  seconds: number;
};

export function CountdownTimer({ seconds }: Props) {
  const danger = seconds <= 10;
  const display = Math.max(0, seconds);
  return (
    <div
      className={danger ? "gm-timer gm-timer--danger" : "gm-timer"}
      aria-live="polite"
      aria-label={`${display} seconds remaining`}
    >
      {display}s
    </div>
  );
}
