import { useCallback, useEffect, useRef, useState } from "react";
import {
  ComboDisplay,
  CountdownTimer,
  GameHeader,
  GameQuestionCard,
  GameResultScreen,
  ScoreDisplay,
} from "../../game/components";
import {
  applyGameSessionResult,
  createSelectorState,
  loadGameModeStats,
  selectNextQuestion,
  XP_REWARDS,
  xpForCorrectAnswer,
  type GameMistake,
  type GameQuestion,
} from "../../utils/gameMode";
import {
  accuracyPercent,
  mistakeFromAnswer,
  recordGameVocabAnswer,
} from "../../utils/gameMode/sessionHelpers";

type Props = {
  onBack: () => void;
};

type Phase = "playing" | "over" | "review";

const DURATION = 60;

export function SpeedRunMode({ onBack }: Props) {
  const [seconds, setSeconds] = useState(DURATION);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [xpGained, setXpGained] = useState(0);
  const [question, setQuestion] = useState<GameQuestion | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [phase, setPhase] = useState<Phase>("playing");
  const [mistakes, setMistakes] = useState<GameMistake[]>([]);
  const [prevBest, setPrevBest] = useState(0);
  const [isPb, setIsPb] = useState(false);
  const [comboPop, setComboPop] = useState(false);
  const selectorRef = useRef(createSelectorState());
  const endedRef = useRef(false);
  const statsRef = useRef({
    correct: 0,
    wrong: 0,
    combo: 0,
    bestCombo: 0,
    xp: 0,
  });

  const nextQuestion = useCallback((num: number) => {
    const q = selectNextQuestion(selectorRef.current, {
      seedPrefix: `speed:${Date.now()}`,
      weights: {
        n2: 0.45,
        weak: 0.15,
        expression: 0.2,
        "synonym-antonym": 0.15,
        prerequisite: 0.05,
      },
    });
    setQuestion(q);
    setSelected(null);
    setFeedback(null);
    setQuestionNumber(num);
  }, []);

  const endRun = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    const s = statsRef.current;
    const score = s.correct;
    const xp = s.xp + XP_REWARDS.speedRunCompleted;
    setXpGained(xp);
    const stats = applyGameSessionResult({
      xpGained: xp,
      speedRunScore: score,
      bestCombo: s.bestCombo,
    });
    setIsPb(score > prevBest && score > 0);
    setPrevBest(stats.speedRunBest);
    setPhase("over");
  }, [prevBest]);

  const startRun = useCallback(() => {
    endedRef.current = false;
    selectorRef.current = createSelectorState();
    const stats = loadGameModeStats();
    setPrevBest(stats.speedRunBest);
    setSeconds(DURATION);
    setCorrectCount(0);
    setWrongCount(0);
    setCombo(0);
    setBestCombo(0);
    setXpGained(0);
    setMistakes([]);
    setIsPb(false);
    setPhase("playing");
    statsRef.current = { correct: 0, wrong: 0, combo: 0, bestCombo: 0, xp: 0 };
    nextQuestion(1);
  }, [nextQuestion]);

  useEffect(() => {
    startRun();
  }, [startRun]);

  useEffect(() => {
    if (phase !== "playing") return;
    if (seconds <= 0) {
      endRun();
      return;
    }
    const id = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [seconds, phase, endRun]);

  function onSelect(index: number) {
    if (!question || phase !== "playing" || endedRef.current) return;
    const correct = index === question.correctIndex;
    setSelected(index);
    recordGameVocabAnswer(question, correct);

    if (correct) {
      setFeedback("correct");
      const nextCombo = statsRef.current.combo + 1;
      const gained = xpForCorrectAnswer(nextCombo);
      statsRef.current.correct += 1;
      statsRef.current.combo = nextCombo;
      statsRef.current.bestCombo = Math.max(
        statsRef.current.bestCombo,
        nextCombo
      );
      statsRef.current.xp += gained;
      setCorrectCount(statsRef.current.correct);
      setCombo(nextCombo);
      setBestCombo(statsRef.current.bestCombo);
      setComboPop(true);
      window.setTimeout(() => setComboPop(false), 300);
    } else {
      setFeedback("wrong");
      statsRef.current.wrong += 1;
      statsRef.current.combo = 0;
      setWrongCount(statsRef.current.wrong);
      setCombo(0);
      setMistakes((m) => [...m, mistakeFromAnswer(question, index)]);
    }

    // Immediate next question — short visual flash only.
    window.setTimeout(() => {
      if (endedRef.current) return;
      nextQuestion(questionNumber + 1);
    }, 180);
  }

  if (phase === "over" || phase === "review") {
    const total = correctCount + wrongCount;
    return (
      <div className="gm-play">
        <GameHeader title="⚡ Speed Run" onBack={onBack} />
        <GameResultScreen
          title="Time's Up!"
          isPersonalBest={isPb}
          reviewing={phase === "review"}
          mistakes={mistakes}
          stats={[
            { label: "Correct", value: correctCount },
            { label: "Wrong", value: wrongCount },
            { label: "Total attempted", value: total },
            { label: "Accuracy", value: accuracyPercent(correctCount, total) },
            { label: "Best combo", value: bestCombo },
            { label: "Previous best", value: prevBest },
            { label: "XP gained", value: xpGained },
          ]}
          onPlayAgain={startRun}
          onBack={onBack}
          onReviewMistakes={() => setPhase("review")}
        />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="gm-play">
        <GameHeader title="⚡ Speed Run" onBack={onBack} />
        <p className="gm-empty">Not enough questions available to play.</p>
        <button type="button" className="gm-btn gm-btn--ghost" onClick={onBack}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="gm-play">
      <GameHeader title="⚡ Speed Run" onBack={onBack} />
      <div className="gm-hud gm-hud--speed">
        <CountdownTimer seconds={seconds} total={DURATION} />
        <ScoreDisplay score={correctCount} label="Correct" />
        <ScoreDisplay score={wrongCount} label="Wrong" />
        <ComboDisplay combo={combo} pop={comboPop} />
      </div>
      <GameQuestionCard
        question={question}
        questionNumber={questionNumber}
        selectedIndex={selected}
        feedback={feedback}
        onSelect={onSelect}
        compact
      />
    </div>
  );
}
