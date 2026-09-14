import { useCallback, useMemo, useRef, useState } from "react";
import { GameFeedbackBanner } from "../components/GameFeedbackBanner";
import { GameHeader } from "../components/GameHeader";
import { GameQuestionCard } from "../components/GameQuestionCard";
import {
  loadGameContentPools,
  selectNextGameQuestion,
  survivalRoundWeights,
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
import { getVocabQuizItemStats, isWeakVocabItem, loadVocabQuizStats } from "../../../utils/vocabQuizStats";

const QUESTIONS_PER_ROUND = 8;
const REVEAL_MS = 950;

type Props = {
  onQuit: () => void;
  onFinished: (result: FinishedGame) => void;
};

export function SurvivalMode({ onQuit, onFinished }: Props) {
  const pools = useMemo(() => loadGameContentPools(), []);
  const usedKeys = useRef(new Set<string>());
  const seedRef = useRef(`survival:${Date.now()}`);
  const timerRef = useRef<number | null>(null);
  const [question, setQuestion] = useState<GameQuestion | null>(() =>
    nextQuestion(pools, usedKeys.current, seedRef.current, 1)
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [feedback, setFeedback] = useState<GameFeedback | null>(null);
  const [pulse, setPulse] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [round, setRound] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const mistakes = useRef<GameMistake[]>([]);
  const xpEvents = useRef<GameXpEvent[]>([]);
  const weakDiscovered = useRef<Set<string>>(new Set());

  const difficulty = difficultyLabel(round);

  const finish = useCallback(
    (finalScore: number, finalCorrect: number, finalWrong: number, finalCombo: number) => {
      const attempted = finalCorrect + finalWrong;
      onFinished({
        mode: "survival",
        score: finalScore,
        correct: finalCorrect,
        wrong: finalWrong,
        attempted,
        bestCombo: finalCombo,
        mistakes: mistakes.current,
        xpGained: xpFromEvents(xpEvents.current),
        survived: attempted,
        weakDiscovered: [...weakDiscovered.current],
      });
    },
    [onFinished]
  );

  function advance(
    nextLives: number,
    nextScore: number,
    nextCorrect: number,
    nextWrong: number,
    nextBestCombo: number,
    nextQuestionNumber: number,
    nextRound: number
  ) {
    if (nextLives <= 0) {
      playGameSfx("gameover");
      finish(nextScore, nextCorrect, nextWrong, nextBestCombo);
      return;
    }
    const next = nextQuestion(
      pools,
      usedKeys.current,
      `${seedRef.current}:${nextQuestionNumber}`,
      nextRound
    );
    if (!next) {
      finish(nextScore, nextCorrect, nextWrong, nextBestCombo);
      return;
    }
    setQuestion(next);
    setSelectedId(null);
    setRevealed(false);
    setFeedback(null);
    setPulse(null);
  }

  function onSelect(choiceId: string) {
    if (!question || revealed) return;
    const correct = choiceId === question.correctChoiceId;
    recordGameVocabAnswer(question, correct);
    setSelectedId(choiceId);
    setRevealed(true);

    const selectedLabel =
      question.choices.find((choice) => choice.id === choiceId)?.label ?? "";

    let nextLives = lives;
    let nextCombo = combo;
    let nextScore = score;
    let nextCorrect = correctCount;
    let nextWrong = wrongCount;
    let nextBest = bestCombo;

    if (correct) {
      nextCombo = combo + 1;
      nextScore = score + GAME_SCORE.survivalCorrect;
      nextCorrect = correctCount + 1;
      nextBest = Math.max(bestCombo, nextCombo);
      xpEvents.current.push({ type: "correct" });
      if (comboBonusXp(nextCombo) > 0) {
        xpEvents.current.push({ type: "combo", combo: nextCombo });
      }
      setPulse("correct");
      setFeedback({
        kind: "correct",
        title: `✅ +${GAME_SCORE.survivalCorrect}`,
        combo: nextCombo,
      });
      playGameSfx(nextCombo > 1 && nextCombo % 5 === 0 ? "combo" : "correct");
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
      if (question.vocabItemId != null && question.promptJa) {
        const stats = getVocabQuizItemStats(question.vocabItemId, loadVocabQuizStats());
        if (stats && isWeakVocabItem(stats)) {
          weakDiscovered.current.add(question.promptJa.split("\n")[0] ?? question.promptJa);
        }
      }
      setPulse("wrong");
      setFeedback({
        kind: "wrong",
        title: "❌",
        detail: `Correct answer: ${question.correctLabel}`,
      });
      playGameSfx("wrong");
    }

    setScore(nextScore);
    setLives(nextLives);
    setCombo(nextCombo);
    setBestCombo(nextBest);
    setCorrectCount(nextCorrect);
    setWrongCount(nextWrong);

    const nextQuestionNumber = questionNumber + 1;
    const nextRound = Math.floor((nextQuestionNumber - 1) / QUESTIONS_PER_ROUND) + 1;
    setQuestionNumber(nextQuestionNumber);
    setRound(nextRound);

    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      advance(nextLives, nextScore, nextCorrect, nextWrong, nextBest, nextQuestionNumber, nextRound);
    }, REVEAL_MS);
  }

  if (!question) {
    return (
      <div className="gm-empty">
        <p>Not enough questions are available for Survival Mode.</p>
        <button type="button" className="gm-btn gm-btn--play" onClick={onQuit}>
          Back to Game Mode
        </button>
      </div>
    );
  }

  return (
    <div className="gm-play">
      <GameHeader
        title="❤️ Survival Mode"
        score={score}
        combo={combo}
        questionNumber={questionNumber}
        round={round}
        difficulty={difficulty}
        lives={lives}
        maxLives={3}
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

function nextQuestion(
  pools: ReturnType<typeof loadGameContentPools>,
  usedKeys: Set<string>,
  seed: string,
  round: number
) {
  const question = selectNextGameQuestion({
    pools,
    weights: survivalRoundWeights(round, pools),
    usedKeys,
    seed,
  });
  if (question) usedKeys.add(question.sourceKey);
  return question;
}

function difficultyLabel(round: number): string {
  if (round <= 1) return "Warm-up";
  if (round === 2) return "N2 vocabulary";
  if (round === 3) return "Expressions";
  if (round === 4) return "Synonyms";
  if (round === 5) return "Listening";
  return `Expert mix · R${round}`;
}
