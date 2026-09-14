import { useCallback, useEffect, useState } from "react";
import {
  GameHeader,
  GameQuestionCard,
  GameResultScreen,
  ScoreDisplay,
} from "../../game/components";
import {
  applyGameSessionResult,
  getN2VocabPool,
  getWeakVocabPool,
  XP_REWARDS,
  xpForCorrectAnswer,
  type GameMistake,
  type GameQuestion,
} from "../../utils/gameMode";
import {
  buildVocabularyQuizQuestions,
  seededShuffle,
} from "../../utils/vocabularyQuiz";
import {
  accuracyPercent,
  mistakeFromAnswer,
  recordGameVocabAnswer,
} from "../../utils/gameMode/sessionHelpers";
import {
  isWeakVocabItem,
  loadVocabQuizStats,
} from "../../utils/vocabQuizStats";

type Props = {
  onBack: () => void;
};

type Phase = "playing" | "feedback" | "over" | "review" | "empty";

type Enemy = {
  vocabItemId: number;
  word: string;
  reading: string;
  hp: number;
  maxHp: number;
};

const FEEDBACK_MS = 650;

function buildWeakQuestion(itemId: number, seed: string): GameQuestion | null {
  const weak = getWeakVocabPool();
  const item = weak.find((w) => w.id === itemId);
  if (!item) return null;
  const pool = getN2VocabPool();
  const [q] = buildVocabularyQuizQuestions([item], seed, {
    distractorPool: pool.length >= 2 ? pool : weak,
  });
  if (!q) return null;

  let choices = q.choices;
  let correctIndex = q.correctChoiceIndex;
  if (choices.length < 4) {
    const meanings = seededShuffle(
      pool.map((p) => p.meaning).filter((m) => m !== item.meaning),
      `${seed}:d`
    ).slice(0, 3);
    const combined = seededShuffle(
      [item.meaning, ...meanings].slice(0, 4),
      `${seed}:c`
    );
    while (combined.length < 4) combined.push("—");
    choices = combined;
    correctIndex = Math.max(
      0,
      combined.findIndex((c) => c === item.meaning)
    );
  }

  return {
    id: `weak-revenge:${item.id}:${seed}`,
    category: "weak",
    prompt: q.promptText,
    promptReading: item.reading,
    choices,
    correctIndex,
    explanation: item.meaning,
    vocabItemId: item.id,
  };
}

