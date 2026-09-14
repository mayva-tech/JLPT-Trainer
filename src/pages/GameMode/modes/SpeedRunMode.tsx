import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GameFeedbackBanner } from "../components/GameFeedbackBanner";
import { GameHeader } from "../components/GameHeader";
import { GameQuestionCard } from "../components/GameQuestionCard";
import {
  defaultMixedWeights,
  loadGameContentPools,
  selectNextGameQuestion,
} from "../../../utils/gameMode/questions";
import { GAME_SCORE } from "../../../utils/gameMode/scoring";
import { playGameSfx } from "../../../utils/gameMode/sfx";
import type {
  FinishedGame,
  GameFeedback,
  GameMistake,
  GameQuestion,
} from "../../../utils/gameMode/types";
import { comboBonusXp, xpFromEvents, type GameXpEvent } from "../../../utils/gameMode/xp";

const DURATION_SEC = 60;
const FLASH_MS = 140;

type Props = {
  onQuit: () => void;
  onFinished: (result: FinishedGame) => void;
};

export function SpeedRunMode({ onQuit, onFinished }: Props) {
  const pools = useMemo(() => loadGameContentPools(), []);
  const usedKeys = useRef(new Set<string>());
  const seedRef = useRef(`speed:${Date.now()}`);
  const endedRef = useRef(false);
  const flashRef = useRef<number | null>(null);
  const xpEvents = useRef<GameXpEvent[]>([]);
  const mistakes = useRef<GameMistake[]>([]);
  const tally = useRef({
    score: 0,
    combo: 0,
    bestCombo: 0,
    correct: 0,
    wrong: 0,
  });

  const weights = useMemo(() => {
    const mixed = defaultMixedWeights(pools);
    return {
      ...mixed,
      n2: mixed.n2 > 0 ? 55 : 0,
      expression: mixed.expression > 0 ? 35 : 0,
      weak: 0,
      listening: 0,
      prerequisite: mixed.n2 > 0 ? 0 : mixed.prerequisite,
      relation: mixed.expression > 0 ? 10 : mixed.relation,
    };
  }, [pools]);

  const [question, setQuestion] = useState<GameQuestion | null>(() =>
    takeQuestion(pools, usedKeys.current, seedRef.current, weights)
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [feedback, setFeedback] = useState<GameFeedback | null>(null);
  const [pulse, setPulse] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(DURATION_SEC);

  const finish = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    if (tally.current.correct + tally.current.wrong > 0) {
      xpEvents.current.push({ type: "speed-complete" });
    }
    onFinished({
      mode: "speed",
      score: tally.current.score,
      correct: tally.current.correct,
      wrong: tally.current.wrong,
      attempted: tally.current.correct + tally.current.wrong,
      bestCombo: tally.current.bestCombo,
      mistakes: mistakes.current,
      xpGained: xpFromEvents(xpEvents.current),
    });
  }, [onFinished]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(id);
          finish();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [finish]);

  function goNext() {
    if (endedRef.current) return;
    const next = takeQuestion(
      pools,
      usedKeys.current,
      `${seedRef.current}:${tally.current.correct + tally.current.wrong}`,
      weights
    );
    if (!next) {
      finish();
      return;
    }
    setQuestion(next);
    setSelectedId(null);
    setRevealed(false);
    setFeedback(null);
    setPulse(null);
    setQuestionNumber(tally.current.correct + tally.current.wrong + 1);
  }

  function onSelect(choiceId: string) {
    if (!question || revealed || endedRef.current) return;
    const correct = choiceId === question.correctChoiceId;
    const selectedLabel =
      question.choices.find((choice) => choice.id === choiceId)?.label ?? "";
    setSelectedId(choiceId);
    setRevealed(true);

    if (correct) {
      tally.current.combo += 1;
      tally.current.score += GAME_SCORE.speedCorrect;
      tally.current.correct += 1;
      tally.current.bestCombo = Math.max(tally.current.bestCombo, tally.current.combo);
      xpEvents.current.push({ type: "correct" });
      if (comboBonusXp(tally.current.combo) > 0) {
        xpEvents.current.push({ type: "combo", combo: tally.current.combo });
      }
      setPulse("correct");
      setFeedback({ kind: "correct", title: "✅", combo: tally.current.combo });
      playGameSfx("correct");
    } else {
      tally.current.combo = 0;
      tally.current.wrong += 1;
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
      setFeedback({ kind: "wrong", title: "❌" });
      playGameSfx("wrong");
    }

    setScore(tally.current.score);
    setCombo(tally.current.combo);

    if (flashRef.current) window.clearTimeout(flashRef.current);
    flashRef.current = window.setTimeout(goNext, FLASH_MS);
  }

  if (!question) {
    return (
      <div className="gm-empty">
        <p>Not enough questions are available for a Speed Run.</p>
        <button type="button" className="gm-btn gm-btn--play" onClick={onQuit}>
          Back to Game Mode
        </button>
      </div>
    );
  }

  return (
    <div className="gm-play">
      <GameHeader
        title="⚡ Speed Run"
        score={score}
        combo={combo}
        questionNumber={questionNumber}
        secondsLeft={secondsLeft}
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

function takeQuestion(
  pools: ReturnType<typeof loadGameContentPools>,
  usedKeys: Set<string>,
  seed: string,
  weights: ReturnType<typeof defaultMixedWeights>
) {
  const question = selectNextGameQuestion({ pools, weights, usedKeys, seed });
  if (question) usedKeys.add(question.sourceKey);
  return question;
}
