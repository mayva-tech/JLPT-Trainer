import { useCallback, useEffect, useRef, useState } from "react";
import {
  ComboDisplay,
  GameHeader,
  GameQuestionCard,
  GameResultScreen,
  LivesDisplay,
  ScoreDisplay,
} from "../../game/components";
import {
  applyGameSessionResult,
  createSelectorState,
  loadGameModeStats,
  selectNextQuestion,
  survivalCategoryForRound,
  survivalWeightsForRound,
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

type Phase = "playing" | "feedback" | "over" | "review";

const QUESTIONS_PER_ROUND = 5;
const START_LIVES = 3;
const FEEDBACK_MS = 700;

export function SurvivalMode({ onBack }: Props) {
  const [lives, setLives] = useState(START_LIVES);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [round, setRound] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [xpGained, setXpGained] = useState(0);
  const [question, setQuestion] = useState<GameQuestion | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [phase, setPhase] = useState<Phase>("playing");
  const [mistakes, setMistakes] = useState<GameMistake[]>([]);
  const [weakFound, setWeakFound] = useState(0);
  const [comboPop, setComboPop] = useState(false);
  const [prevBest, setPrevBest] = useState(0);
  const [isPb, setIsPb] = useState(false);
  const selectorRef = useRef(createSelectorState());
  const advanceTimer = useRef<number | null>(null);

  const loadNext = useCallback((nextRound: number, nextQNum: number) => {
    const force = survivalCategoryForRound(nextRound);
    const q = selectNextQuestion(selectorRef.current, {
      forceCategory: force,
      weights: survivalWeightsForRound(nextRound),
      seedPrefix: `survival:${Date.now()}`,
    });
    setQuestion(q);
    setSelected(null);
    setFeedback(null);
    setQuestionNumber(nextQNum);
    setRound(nextRound);
    if (!q) {
      setPhase("over");
    } else {
      setPhase("playing");
    }
  }, []);

  const startRun = useCallback(() => {
    selectorRef.current = createSelectorState();
    const stats = loadGameModeStats();
    setPrevBest(stats.survivalBest);
    setLives(START_LIVES);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setCorrectCount(0);
    setXpGained(0);
    setMistakes([]);
    setWeakFound(0);
    setIsPb(false);
    setComboPop(false);
    loadNext(1, 1);
  }, [loadNext]);

  useEffect(() => {
    startRun();
    return () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    };
  }, [startRun]);

  function finishRun(finalScore: number, finalCombo: number, xp: number) {
    const stats = applyGameSessionResult({
      xpGained: xp,
      survivalScore: finalScore,
      bestCombo: finalCombo,
    });
    setIsPb(finalScore > prevBest && finalScore > 0);
    setPrevBest(stats.survivalBest);
    setPhase("over");
  }

  function advanceAfterAnswer(nextLives: number, nextScore: number, nextCombo: number, nextXp: number) {
    if (nextLives <= 0) {
      finishRun(nextScore, Math.max(bestCombo, nextCombo), nextXp);
      return;
    }
    const nextQNum = questionNumber + 1;
    const nextRound =
      nextQNum % QUESTIONS_PER_ROUND === 1 && nextQNum > 1
        ? round + 1
        : round;
    loadNext(nextRound, nextQNum);
  }

  function onSelect(index: number) {
    if (!question || phase !== "playing") return;
    const correct = index === question.correctIndex;
    setSelected(index);
    setPhase("feedback");

    recordGameVocabAnswer(question, correct);

    if (correct) {
      setFeedback("correct");
      const nextCombo = combo + 1;
      const gained = xpForCorrectAnswer(nextCombo);
      const nextXp = xpGained + gained;
      const nextScore = score + 10 + Math.min(nextCombo, 10);
      setCombo(nextCombo);
      setBestCombo((b) => Math.max(b, nextCombo));
      setScore(nextScore);
      setCorrectCount((c) => c + 1);
      setXpGained(nextXp);
      setComboPop(true);
      window.setTimeout(() => setComboPop(false), 400);
      advanceTimer.current = window.setTimeout(() => {
        advanceAfterAnswer(lives, nextScore, nextCombo, nextXp);
      }, FEEDBACK_MS);
    } else {
      setFeedback("wrong");
      setCombo(0);
      const nextLives = lives - 1;
      setLives(nextLives);
      setMistakes((m) => [...m, mistakeFromAnswer(question, index)]);
      if (question.category === "weak" || question.vocabItemId != null) {
        setWeakFound((w) => w + 1);
      }
      advanceTimer.current = window.setTimeout(() => {
        advanceAfterAnswer(nextLives, score, 0, xpGained);
      }, FEEDBACK_MS + 400);
    }
  }

  if (phase === "over" || phase === "review") {
    const attempted = questionNumber - (question ? 0 : 1);
    const survived = Math.max(0, correctCount);
    return (
      <div className="gm-play">
        <GameHeader title="❤️ Survival Mode" onBack={onBack} />
        <GameResultScreen
          title="Game Over"
          headline={`You survived ${survived} correct answer${survived === 1 ? "" : "s"}`}
          isPersonalBest={isPb}
          reviewing={phase === "review"}
          mistakes={mistakes}
          stats={[
            { label: "Final score", value: score },
            { label: "Questions survived", value: survived },
            {
              label: "Accuracy",
              value: accuracyPercent(correctCount, Math.max(attempted, correctCount + mistakes.length)),
            },
            { label: "Best combo", value: bestCombo },
            { label: "Weak words discovered", value: weakFound },
            { label: "XP gained", value: xpGained },
            { label: "Personal best", value: Math.max(prevBest, score) },
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
        <GameHeader title="❤️ Survival Mode" onBack={onBack} />
        <p className="gm-empty">Not enough questions available to play.</p>
        <button type="button" className="gm-btn gm-btn--ghost" onClick={onBack}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="gm-play">
      <GameHeader title="❤️ Survival Mode" onBack={onBack}>
        <span className="gm-chip">Round {round}</span>
      </GameHeader>
      <div className="gm-hud">
        <LivesDisplay lives={lives} maxLives={START_LIVES} />
        <ScoreDisplay score={score} />
        <ComboDisplay combo={combo} pop={comboPop} />
      </div>
      <div className="gm-progress-line">
        <span>
          Question {questionNumber} · Difficulty {Math.min(round, 6)}/6+
        </span>
        <div className="gm-progress-line__bar">
          <div
            className="gm-progress-line__fill"
            style={{
              width: `${Math.min(100, (round / 6) * 100)}%`,
            }}
          />
        </div>
      </div>
      <GameQuestionCard
        question={question}
        questionNumber={questionNumber}
        selectedIndex={selected}
        feedback={feedback}
        onSelect={onSelect}
      />
    </div>
  );
}
