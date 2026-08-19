import { useMemo, useState } from "react";
import { WORD_RELATION_TYPE_LABELS } from "../../../data/wordRelations";
import type { WordRelation } from "../../../types/wordRelation";
import type { LevelFilter, TypeFilter } from "../../../utils/wordRelations";
import {
  buildRelationQuiz,
  scoreRelationQuiz,
  type RelationQuizAnswer,
  type RelationQuizQuestion,
} from "../../../utils/wordRelationQuiz";

interface Props {
  relations: readonly WordRelation[];
  level: LevelFilter;
  type: TypeFilter;
  onSpeak: (text: string) => void;
}

type Phase = "setup" | "active" | "results";

const QUIZ_SIZE = 10;

const KIND_LABEL: Record<RelationQuizQuestion["kind"], string> = {
  "choose-synonym": "類義語を選ぶ",
  "choose-antonym": "反対語を選ぶ",
  "relation-type": "関係を選ぶ",
  "meaning-match": "意味を選ぶ",
};

function filterLabel(level: LevelFilter, type: TypeFilter): string {
  const levelText = level === "all" ? "All levels" : level;
  const typeText =
    type === "all"
      ? "All types"
      : `${WORD_RELATION_TYPE_LABELS[type].japanese} / ${WORD_RELATION_TYPE_LABELS[type].english}`;
  return `${levelText} · ${typeText}`;
}

export function RelationQuiz({ relations, level, type, onSpeak }: Props) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [questions, setQuestions] = useState<RelationQuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<RelationQuizAnswer[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const question = questions[index] ?? null;

  const result = useMemo(
    () => scoreRelationQuiz(questions, answers),
    [questions, answers]
  );

  function startQuiz() {
    const built = buildRelationQuiz({
      pool: relations,
      count: Math.min(QUIZ_SIZE, relations.length),
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

  if (relations.length === 0) {
    return (
      <p className="rt-empty">
        No relations available for a quiz with the current filters.
      </p>
    );
  }

  if (phase === "setup") {
    return (
      <div className="rt-quiz">
        <div className="rt-quiz-setup">
          <h2 className="rt-quiz-title">Quiz mode</h2>
          <p className="rt-quiz-note">
            Answer {Math.min(QUIZ_SIZE, relations.length)} questions drawn from{" "}
            {relations.length} relations ({filterLabel(level, type)}). Question
            types rotate between synonym choice, antonym choice, relationship
            recognition, and meaning match.
          </p>
          <button type="button" className="rt-btn rt-btn--primary" onClick={startQuiz}>
            Start {Math.min(QUIZ_SIZE, relations.length)}-question quiz
          </button>
        </div>
      </div>
    );
  }

  if (phase === "results") {
    return (
      <div className="rt-quiz">
        <div className="rt-result">
          <p className="rt-result-score">
            {result.correct}/{result.total}
          </p>
          <p className="rt-result-pct">{result.percentage}%</p>
          <dl className="rt-result-grid">
            <div>
              <dt>Correct</dt>
              <dd>{result.correct}</dd>
            </div>
            <div>
              <dt>Incorrect</dt>
              <dd>{result.incorrect}</dd>
            </div>
            <div>
              <dt>Level</dt>
              <dd>{level === "all" ? "All" : level}</dd>
            </div>
            <div>
              <dt>Mode</dt>
              <dd>{type === "all" ? "Mixed" : WORD_RELATION_TYPE_LABELS[type].japanese}</dd>
            </div>
          </dl>

          {result.missed.length > 0 ? (
            <section className="rt-review">
              <h4>Review missed questions</h4>
              <ul>
                {result.missed.map((item) => (
                  <li key={item.id}>
                    <p className="rt-review-q">{item.prompt}</p>
                    <p className="rt-review-a">{item.explanation}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <p className="rt-review-perfect">Perfect score — well done!</p>
          )}

          <button
            type="button"
            className="rt-btn rt-btn--primary"
            style={{ marginTop: 16 }}
            onClick={() => setPhase("setup")}
          >
            Back to setup
          </button>
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="rt-quiz">
      <div className="rt-quiz-head">
        <span className="rt-quiz-progress">
          Question {index + 1} / {questions.length}
        </span>
        <span className="rt-quiz-kind">{KIND_LABEL[question.kind]}</span>
        <span className="rt-level" data-level={question.jlptLevel}>
          {question.jlptLevel}
        </span>
      </div>

      <p className="rt-quiz-prompt" lang="ja">
        {question.prompt}
      </p>
      <p className="rt-quiz-prompt-en">{question.promptEn}</p>
      {question.promptDetail ? (
        <p className="rt-quiz-detail" lang="ja">
          {question.promptDetail}
        </p>
      ) : null}

      <ul className="rt-options">
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
                className="rt-option"
                data-state={state}
                disabled={revealed}
                onClick={() => choose(option.id)}
              >
                <span className="rt-option-label" lang="ja">
                  {option.label}
                </span>
                {option.reading ? (
                  <span className="rt-option-reading" lang="ja">
                    {option.reading}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      {revealed ? (
        <div className="rt-feedback">
          <p
            className={
              selected === question.correctOptionId
                ? "rt-verdict rt-verdict--ok"
                : "rt-verdict rt-verdict--no"
            }
          >
            {selected === question.correctOptionId ? "Correct!" : "Not quite."}
          </p>
          <p className="rt-explanation">{question.explanation}</p>
          <div className="rt-study-controls">
            <button
              type="button"
              className="rt-btn rt-btn--primary"
              onClick={nextQuestion}
            >
              {index + 1 >= questions.length ? "See results" : "Next question"}
            </button>
            <button
              type="button"
              className="rt-btn"
              onClick={() => onSpeak(question.prompt)}
            >
              Hear prompt
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
