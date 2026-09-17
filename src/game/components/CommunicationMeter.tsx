type Props = {
  percent: number;
  label?: string;
};

export function CommunicationMeter({
  percent,
  label = "Communication",
}: Props) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div className="ppq-comm-meter" aria-label={`${label} ${clamped}%`}>
      <div className="ppq-comm-meter-head">
        <span>{label}</span>
        <span className="ppq-comm-meter-pct">{clamped}%</span>
      </div>
      <div className="ppq-comm-meter-track">
        <div
          className="ppq-comm-meter-fill"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
