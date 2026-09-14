type Props = {
  seconds: number;
  total?: number;
};

export function CountdownTimer({ seconds, total = 60 }: Props) {
  const urgent = seconds <= 10;
  const ratio = total <= 0 ? 0 : Math.max(0, Math.min(1, seconds / total));
  return (
    <div
      className={urgent ? "gm-timer gm-timer--urgent" : "gm-timer"}
      aria-label={`${seconds} seconds remaining`}
    >
      <div className="gm-timer__value">{seconds}s</div>
      <div className="gm-timer__track">
        <div
          className="gm-timer__fill"
          style={{ width: `${Math.round(ratio * 100)}%` }}
        />
      </div>
    </div>
  );
}
