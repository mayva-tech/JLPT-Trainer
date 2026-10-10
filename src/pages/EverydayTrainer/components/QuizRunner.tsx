import { useEffect, useRef, useState } from "react";
import { Furigana } from "../../../lib/japanese/furigana";
import { playAnswerSound } from "../../../services/answerSfx";
import { EverydayPicture } from "../EverydayPicture";
import { plainJapanese, wordRomaji } from "../everydayData";
import type { ReviewMode } from "../everydayProgress";
import type { QuizQuestion } from "../everydayQuiz";
import type { EverydayProgressApi } from "../useEverydayProgress";
import type { EverydaySpeech } from "../useEverydaySpeech";
import type { EverydayWord } from "../types";
import { IconSpeaker } from "./icons";

const PROMPTS: Record<QuizQuestion["kind"], string> = {
  picture: "What is this called in Japanese?",
  listen: "Listen — which one is it?",
  meaning: "Which is the Japanese word?",
};

/** One round of picture / listening / meaning questions, then a summary. */
export function QuizRunner({
  questions,
  mode,
  categoryId,
  progressApi,
  speech,
  onRestart,
  onExit,
}: {
  questions: readonly QuizQuestion[];
  mode: ReviewMode;
  categoryId: string | null;
  progressApi: EverydayProgressApi;
  speech: EverydaySpeech;
  onRestart: () => void;
  onExit: () => void;
}) {
  const { recordAnswer, recordSession } = progressApi;
  const [qi, setQi] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<EverydayWord[]>([]);
  const saved = useRef(false);
  const done = qi >= questions.length;
  const q = questions[qi];

  // Listen & Identify starts by speaking the word.
  const { say } = speech;
  useEffect(() => {
    if (q?.kind === "listen") say(q.target, "ja");
  }, [q, say]);

  useEffect(() => {
    if (!done || saved.current || questions.length === 0) return;
    saved.current = true;
    recordSession({ mode, categoryId, total: questions.length, correct: score });
  }, [done, questions.length, mode, categoryId, score, recordSession]);

  if (questions.length === 0) {
    return (
      <div className="ev-empty">
        <p>Not enough words for this yet. Explore a few cards first.</p>
        <button type="button" className="ev-btn" onClick={onExit}>
          Back
        </button>
      </div>
    );
  }

  if (done || !q) {
    return (
      <div className="ev-result">
        <p className="ev-result-score">
          {score} / {questions.length}
        </p>
        <p className="ev-result-label">{score === questions.length ? "Perfect! 完璧！" : "Nice work — keep going!"}</p>
        {missed.length > 0 ? (
          <>
            <h3 className="ev-h3">To review</h3>
            <ul className="ev-missed">
              {missed.map((w) => (
                <li key={w.id}>
                  <button type="button" onClick={() => speech.say(w, "ja")}>
                    <span className="ev-missed-pic">
                      <EverydayPicture word={w} decorative />
                    </span>
                    <span lang="ja" className="ev-missed-jp">
                      <Furigana text={w.japanese} />
                    </span>
                    <span className="ev-missed-en">{w.english}</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : null}
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

  const answered = chosen !== null;

  const choose = (i: number) => {
    if (answered) return;
    const correct = i === q.answerIndex;
    setChosen(i);
    playAnswerSound(correct);
    recordAnswer(q.target.id, correct);
    if (correct) setScore((s) => s + 1);
    else setMissed((m) => [...m, q.target]);
    // Let the answer chime finish, then say the right word.
    const session = speech.newSession();
    speech.wait(450, session, () => speech.playSequence(q.target, "jp", undefined, session));
  };

  const next = () => {
    speech.stop();
    setChosen(null);
    setQi((i) => i + 1);
  };

  const optionState = (i: number) => {
    if (!answered) return "";
    if (i === q.answerIndex) return " ev-opt--right";
    if (i === chosen) return " ev-opt--wrong";
    return " ev-opt--dim";
  };

  return (
    <div className="ev-quiz">
      <div className="ev-deck-bar">
        <span className="ev-counter">
          {qi + 1} / {questions.length}
        </span>
        <span className="ev-progress-text">Score {score}</span>
      </div>
      <div className="ev-bar" aria-hidden="true">
        <span style={{ width: `${(qi / questions.length) * 100}%` }} />
      </div>

      <p className="ev-prompt">{PROMPTS[q.kind]}</p>

      {q.kind === "picture" ? (
        <div className="ev-quiz-picture">
          <EverydayPicture word={q.target} />
        </div>
      ) : null}
      {q.kind === "meaning" ? <p className="ev-quiz-meaning">{q.target.english}</p> : null}
      {q.kind === "listen" ? (
        <button type="button" className="ev-btn ev-btn--primary ev-listen" onClick={() => speech.say(q.target, "ja")}>
          <IconSpeaker size={20} /> Play again
        </button>
      ) : null}

      {q.kind === "listen" ? (
        <div className="ev-opts ev-opts--pictures">
          {q.options.map((w, i) => (
            <button key={w.id} type="button" className={`ev-opt ev-opt--pic${optionState(i)}`} onClick={() => choose(i)}>
              <EverydayPicture word={w} />
              {answered ? (
                <span className="ev-opt-label" lang="ja">
                  {plainJapanese(w)}
                </span>
              ) : (
                <span className="ev-sr">Option {i + 1}</span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="ev-opts">
          {q.options.map((w, i) => (
            <button key={w.id} type="button" className={`ev-opt${optionState(i)}`} onClick={() => choose(i)} lang="ja">
              <span className="ev-opt-jp">
                <Furigana text={w.japanese} />
              </span>
              {answered && (i === q.answerIndex || i === chosen) ? (
                <span className="ev-opt-sub" lang="en">
                  {wordRomaji(w)} · {w.english}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      )}

      {answered ? (
        <div className="ev-feedback">
          <p>
            <strong lang="ja">
              <Furigana text={q.target.japanese} />
            </strong>{" "}
            — {wordRomaji(q.target)} · {q.target.english}
          </p>
          {q.target.nuance ? <p className="ev-nuance">{q.target.nuance}</p> : null}
          <button type="button" className="ev-btn ev-btn--primary" onClick={next} autoFocus>
            {qi + 1 === questions.length ? "See results" : "Next"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
