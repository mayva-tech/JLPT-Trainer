type Props = {
  confidence: number;
  max?: number;
};

export function ConfidenceHearts({ confidence, max = 5 }: Props) {
  const hearts = Array.from({ length: max }, (_, index) => index < confidence);
  return (
    <div
      className="ppq-confidence"
      aria-label={`Confidence ${confidence} of ${max}`}
    >
      <span>Confidence</span>
      <span className="ppq-confidence-hearts" aria-hidden="true">
        {hearts.map((alive, index) => (
          <span key={index}>{alive ? "❤️" : "🖤"}</span>
        ))}
      </span>
    </div>
  );
}
