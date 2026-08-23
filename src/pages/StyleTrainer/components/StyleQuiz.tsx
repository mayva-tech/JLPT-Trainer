import { useMemo, useState } from "react";
import type { StyleExpression } from "../../../types/speechStyle";
import {
  buildStyleQuiz,
  scoreStyleQuiz,
  type StyleQuizAnswer,
  type StyleQuizQuestion,
} from "../../../utils/speechStyleQuiz";

interface StyleQuizProps {
  pool: readonly StyleExpression[];
  onSpeakJp: (text: string, reading?: string) => void;
}

type Phase = "setup" | "active" | "results";

const QUIZ_SIZE = 10;

const KIND_LABEL: Record<StyleQuizQuestion["kind"], string> = {
  "who-says": "Who would say this?",
  "more-natural": "Which is more natural?",
  rewrite: "Rewrite it",
};

export function StyleQuiz({
  pool,
  onSpeakJp,
}: StyleQuizProps) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [questions, setQuestions] = useState<StyleQuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<StyleQuizAnswer[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const question = questions[index] ?? null;

  const result = useMemo(
    () => scoreStyleQuiz(questions, answers),
    [questions, answers]
  );

  function startQuiz() {
    const built = buildStyleQuiz({
      pool,
      count: Math.min(QUIZ_SIZE, pool.length),
    });
    setQuestions(built);
    setIndex(0);
    setAnswers([]);
    setSelected(null);
    setRevealed(false);
    setPhase(built.length > 0 ? "active" : "setup");
  }

  function choose(optionId: string) {
    if (!question || revealed) return;
    const correct = optionId === question.correctOptionId;
    setSelected(optionId);
    setRevealed(true);
    setAnswers((prev) => [
      ...prev,
      { questionId: question.id, selectedOptionId: optionId, correct },
    ]);
  }

  function nextQuestion() {
    if (index + 1 >= questions.length) {
      setPhase("results");
      return;
    }
    setIndex((current) => current + 1);
    setSelected(null);
    setRevealed(false);
  }

  if (pool.length === 0) {
    return (
      <p className="ss-empty">
        Nothing left to quiz with the current filters. Turn the rough / anime
        toggles back on, or clear the search.
      </p>
    );
  }

  if (phase === "setup") {
    return (
      <div className="ss-quiz">
        <div className="ss-quiz-setup">
          <h2 className="ss-quiz-title">Quiz mode</h2>
          <p className="ss-quiz-note">
            {Math.min(QUIZ_SIZE, pool.length)} questions from the {pool.length}{" "}
            expressions matching your filters. Types rotate between “Who would
            say this?”, “Which is more natural?”, and “Rewrite it”. Neutral is
            often the right answer — that is intentional.
          </p>
          <button
            type="button"
            className="ss-btn ss-btn--primary"
            onClick={startQuiz}
          >
            Start {Math.min(QUIZ_SIZE, pool.length)}-question quiz
          </button>
        </div>
      </div>
    );
  }

  if (phase === "results") {
    return (
      <div className="ss-quiz">
        <div className="ss-result">
          <p className="ss-result-score">
            {result.correct}/{result.total}
          </p>
          <p className="ss-result-pct">{result.percentage}%</p>

          {result.missed.length > 0 ? (
            <section className="ss-review">
              <h4>Review missed questions</h4>
              <ul>
                {result.missed.map((item) => (
                  <li key={item.id}>
                    <p className="ss-review-q">{item.prompt}</p>
                    {item.focus ? (
                      <p className="ss-review-focus" lang="ja">
                        {item.focus}
                      </p>
                    ) : null}
                    <p className="ss-review-a">{item.explanation}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <p className="ss-review-perfect">Perfect — every answer correct.</p>
          )}

          <div className="ss-controls">
            <button
              type="button"
              className="ss-btn ss-btn--primary"
              onClick={startQuiz}
            >
              Try again
            </button>
            <button
              type="button"
              className="ss-btn"
              onClick={() => setPhase("setup")}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="ss-quiz">
      <div className="ss-quiz-head">
        <span className="ss-quiz-progress">
          {index + 1} / {questions.length}
        </span>
        <span className="ss-quiz-kind">{KIND_LABEL[question.kind]}</span>
      </div>

      <p className="ss-quiz-prompt">{question.prompt}</p>
      <p
        className="ss-quiz-focus"
        lang={question.focusReading ? "ja" : undefined}
      >
        {question.focus}
        {question.focusReading ? (
          <button
            type="button"
            className="ss-speak"
            aria-label="Speak focus"
            onClick={() => onSpeakJp(question.focus, question.focusReading)}
          >
            🔊
          </button>
        ) : null}
      </p>
      {question.focusReading ? (
        <p className="ss-quiz-focus-reading" lang="ja">
          {question.focusReading}
        </p>
      ) : null}

      <ul className="ss-options">
        {question.options.map((option) => {
          let state: "correct" | "wrong" | undefined;
          if (revealed) {
            if (option.id === question.correctOptionId) state = "correct";
            else if (option.id === selected) state = "wrong";
          }
          return (
            <li key={option.id}>
              <button
                type="button"
                className="ss-option"
                data-state={state}
                disabled={revealed}
                onClick={() => choose(option.id)}
              >
                <span className="ss-option-label" lang="ja">
                  {option.label}
                </span>
                {option.sublabel ? (
                  <span className="ss-option-sub" lang="ja">
                    {option.sublabel}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      {revealed ? (
        <div className="ss-feedback">
          <p
            className={
              selected === question.correctOptionId
                ? "ss-verdict ss-verdict--ok"
                : "ss-verdict ss-verdict--no"
            }
          >
            {selected === question.correctOptionId ? "Correct" : "Not quite"}
          </p>
          <p className="ss-explanation">
            {question.explanation}
          </p>
          <div className="ss-controls">
            <button
              type="button"
              className="ss-btn ss-btn--primary"
              onClick={nextQuestion}
            >
              {index + 1 >= questions.length ? "See results" : "Next"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
