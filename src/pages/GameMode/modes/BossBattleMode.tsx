import { useMemo, useRef, useState } from "react";
import { BossHealthBar } from "../components/BossHealthBar";
import { GameFeedbackBanner } from "../components/GameFeedbackBanner";
import { GameHeader } from "../components/GameHeader";
import { GameQuestionCard } from "../components/GameQuestionCard";
import { getUnlockedBosses, type GameBossConfig } from "../../../utils/gameMode/bosses";
import {
  defaultMixedWeights,
  loadGameContentPools,
  selectNextGameQuestion,
} from "../../../utils/gameMode/questions";
import { recordGameVocabAnswer } from "../../../utils/gameMode/recordAnswer";
import { GAME_SCORE } from "../../../utils/gameMode/scoring";
import { playGameSfx } from "../../../utils/gameMode/sfx";
import type {
  FinishedGame,
  GameFeedback,
  GameMistake,
  GameQuestion,
} from "../../../utils/gameMode/types";
import { comboBonusXp, xpFromEvents, type GameXpEvent } from "../../../utils/gameMode/xp";

const REVEAL_MS = 900;

type Props = {
  onQuit: () => void;
  onFinished: (result: FinishedGame) => void;
  boss?: GameBossConfig;
};

export function BossBattleMode({ onQuit, onFinished, boss }: Props) {
  const activeBoss = boss ?? getUnlockedBosses()[0];
  const pools = useMemo(() => loadGameContentPools(), []);
  const usedKeys = useRef(new Set<string>());
  const seedRef = useRef(`boss:${activeBoss?.id ?? "none"}:${Date.now()}`);
  const weights = useMemo(() => {
    const mixed = defaultMixedWeights(pools);
    const allowed = new Set(activeBoss?.categories ?? ["n2"]);
    const next = { ...mixed };
    (Object.keys(next) as (keyof typeof next)[]).forEach((key) => {
      if (!allowed.has(key)) next[key] = 0;
    });
    if (next.n2 > 0) next.n2 = 70;
    if (next.weak > 0) next.weak = 30;
    if (Object.values(next).every((weight) => weight === 0)) {
      return mixed;
    }
    return next;
  }, [activeBoss, pools]);

  const [question, setQuestion] = useState<GameQuestion | null>(() =>
    activeBoss
      ? takeQuestion(pools, usedKeys.current, seedRef.current, weights)
      : null
  );
  const [bossHp, setBossHp] = useState(activeBoss?.hp ?? 0);
  const [lives, setLives] = useState(activeBoss?.playerHearts ?? 5);
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

  function finish(
    victory: boolean,
    hpLeft: number,
    nextScore: number,
    nextCorrect: number,
    nextWrong: number,
    nextBest: number
  ) {
    if (victory) {
      xpEvents.current.push({ type: "boss-defeated" });
      playGameSfx("victory");
    } else {
      playGameSfx("gameover");
    }
    onFinished({
      mode: "boss",
      score: nextScore,
      correct: nextCorrect,
      wrong: nextWrong,
      attempted: nextCorrect + nextWrong,
      bestCombo: nextBest,
      mistakes: mistakes.current,
      xpGained: xpFromEvents(xpEvents.current),
      bossVictory: victory,
      bossHpLeft: hpLeft,
    });
  }

  function onSelect(choiceId: string) {
    if (!question || !activeBoss || revealed) return;
    const correct = choiceId === question.correctChoiceId;
    recordGameVocabAnswer(question, correct);
    const selectedLabel =
      question.choices.find((choice) => choice.id === choiceId)?.label ?? "";
    setSelectedId(choiceId);
    setRevealed(true);

    let nextHp = bossHp;
    let nextLives = lives;
    let nextCombo = combo;
    let nextScore = score;
    let nextCorrect = correctCount;
    let nextWrong = wrongCount;
    let nextBest = bestCombo;

    if (correct) {
      nextHp = Math.max(0, bossHp - activeBoss.damagePerHit);
      nextCombo = combo + 1;
      nextScore = score + GAME_SCORE.bossCorrect;
      nextCorrect = correctCount + 1;
      nextBest = Math.max(bestCombo, nextCombo);
      xpEvents.current.push({ type: "correct" });
      if (comboBonusXp(nextCombo) > 0) {
        xpEvents.current.push({ type: "combo", combo: nextCombo });
      }
      setPulse("correct");
      setFeedback({
        kind: "boss-hit",
        title: `💥 -${activeBoss.damagePerHit} HP`,
        combo: nextCombo,
      });
      playGameSfx("correct");
    } else {
      nextLives = lives - 1;
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
        kind: "boss-hurt",
        title: "💔 -1 HP",
        detail: `Correct answer: ${question.correctLabel}`,
      });
      playGameSfx("wrong");
    }

    setBossHp(nextHp);
    setLives(nextLives);
    setScore(nextScore);
    setCombo(nextCombo);
    setBestCombo(nextBest);
    setCorrectCount(nextCorrect);
    setWrongCount(nextWrong);

    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      if (nextHp <= 0) {
        finish(true, 0, nextScore, nextCorrect, nextWrong, nextBest);
        return;
      }
      if (nextLives <= 0) {
        finish(false, nextHp, nextScore, nextCorrect, nextWrong, nextBest);
        return;
      }
      const next = takeQuestion(
        pools,
        usedKeys.current,
        `${seedRef.current}:${questionNumber + 1}`,
        weights
      );
      if (!next) {
        finish(nextHp <= 0, nextHp, nextScore, nextCorrect, nextWrong, nextBest);
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

  if (!activeBoss) {
    return (
      <div className="gm-empty">
        <p>No bosses are unlocked yet.</p>
        <button type="button" className="gm-btn gm-btn--play" onClick={onQuit}>
          Game Mode
        </button>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="gm-empty">
        <p>Not enough vocabulary questions for this boss fight.</p>
        <button type="button" className="gm-btn gm-btn--play" onClick={onQuit}>
          Game Mode
        </button>
      </div>
    );
  }

  return (
    <div className="gm-play">
      <GameHeader
        title={`${activeBoss.emoji} ${activeBoss.nameEn}`}
        score={score}
        combo={combo}
        questionNumber={questionNumber}
        lives={lives}
        maxLives={activeBoss.playerHearts}
        onQuit={onQuit}
      />
      <BossHealthBar
        emoji={activeBoss.emoji}
        nameJa={activeBoss.nameJa}
        nameEn={activeBoss.nameEn}
        hp={bossHp}
        maxHp={activeBoss.hp}
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
