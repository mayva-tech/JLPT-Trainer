import type { StepName } from "../types/player";

const STEP_LABELS: Record<StepName, string> = {
  category: "Category",
  word: "Word",
  phrase: "Phrase",
  sentence: "Sentence",
  shadowing: "Shadowing",
  review: "Review",
};

type Props = {
  current: number;
  total: number;
  step: StepName;
};

export function ProgressIndicator({ current, total, step }: Props) {
  return (
    <div aria-hidden="true">
      <div className="lesson-label">{STEP_LABELS[step]}</div>
      <div className="progress-label">
        {current + 1} / {total}
      </div>
    </div>
  );
}
