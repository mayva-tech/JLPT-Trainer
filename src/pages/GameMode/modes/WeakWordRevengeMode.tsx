import { useMemo, useRef, useState } from "react";
import { GameFeedbackBanner } from "../components/GameFeedbackBanner";
import { GameHeader } from "../components/GameHeader";
import { GameQuestionCard } from "../components/GameQuestionCard";
import { loadGameContentPools } from "../../../utils/gameMode/questions";
import {
  applyRevengeAnswer,
  createRevengeEnemies,
  nextRevengeQuestion,
  recordRevengeVocabAnswer,
  revengeSummary,
  rotateRevengeQueue,
} from "../../../utils/gameMode/revenge";
import { playGameSfx } from "../../../utils/gameMode/sfx";
import type {
  FinishedGame,
  GameFeedback,
  GameMistake,
  GameQuestion,
} from "../../../utils/gameMode/types";
import { comboBonusXp, xpFromEvents, type GameXpEvent } from "../../../utils/gameMode/xp";

const REVEAL_MS = 850;

type Props = {
  onQuit: () => void;
  onFinished: (result: FinishedGame) => void;
  onTrain: () => void;
};

export function WeakWordRevengeMode({ onQuit, onFinished, onTrain }: Props) {
  const pools = useMemo(() => loadGameContentPools(), []);
  const seedRef = useRef(`revenge:${Date.now()}`);
  const [enemies, setEnemies] = useState(() => createRevengeEnemies(pools.weakVocab, seedRef.current));
  const [question, setQuestion] = useState<GameQuestion | null>(() =>
    nextRevengeQuestion(
      createRevengeEnemies(pools.weakVocab, seedRef.current),
      pools,
      seedRef.current
    )
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [feedback, setFeedback] = useState<GameFeedback | null>(null);
  const [pulse, setPulse] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const mistakes = useRef<GameMistake[]>([]);
  const xpEvents = useRef<GameXpEvent[]>([]);
  const timerRef = useRef<number | null>(null);

  function finishWith(nextEnemies: typeof enemies, nextCorrect: number, nextWrong: number, nextScore: number, nextBest: number) {
    const summary = revengeSummary(nextEnemies);
    onFinished({
      mode: "revenge",
      score: nextScore,
      correct: nextCorrect,
      wrong: nextWrong,
      attempted: nextCorrect + nextWrong,
      bestCombo: nextBest,
      mistakes: mistakes.current,
      xpGained: xpFromEvents(xpEvents.current),
      revengeAttempted: summary.attempted,
      revengeDefeated: summary.defeated,
      revengeImproved: summary.improved,
      revengeStillWeak: summary.stillNeedingReview,
    });
  }

  function onSelect(choiceId: string) {
    if (!question || revealed || question.vocabItemId == null) return;
    const correct = choiceId === question.correctChoiceId;
    const selectedLabel =
      question.choices.find((choice) => choice.id === choiceId)?.label ?? "";
    recordRevengeVocabAnswer(question.vocabItemId, correct);
    const applied = applyRevengeAnswer(enemies, question.vocabItemId, correct);
    const rotated = rotateRevengeQueue(applied.enemies, question.vocabItemId);
    setEnemies(rotated);
    setSelectedId(choiceId);
    setRevealed(true);

    let nextCombo = combo;
    let nextScore = score;
    let nextCorrect = correctCount;
    let nextWrong = wrongCount;
    let nextBest = bestCombo;

    if (correct) {
      nextCombo = combo + 1;
      nextScore = score + 100;
      nextCorrect = correctCount + 1;
      nextBest = Math.max(bestCombo, nextCombo);
      xpEvents.current.push({ type: "correct" });
      if (comboBonusXp(nextCombo) > 0) {
        xpEvents.current.push({ type: "combo", combo: nextCombo });
      }
      if (applied.defeated) {
        xpEvents.current.push({ type: "weak-defeated" });
        setFeedback({ kind: "defeated", title: "💀 DEFEATED", combo: nextCombo });
        playGameSfx("defeated");
      } else {
        setFeedback({ kind: "hit", title: "💥 HIT!", combo: nextCombo });
        playGameSfx("hit");
      }
      setPulse("correct");
    } else {
      nextCombo = 0;
      nextWrong = wrongCount + 1;
      mistakes.current = [
        ...mistakes.current,
        {
          prompt: question.promptJa,
          reading: question.reading,
          correctAnswer: question.correctLabel,
          selectedAnswer: selectedLabel,
          category: question.category,
        },
      ];
      setPulse("wrong");
      setFeedback({
        kind: "wrong",
        title: "❌",
        detail: `Correct answer: ${question.correctLabel}`,
      });
      playGameSfx("wrong");
    }

    setScore(nextScore);
    setCombo(nextCombo);
    setBestCombo(nextBest);
    setCorrectCount(nextCorrect);
    setWrongCount(nextWrong);

    const maxQuestions = Math.max(8, enemies.length * (2 + 1));
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      const nextNumber = questionNumber + 1;
      const next =
        nextNumber > maxQuestions
          ? null
          : nextRevengeQuestion(rotated, pools, `${seedRef.current}:${nextNumber}`);
      if (!next) {
        finishWith(rotated, nextCorrect, nextWrong, nextScore, nextBest);
        return;
      }
      setQuestion(next);
      setQuestionNumber((current) => current + 1);
      setSelectedId(null);
      setRevealed(false);
      setFeedback(null);
      setPulse(null);
    }, REVEAL_MS);
  }

  if (pools.weakVocab.length === 0) {
    return (
      <div className="gm-empty">
        <p>No weak words waiting. Nice work.</p>
        <div className="gm-result-actions">
          <button type="button" className="gm-btn gm-btn--play" onClick={onQuit}>
            Game Mode
          </button>
          <button type="button" className="gm-btn gm-btn--ghost" onClick={onTrain}>
            Normal training
          </button>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="gm-empty">
        <p>Could not build Weak Word questions right now.</p>
        <button type="button" className="gm-btn gm-btn--play" onClick={onQuit}>
          Game Mode
        </button>
      </div>
    );
  }

  return (
    <div className="gm-play">
      <GameHeader
        title="🧠 Weak Word Revenge"
        score={score}
        combo={combo}
        questionNumber={questionNumber}
        onQuit={onQuit}
      />
      <GameFeedbackBanner feedback={feedback} />
      <GameQuestionCard
        question={question}
        revealed={revealed}
        selectedId={selectedId}
        pulse={pulse}
        onSelect={onSelect}
      />
    </div>
  );
}
