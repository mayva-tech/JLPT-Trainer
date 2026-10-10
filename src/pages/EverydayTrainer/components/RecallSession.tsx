import { useEffect, useRef, useState } from "react";
import { Furigana } from "../../../lib/japanese/furigana";
import { EverydayPicture } from "../EverydayPicture";
import { wordRomaji } from "../everydayData";
import type { EverydayProgressApi } from "../useEverydayProgress";
import type { EverydaySpeech } from "../useEverydaySpeech";
import type { EverydayWord } from "../types";

/**
 * Recall mode: only the picture. Say the word to yourself, reveal, then be
 * honest — "Got it" or "Not yet" feeds the same weak-word stats as the quizzes.
 */
export function RecallSession({
  words,
  categoryId,
  progressApi,
  speech,
  onRestart,
  onExit,
}: {
  words: readonly EverydayWord[];
  categoryId: string | null;
  progressApi: EverydayProgressApi;
  speech: EverydaySpeech;
  onRestart: () => void;
  onExit: () => void;
}) {
  const { recordAnswer, recordSession } = progressApi;
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [gotIt, setGotIt] = useState(0);
  const saved = useRef(false);
  const done = i >= words.length;

  useEffect(() => {
    if (!done || saved.current || words.length === 0) return;
    saved.current = true;
    recordSession({ mode: "recall", categoryId, total: words.length, correct: gotIt });
  }, [done, words.length, categoryId, gotIt, recordSession]);

  if (words.length === 0) {
    return (
      <div className="ev-empty">
        <p>No picture cards here yet.</p>
        <button type="button" className="ev-btn" onClick={onExit}>
          Back
        </button>
      </div>
    );
  }

  const word = words[i];
  if (done || !word) {
    return (
      <div className="ev-result">
        <p className="ev-result-score">
          {gotIt} / {words.length}
        </p>
        <p className="ev-result-label">recalled from the picture alone</p>
        <div className="ev-row">
          <button type="button" className="ev-btn ev-btn--primary" onClick={onRestart}>
            Again
          </button>
          <button type="button" className="ev-btn" onClick={onExit}>
            Back
          </button>
        </div>
      </div>
    );
  }

  const answer = (knew: boolean) => {
    recordAnswer(word.id, knew);
    if (knew) setGotIt((n) => n + 1);
    speech.stop();
    setRevealed(false);
    setI((n) => n + 1);
  };

  return (
    <div className="ev-quiz">
      <div className="ev-deck-bar">
        <span className="ev-counter">
          {i + 1} / {words.length}
        </span>
        <span className="ev-progress-text">Recalled {gotIt}</span>
      </div>
      <div className="ev-bar" aria-hidden="true">
        <span style={{ width: `${(i / words.length) * 100}%` }} />
      </div>
      <p className="ev-prompt">Say it in Japanese, then check.</p>
      <div className="ev-quiz-picture">
        <EverydayPicture word={word} avoidHead />
      </div>

      {revealed ? (
        <div className="ev-feedback">
          <button type="button" className="ev-jp ev-jp--center" lang="ja" onClick={() => speech.say(word, "ja")}>
            <Furigana text={word.japanese} />
          </button>
          <p className="ev-romaji">{wordRomaji(word)}</p>
          <p className="ev-recall-en">{word.english}</p>
          <div className="ev-row">
            <button type="button" className="ev-btn ev-btn--good" onClick={() => answer(true)}>
              Got it
            </button>
            <button type="button" className="ev-btn ev-btn--bad" onClick={() => answer(false)}>
              Not yet
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="ev-btn ev-btn--primary ev-btn--wide"
          onClick={() => {
            setRevealed(true);
            speech.say(word, "ja");
          }}
          autoFocus
        >
          Show answer
        </button>
      )}
    </div>
  );
}
