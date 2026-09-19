import { useEffect, useRef } from "react";
import { FuriganaWrapText } from "../../../components/FuriganaWrapText";
import { HighlightedEnglish } from "../../../components/HighlightedEnglish";
import { useTrainerSpeech } from "../../../hooks/useTrainerSpeech";
import type { GameQuestion } from "../../../utils/gameMode/types";

type Props = {
  question: GameQuestion;
  revealed: boolean;
  selectedId: string | null;
  pulse?: "correct" | "wrong" | null;
  onSelect: (choiceId: string) => void;
};

function formatLabel(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Prefer English TTS for Latin-heavy labels; Japanese otherwise. */
function choiceLanguage(label: string): "ja" | "en" {
  const letters = label.replace(/[^A-Za-z\u3040-\u30ff\u4e00-\u9fff]/g, "");
  if (!letters) return "en";
  const latin = (letters.match(/[A-Za-z]/g) ?? []).length;
  return latin / letters.length >= 0.5 ? "en" : "ja";
}

export function GameQuestionCard({
  question,
  revealed,
  selectedId,
  pulse = null,
  onSelect,
}: Props) {
  const speech = useTrainerSpeech({ stopOnUnmount: true });
  const promptLines = question.promptJa.split("\n");
  const showPrompt = !question.listening || revealed;
  const autoKeyRef = useRef<string | null>(null);

  const jaSpeak = question.speakText?.trim() || question.promptJa.trim();
  const enSpeak = question.promptEn?.trim() ?? "";

  // Auto Voice: Japanese first (never mixed), then English prompt — same split as Play/Quiz.
  useEffect(() => {
    const key = question.id;
    let cancelled = false;
    speech.stop();

    if (!speech.autoVoice) {
      autoKeyRef.current = key;
      return () => {
        cancelled = true;
      };
    }

    const speakEn = () => {
      if (cancelled || !enSpeak) return;
      speech.speakEnglish(enSpeak, { karaoke: true });
    };

    const timer = window.setTimeout(() => {
      if (cancelled) return;
      if (question.listening && question.speakText) {
        // Listening: JA audio without revealing karaoke on a hidden transcript.
        speech.speakJapanese(question.speakText, {
          reading: question.speakReading,
          karaoke: revealed,
          onEnded: speakEn,
        });
      } else if (jaSpeak) {
        speech.speakJapanese(jaSpeak, {
          reading: question.reading ?? question.speakReading,
          karaoke: true,
          onEnded: speakEn,
        });
      } else {
        speakEn();
      }
    }, 200);

    autoKeyRef.current = key;
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      speech.stop();
    };
    // Re-run on new question / autoVoice / rate — not on reveal (avoids double EN).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id, speech.autoVoice, speech.rateMode]);

  function replayJapanese() {
    const text = question.speakText?.trim() || question.promptJa.trim();
    if (!text) return;
    speech.speakJapanese(text, {
      reading: question.speakReading ?? question.reading,
      karaoke: showPrompt,
    });
  }

  function replayEnglish() {
    if (!enSpeak) return;
    speech.speakEnglish(enSpeak, { karaoke: true });
  }

  function replayChoice(label: string) {
    const lang = choiceLanguage(label);
    if (lang === "en") {
      speech.speakEnglish(label, { karaoke: true });
    } else {
      speech.speakJapanese(label, { karaoke: true });
    }
  }

  const jaHighlight =
    speech.activeLang === "ja" ? speech.highlight : null;
  const enHighlight =
    speech.activeLang === "en" ? speech.highlight : null;

  return (
    <section
      className={
        pulse === "wrong"
          ? "gm-qcard gm-qcard--shake"
          : pulse === "correct"
            ? "gm-qcard gm-qcard--pulse"
            : "gm-qcard"
      }
    >
      <div className="gm-qcard-toolbar">
        <div className="gm-qcard-kicker">{categoryLabel(question.category)}</div>
        <div className="gm-speech-controls">
          <button
            type="button"
            className={
              speech.autoVoice
                ? "gm-btn gm-btn--ghost gm-btn--speech-on"
                : "gm-btn gm-btn--ghost"
            }
            aria-pressed={speech.autoVoice}
            onClick={() => speech.setAutoVoice(!speech.autoVoice)}
          >
            {speech.autoVoice ? "🔊 Auto Voice" : "🔇 Auto Voice"}
          </button>
          <button
            type="button"
            className={
              speech.rateMode === "normal"
                ? "gm-btn gm-btn--ghost gm-btn--speech-on"
                : "gm-btn gm-btn--ghost"
            }
            aria-pressed={speech.rateMode === "normal"}
            onClick={() => speech.setRateMode("normal")}
          >
            1.0×
          </button>
          <button
            type="button"
            className={
              speech.rateMode === "slow"
                ? "gm-btn gm-btn--ghost gm-btn--speech-on"
                : "gm-btn gm-btn--ghost"
            }
            aria-pressed={speech.rateMode === "slow"}
            onClick={() => speech.setRateMode("slow")}
          >
            0.75×
          </button>
        </div>
      </div>

      {question.enemyHp ? (
        <div
          className="gm-enemy-hp"
          aria-label={`${question.enemyHp.current} of ${question.enemyHp.max} enemy health`}
        >
          {Array.from({ length: question.enemyHp.max }, (_, index) => (
            <span key={index} aria-hidden="true">
              {index < question.enemyHp!.current ? "❤️" : "🖤"}
            </span>
          ))}
        </div>
      ) : null}

      {question.listening ? (
        <div className="gm-listen">
          <button
            type="button"
            className="gm-btn gm-btn--listen"
            aria-label="Play Japanese listening clip"
            onClick={replayJapanese}
          >
            🔊 Listen
          </button>
          {showPrompt ? (
            <div className="gm-line-row">
              <FuriganaWrapText
                surface={question.promptJa}
                reading={question.reading ?? ""}
                className="gm-qcard-ja"
                showFurigana={Boolean(question.reading)}
                highlight={jaHighlight}
              />
              <button
                type="button"
                className="gm-speak-btn"
                aria-label="Replay Japanese dialogue"
                onClick={replayJapanese}
              >
                🔊
              </button>
            </div>
          ) : (
            <p className="gm-listen-hint">Listen and choose the meaning.</p>
          )}
        </div>
      ) : (
        <div className="gm-line-row">
          <div className="gm-ja-stack">
            {promptLines.map((line) => (
              <FuriganaWrapText
                key={line}
                surface={line}
                reading={
                  promptLines.length === 1 ? question.reading ?? "" : ""
                }
                className="gm-qcard-ja"
                showFurigana={
                  promptLines.length === 1 && Boolean(question.reading)
                }
                highlight={jaHighlight}
              />
            ))}
          </div>
          <button
            type="button"
            className="gm-speak-btn"
            aria-label="Play Japanese prompt"
            onClick={replayJapanese}
          >
            🔊
          </button>
        </div>
      )}

      {enSpeak ? (
        <div className="gm-line-row gm-en-row">
          <HighlightedEnglish
            text={enSpeak}
            className="gm-qcard-en"
            highlight={enHighlight}
          />
          <button
            type="button"
            className="gm-speak-btn"
            aria-label="Play English prompt"
            onClick={replayEnglish}
          >
            🔊
          </button>
        </div>
      ) : null}

      <div className="gm-choices" role="list">
        {question.choices.map((choice, index) => {
          const isCorrect = choice.id === question.correctChoiceId;
          const isSelected = choice.id === selectedId;
          let className = "gm-choice";
          if (revealed) {
            if (isCorrect) className += " gm-choice--correct";
            else if (isSelected) className += " gm-choice--wrong";
            else className += " gm-choice--dim";
          }
          const label = formatLabel(choice.label);
          return (
            <div key={choice.id} className="gm-choice-row">
              <button
                type="button"
                className={className}
                disabled={revealed}
                onClick={() => onSelect(choice.id)}
              >
                <span className="gm-choice-index">{index + 1}</span>
                <span>
                  {label}
                  {choice.reading ? (
                    <span className="gm-choice-reading" lang="ja">
                      {choice.reading}
                    </span>
                  ) : null}
                </span>
              </button>
              <button
                type="button"
                className="gm-speak-btn gm-speak-btn--choice"
                aria-label={
                  choiceLanguage(label) === "en"
                    ? `Play English choice: ${label}`
                    : `Play Japanese choice: ${label}`
                }
                onClick={(event) => {
                  event.stopPropagation();
                  replayChoice(label);
                }}
              >
                🔊
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function categoryLabel(category: GameQuestion["category"]): string {
  switch (category) {
    case "n2":
      return "N2 vocabulary";
    case "weak":
      return "Weak word";
    case "expression":
      return "Expression";
    case "relation":
      return "Synonym / antonym";
    case "prerequisite":
      return "Prerequisite";
    case "listening":
      return "Listening";
  }
}
