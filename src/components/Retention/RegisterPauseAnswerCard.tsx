import { useRef } from "react";
import type { CheckPhase } from "../../services/autoModeRunner";
import {
  registerCheckQuestion,
  type RegisterCheckCard,
} from "../../utils/registerRetention";
import { useFitAboveBar } from "./useFitAboveBar";
import "./retention.css";

/**
 * "Pause & answer" for the Register page — same phases as the Player card:
 *   ask     question + three options while the prompt is spoken
 *   think   countdown ring ("pause the video if you need more time")
 *   reveal  correct option lit, the others dimmed, the full pair shown
 */
export function RegisterPauseAnswerCard({
  card,
  phase,
  thinkMs,
}: {
  card: RegisterCheckCard;
  phase: CheckPhase;
  thinkMs: number;
}) {
  const { pair } = card;
  const revealed = phase === "reveal";
  const bodyRef = useRef<HTMLDivElement>(null);
  useFitAboveBar(bodyRef, `${pair.id}-${card.number}-${phase}`);
  return (
    <div
      className={`safe-area ret-check ret-check--register ret-check--${phase}`}
      key={`${pair.id}-${card.number}`}
    >
      <div className="ret-check-body" ref={bodyRef}>
        <div className="ret-check-tag">⏸ Pause &amp; answer</div>
        <div className="ret-check-question" data-head-avoid>{registerCheckQuestion(card)}</div>
        {card.kind === "polite" ? (
          <div className="ret-check-prompt-en" data-head-avoid>“{pair.meaning}”</div>
        ) : (
          <div className="ret-check-word ret-check-word--line" lang="ja" data-head-avoid>
            {revealed ? (
              <ruby>
                {pair.formal.text}
                <rt>{pair.formal.reading}</rt>
              </ruby>
            ) : (
              pair.formal.text
            )}
          </div>
        )}
        <ol className="ret-options" data-head-avoid>
          {card.options.map((o) => (
            <li
              key={o.label}
              className={
                revealed
                  ? o.correct
                    ? "ret-option ret-option--correct"
                    : "ret-option ret-option--wrong"
                  : "ret-option"
              }
              lang={o.lang}
            >
              <span className="ret-option-label">{o.label}</span>
              <span className="ret-option-text">{o.text}</span>
              {revealed && o.correct && <span className="ret-option-tick">✓</span>}
            </li>
          ))}
        </ol>
        {revealed && (
          <div className="ret-check-answer" data-head-avoid>
            <span lang="ja">{pair.formal.text}</span> — {pair.meaning}
          </div>
        )}
        {!revealed && (
          <div className="ret-check-think">
            {phase === "think" && (
              <span
                className="ret-ring ret-ring--small"
                style={{ animationDuration: `${thinkMs}ms` }}
              />
            )}
            Pause the video if you need more time
          </div>
        )}
      </div>
    </div>
  );
}
