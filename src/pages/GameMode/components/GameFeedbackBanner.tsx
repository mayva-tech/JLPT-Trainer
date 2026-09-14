import type { GameFeedback } from "../../../utils/gameMode/types";

type Props = {
  feedback: GameFeedback | null;
};

export function GameFeedbackBanner({ feedback }: Props) {
  if (!feedback) return null;
  return (
    <div className={`gm-feedback gm-feedback--${feedback.kind}`} role="status">
      <div className="gm-feedback-title">{feedback.title}</div>
      {feedback.detail ? <div className="gm-feedback-detail">{feedback.detail}</div> : null}
      {feedback.combo != null && feedback.combo > 1 ? (
        <div className="gm-feedback-combo">🔥 Combo ×{feedback.combo}</div>
      ) : null}
    </div>
  );
}
