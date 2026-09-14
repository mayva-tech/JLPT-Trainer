import { useState } from "react";
import "../../pages/GameMode/game-mode.css";
import { WeakWordRevengeMode } from "../../pages/GameMode/modes/WeakWordRevengeMode";
import { GameResultScreen, MistakeReview } from "../../pages/GameMode/components/GameResultScreen";
import {
  loadGameModeStats,
  recordGameResult,
} from "../../utils/gameMode/stats";
import type { FinishedGame } from "../../utils/gameMode/types";
import { getWeakVocabItemIds, loadVocabQuizStats } from "../../utils/vocabQuizStats";

type Props = {
  onBack: () => void;
  onOpenTrainer?: () => void;
};

/**
 * Weak Word Dungeon — currently hosts Weak Word Revenge.
 * Monster battles can plug in later using the same Weak Words source of truth.
 */
export function WeakWordDungeon({ onBack, onOpenTrainer }: Props) {
  const weakCount = getWeakVocabItemIds(loadVocabQuizStats()).length;
  const [playing, setPlaying] = useState(false);
  const [runId, setRunId] = useState(0);
  const [result, setResult] = useState<FinishedGame | null>(null);
  const [review, setReview] = useState(false);
  const [previousBest, setPreviousBest] = useState(0);
  const [personalBest, setPersonalBest] = useState(false);
  const [leveledUp, setLeveledUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);

  if (review && result) {
    return (
      <div className="gm-root" style={{ background: "transparent", padding: 0 }}>
        <MistakeReview mistakes={result.mistakes} onBack={() => setReview(false)} />
      </div>
    );
  }

  if (result) {
    return (
      <div className="gm-root" style={{ background: "transparent", padding: 0 }}>
        <GameResultScreen
          result={result}
          previousBest={previousBest}
          personalBest={personalBest}
          leveledUp={leveledUp}
          newLevel={newLevel}
          onPlayAgain={() => {
            setResult(null);
            setRunId((n) => n + 1);
            setPlaying(true);
          }}
          onReview={() => setReview(true)}
          onHub={() => {
            setResult(null);
            setPlaying(false);
          }}
        />
      </div>
    );
  }

  if (playing) {
    return (
      <WeakWordRevengeMode
        key={runId}
        onQuit={() => setPlaying(false)}
        onFinished={(game) => {
          const stats = loadGameModeStats();
          const recorded = recordGameResult({
            mode: "revenge",
            score: game.revengeDefeated ?? 0,
            bestCombo: game.bestCombo,
            xpGained: game.xpGained,
            revengeDefeated: game.revengeDefeated,
          });
          setPreviousBest(stats.revengeBestDefeated);
          setPersonalBest(recorded.personalBest);
          setLeveledUp(recorded.leveledUp);
          setNewLevel(recorded.newLevel);
          setResult(game);
          setPlaying(false);
        }}
        onTrain={() => onOpenTrainer?.()}
      />
    );
  }

  return (
    <div>
      <button type="button" className="ppq-btn ppq-btn--ghost" onClick={onBack}>
        ← Quest Home
      </button>
      <h2 style={{ margin: "12px 0 6px" }}>👾 Weak Word Dungeon</h2>
      <p style={{ color: "var(--ppq-muted)", fontSize: 14, maxWidth: 52 * 8 }}>
        Words you miss in quests and quizzes gather here. Full monster battles
        come later — for now, challenge them with Weak Word Revenge.
      </p>
      <div className="ppq-panel" style={{ marginTop: 14 }}>
        <p style={{ margin: "0 0 10px" }}>
          Weak words waiting: <strong>{weakCount}</strong>
        </p>
        {weakCount === 0 ? (
          <p className="ppq-empty" style={{ padding: 12 }}>
            No weak words waiting. Nice work.
          </p>
        ) : (
          <button
            type="button"
            className="ppq-btn ppq-btn--primary"
            onClick={() => {
              setRunId((n) => n + 1);
              setPlaying(true);
            }}
          >
            Enter Revenge Battle
          </button>
        )}
      </div>
    </div>
  );
}
