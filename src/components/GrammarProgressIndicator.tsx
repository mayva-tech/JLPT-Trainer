import type { GrammarStep } from "../services/grammarAutoModeRunner";

const STEP_LABELS: Record<GrammarStep, string> = {
  category: "Category",
  pattern: "Pattern",
  formation: "Formation",
  sentence: "Sentence",
  shadowing: "Shadowing",
  review: "Review",
};

type Props = {
  current: number;
  total: number;
  step: GrammarStep;
};

export function GrammarProgressIndicator({ current, total, step }: Props) {
  return (
    <div aria-hidden="true">
      <div className="lesson-label">{STEP_LABELS[step]}</div>
      <div className="progress-label">
        {current + 1} / {total}
      </div>
    </div>
  );
}
