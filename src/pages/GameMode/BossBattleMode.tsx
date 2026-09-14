import { useCallback, useEffect, useRef, useState } from "react";
import {
  BossHealthBar,
  ComboDisplay,
  GameHeader,
  GameQuestionCard,
  GameResultScreen,
  LivesDisplay,
} from "../../game/components";
import {
  applyGameSessionResult,
  createSelectorState,
  getDefaultBoss,
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

type Phase = "playing" | "feedback" | "victory" | "defeat" | "review";

const FEEDBACK_MS = 700;

export function BossBattleMode({ onBack }: Props) {
  const boss = getDefaultBoss();
  const [bossHp, setBossHp] = useState(boss.bossMaxHp);
  const [playerHp, setPlayerHp] = useState(boss.playerMaxHp);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [xpGained, setXpGained] = useState(0);
  const [question, setQuestion] = useState<GameQuestion | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [phase, setPhase] = useState<Phase>("playing");
  const [mistakes, setMistakes] = useState<GameMistake[]>([]);
  const [comboPop, setComboPop] = useState(false);
  const selectorRef = useRef(createSelectorState());
  const timerRef = useRef<number | null>(null);

  const nextQuestion = useCallback((num: number) => {
    const q = selectNextQuestion(selectorRef.current, {
      seedPrefix: `boss:${boss.id}:${Date.now()}`,
      weights: {
        n2: 0.55,
        weak: 0.25,
        "synonym-antonym": 0.1,
        expression: 0.05,
        prerequisite: 0.05,
      },
    });
    setQuestion(q);
    setSelected(null);
    setFeedback(null);
    setQuestionNumber(num);
    if (!q) setPhase("defeat");
    else setPhase("playing");
  }, [boss.id]);

  const startRun = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    selectorRef.current = createSelectorState();
    setBossHp(boss.bossMaxHp);
    setPlayerHp(boss.playerMaxHp);
    setCombo(0);
    setBestCombo(0);
    setCorrectCount(0);
    setWrongCount(0);
    setXpGained(0);
    setMistakes([]);
    setComboPop(false);
    nextQuestion(1);
  }, [boss.bossMaxHp, boss.playerMaxHp, nextQuestion]);

  useEffect(() => {
    startRun();
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [startRun]);

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
      let nextXp = xpGained + gained;
      const nextBossHp = Math.max(0, bossHp - boss.damagePerHit);
      setCombo(nextCombo);
      setBestCombo((b) => Math.max(b, nextCombo));
      setCorrectCount((c) => c + 1);
      setBossHp(nextBossHp);
      setComboPop(true);
      window.setTimeout(() => setComboPop(false), 400);

      if (nextBossHp <= 0) {
        nextXp += XP_REWARDS.bossDefeated;
        setXpGained(nextXp);
        timerRef.current = window.setTimeout(() => {
          applyGameSessionResult({
            xpGained: nextXp,
            bossVictory: true,
            bestCombo: Math.max(bestCombo, nextCombo),
          });
          setPhase("victory");
        }, FEEDBACK_MS);
        return;
      }

      setXpGained(nextXp);
      timerRef.current = window.setTimeout(() => {
        nextQuestion(questionNumber + 1);
      }, FEEDBACK_MS);
    } else {
      setFeedback("wrong");
      setCombo(0);
      const nextPlayerHp = playerHp - 1;
      setPlayerHp(nextPlayerHp);
      setWrongCount((w) => w + 1);
      setMistakes((m) => [...m, mistakeFromAnswer(question, index)]);

      if (nextPlayerHp <= 0) {
        timerRef.current = window.setTimeout(() => {
          applyGameSessionResult({
            xpGained,
            bestCombo,
          });
          setPhase("defeat");
        }, FEEDBACK_MS + 350);
        return;
      }

      timerRef.current = window.setTimeout(() => {
        nextQuestion(questionNumber + 1);
      }, FEEDBACK_MS + 350);
    }
  }

  if (phase === "victory" || phase === "defeat" || phase === "review") {
    const won = phase === "victory" || (phase === "review" && bossHp <= 0);
    return (
      <div className="gm-play">
        <GameHeader
          title={`${boss.emoji} ${boss.nameJa}`}
          subtitle={boss.nameEn}
          onBack={onBack}
        />
        <GameResultScreen
          title={won ? "Victory!" : "Defeat…"}
          headline={
            won
              ? `You defeated ${boss.nameJa}!`
              : `${boss.nameJa} overpowered you.`
          }
          reviewing={phase === "review"}
          mistakes={mistakes}
          stats={[
            { label: "Boss HP left", value: Math.max(0, bossHp) },
            { label: "Hearts left", value: Math.max(0, playerHp) },
            { label: "Correct", value: correctCount },
            { label: "Wrong", value: wrongCount },
            {
              label: "Accuracy",
              value: accuracyPercent(correctCount, correctCount + wrongCount),
            },
            { label: "Best combo", value: bestCombo },
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
        <GameHeader title={`${boss.emoji} Boss Battle`} onBack={onBack} />
        <p className="gm-empty">Not enough questions available to play.</p>
        <button type="button" className="gm-btn gm-btn--ghost" onClick={onBack}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="gm-play">
      <GameHeader
        title={`${boss.emoji} ${boss.nameJa}`}
        subtitle={boss.nameEn}
        onBack={onBack}
      />
      <div className="gm-boss-panel">
        <div className="gm-boss-panel__name">
          <span aria-hidden>{boss.emoji}</span> {boss.nameJa}
        </div>
        <BossHealthBar current={bossHp} max={boss.bossMaxHp} />
        <div className="gm-hud">
          <LivesDisplay lives={playerHp} maxLives={boss.playerMaxHp} />
          <ComboDisplay combo={combo} pop={comboPop} />
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
