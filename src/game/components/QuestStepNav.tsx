type Props = {
  canBack: boolean;
  canRetry: boolean;
  canForward: boolean;
  forwardLabel: string;
  onBack: () => void;
  onRetry: () => void;
  onForward: () => void;
};

/**
 * Shared dialogue footer: Back | Try Again | Forward/Continue.
 */
export function QuestStepNav({
  canBack,
  canRetry,
  canForward,
  forwardLabel,
  onBack,
  onRetry,
  onForward,
}: Props) {
  return (
    <div
      className="ppq-actions ppq-step-nav"
      role="group"
      aria-label="Quest step navigation"
    >
      <button
        type="button"
        className="ppq-btn ppq-btn--ghost"
        data-testid="quest-nav-back"
        aria-label="Go to previous step"
        disabled={!canBack}
        onClick={onBack}
      >
        ← Back
      </button>
      <button
        type="button"
        className="ppq-btn ppq-btn--secondary"
        data-testid="quest-nav-retry"
        aria-label="Try this step again"
        disabled={!canRetry}
        onClick={onRetry}
      >
        ↺ Try Again
      </button>
      <button
        type="button"
        className="ppq-btn ppq-btn--primary"
        data-testid="quest-nav-forward"
        aria-label={forwardLabel}
        disabled={!canForward}
        onClick={onForward}
      >
        {forwardLabel}
      </button>
    </div>
  );
}