export function WeakWordRevengeMode({ onBack }: Props) {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [index, setIndex] = useState(0);
  const [question, setQuestion] = useState<GameQuestion | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [phase, setPhase] = useState<Phase>("playing");
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [defeated, setDefeated] = useState(0);
  const [xpGained, setXpGained] = useState(0);
  const [mistakes, setMistakes] = useState<GameMistake[]>([]);
  const [improvedIds, setImprovedIds] = useState<number[]>([]);
  const [sessionKey, setSessionKey] = useState(0);

  const startRun = useCallback(() => {
    const weak = getWeakVocabPool();
    if (weak.length === 0) {
      setEnemies([]);
      setQuestion(null);
      setPhase("empty");
      return;
    }
    const list: Enemy[] = seededShuffle(weak, `revenge:${Date.now()}`)
      .slice(0, Math.min(12, weak.length))
      .map((item) => ({
        vocabItemId: item.id,
        word: item.word,
        reading: item.reading,
        hp: 2,
        maxHp: 2,
      }));
    setEnemies(list);
    setIndex(0);
    setCombo(0);
    setBestCombo(0);
    setCorrectCount(0);
    setWrongCount(0);
    setDefeated(0);
    setXpGained(0);
    setMistakes([]);
    setImprovedIds([]);
    setSelected(null);
    setFeedback(null);
    setSessionKey((k) => k + 1);
    const first = list[0]!;
    setQuestion(
      buildWeakQuestion(first.vocabItemId, `r0:${first.vocabItemId}`)
    );
    setPhase("playing");
  }, []);

  useEffect(() => {
    startRun();
  }, [startRun]);

  const currentEnemy = enemies[index] ?? null;

  function stillNeedsReview(itemId: number): boolean {
    const stats = loadVocabQuizStats().items[String(itemId)];
    return stats ? isWeakVocabItem(stats) : false;
  }

  function goNext(
    nextEnemies: Enemy[],
    fromIndex: number,
    nextXp: number,
    nextDefeated: number,
    nextBestCombo: number
  ) {
    let nextIndex = -1;
    for (let i = 0; i < nextEnemies.length; i++) {
      const idx = (fromIndex + 1 + i) % nextEnemies.length;
      if (nextEnemies[idx]!.hp > 0) {
        nextIndex = idx;
        break;
      }
    }
    if (nextIndex < 0) {
      applyGameSessionResult({
        xpGained: nextXp,
        bestCombo: nextBestCombo,
      });
      setDefeated(nextDefeated);
      setXpGained(nextXp);
      setPhase("over");
      return;
    }
    setIndex(nextIndex);
    const enemy = nextEnemies[nextIndex]!;
    setQuestion(
      buildWeakQuestion(
        enemy.vocabItemId,
        `r${sessionKey}:${enemy.vocabItemId}:${enemy.hp}`
      )
    );
    setSelected(null);
    setFeedback(null);
    setPhase("playing");
  }

  function onSelect(choiceIndex: number) {
    if (!question || !currentEnemy || phase !== "playing") return;
    const correct = choiceIndex === question.correctIndex;
    setSelected(choiceIndex);
    setPhase("feedback");
    recordGameVocabAnswer(question, correct);

    if (correct) {
      setFeedback("correct");
      const nextCombo = combo + 1;
      const nextBest = Math.max(bestCombo, nextCombo);
      setCombo(nextCombo);
      setBestCombo(nextBest);
      setCorrectCount((c) => c + 1);
      let nextXp = xpGained + xpForCorrectAnswer(nextCombo);
      const nextEnemies = enemies.map((e) => ({ ...e }));
      const enemy = nextEnemies[index]!;
      enemy.hp = Math.max(0, enemy.hp - 1);
      let nextDefeated = defeated;
      if (enemy.hp === 0) {
        nextDefeated += 1;
        nextXp += XP_REWARDS.weakWordDefeated;
        setImprovedIds((ids) =>
          ids.includes(enemy.vocabItemId) ? ids : [...ids, enemy.vocabItemId]
        );
      }
      setEnemies(nextEnemies);
      setDefeated(nextDefeated);
      setXpGained(nextXp);
      window.setTimeout(() => {
        goNext(nextEnemies, index, nextXp, nextDefeated, nextBest);
      }, FEEDBACK_MS);
    } else {
      setFeedback("wrong");
      setCombo(0);
      setWrongCount((w) => w + 1);
      setMistakes((m) => [...m, mistakeFromAnswer(question, choiceIndex)]);
      window.setTimeout(() => {
        goNext(enemies, index, xpGained, defeated, bestCombo);
      }, FEEDBACK_MS + 350);
    }
  }

  if (phase === "empty") {
    return (
      <div className="gm-play">
        <GameHeader title="🧠 Weak Word Revenge" onBack={onBack} />
        <div className="gm-empty-card">
          <p className="gm-empty">No weak words waiting. Nice work.</p>
          <div className="gm-result__actions">
            <button
              type="button"
              className="gm-btn gm-btn--primary"
              onClick={onBack}
            >
              Back to Game Mode
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "over" || phase === "review") {
    const stillWeak = improvedIds.filter((id) => stillNeedsReview(id)).length;
    const cleared = improvedIds.length - stillWeak;
    return (
      <div className="gm-play">
        <GameHeader title="🧠 Weak Word Revenge" onBack={onBack} />
        <GameResultScreen
          title="Revenge Complete"
          reviewing={phase === "review"}
          mistakes={mistakes}
          stats={[
            { label: "Weak words attempted", value: enemies.length },
            { label: "Enemies defeated", value: defeated },
            { label: "Correct", value: correctCount },
            { label: "Incorrect", value: wrongCount },
            {
              label: "Accuracy",
              value: accuracyPercent(correctCount, correctCount + wrongCount),
            },
            { label: "Words improved", value: cleared },
            { label: "Still needing review", value: stillWeak },
            { label: "XP gained", value: xpGained },
          ]}
          onPlayAgain={startRun}
          onBack={onBack}
          onReviewMistakes={() => setPhase("review")}
        />
      </div>
    );
  }

  if (!question || !currentEnemy) {
    return (
      <div className="gm-play">
        <GameHeader title="🧠 Weak Word Revenge" onBack={onBack} />
        <p className="gm-empty">Loading…</p>
      </div>
    );
  }

  return (
    <div className="gm-play">
      <GameHeader title="🧠 Weak Word Revenge" onBack={onBack} />
      <div className="gm-hud">
        <ScoreDisplay score={defeated} label="Defeated" />
        <ScoreDisplay score={correctCount} label="Hits" />
        <div className="gm-enemy">
          <span className="gm-enemy__name" lang="ja">
            {currentEnemy.word}
          </span>
          <span className="gm-enemy__hp">
            {"❤️".repeat(currentEnemy.hp)}
            {"🖤".repeat(currentEnemy.maxHp - currentEnemy.hp)}
          </span>
        </div>
      </div>
      <p className="gm-enemy__hint">
        Enemy {index + 1}/{enemies.length} — land 2 hits to defeat
      </p>
      <GameQuestionCard
        question={question}
        questionNumber={correctCount + wrongCount + 1}
        selectedIndex={selected}
        feedback={feedback}
        onSelect={onSelect}
      />
    </div>
  );
}
