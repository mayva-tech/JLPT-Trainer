import { checkQuestion, type CheckCard } from "./retentionQuiz";
import type { CheckPhase } from "../../services/autoModeRunner";
import "./retention.css";

/**
 * "Pause & answer" — one three-choice question about a word just taught.
 *   ask     question + options while the prompt is spoken
 *   think   countdown ring ("pause the video if you need more time")
 *   reveal  correct option lit, the others dimmed, reading and meaning shown
 */
export function PauseAnswerCard({
  card,
  phase,
  thinkMs,
}: {
  card: CheckCard;
  phase: CheckPhase;
  thinkMs: number;
}) {
  const { item } = card;
  const revealed = phase === "reveal";
  return (
    <div className={`safe-area ret-check ret-check--${phase}`} key={`${item.id}-${card.number}`}>
      <div className="ret-check-tag">⏸ Pause &amp; answer</div>
      <div className="ret-check-question">{checkQuestion(card)}</div>
      <div className="ret-check-word" lang="ja">
        {revealed && card.kind === "reading" ? (
          <ruby>
            {item.word}
            <rt>{item.reading}</rt>
          </ruby>
        ) : (
          item.word
        )}
      </div>
      <ol className="ret-options">
        {card.options.map((o) => (
          <li
            key={o.label}
            className={
              revealed ? (o.correct ? "ret-option ret-option--correct" : "ret-option ret-option--wrong") : "ret-option"
            }
            lang={card.kind === "reading" ? "ja" : undefined}
          >
            <span className="ret-option-label">{o.label}</span>
            <span className="ret-option-text">{o.text}</span>
            {revealed && o.correct && <span className="ret-option-tick">✓</span>}
          </li>
        ))}
      </ol>
      {revealed && (
        <div className="ret-check-answer">
          <span lang="ja">
            {item.word}【{item.reading}】
          </span>{" "}
          — {item.meaning}
        </div>
      )}
      {!revealed && (
        <div className="ret-check-think">
          {phase === "think" && (
            <span className="ret-ring ret-ring--small" style={{ animationDuration: `${thinkMs}ms` }} />
          )}
          Pause the video if you need more time
        </div>
      )}
    </div>
  );
}
