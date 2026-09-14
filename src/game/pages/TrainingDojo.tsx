import { useMemo, useState } from "react";
import { GameModeCard } from "../../pages/GameMode/components/GameModeCard";
import { GameResultScreen, MistakeReview } from "../../pages/GameMode/components/GameResultScreen";
import { SurvivalMode } from "../../pages/GameMode/modes/SurvivalMode";
import { SpeedRunMode } from "../../pages/GameMode/modes/SpeedRunMode";
import { WeakWordRevengeMode } from "../../pages/GameMode/modes/WeakWordRevengeMode";
import { BossBattleMode } from "../../pages/GameMode/modes/BossBattleMode";
import {
  loadGameModeStats,
  recordGameResult,
  type GameModeStats,
} from "../../utils/gameMode/stats";
import type { FinishedGame, GameModeId } from "../../utils/gameMode/types";
import { getLevelProgress } from "../../utils/gameMode/xp";

type DojoScreen = "menu" | GameModeId | "results" | "review";

type Props = {
  onBack: () => void;
  onOpenTrainer?: () => void;
};

/**
 * Training Dojo preserves the original arcade Game Mode modes.
 * Survival / Speed / Boss stay here; Weak Word Revenge also appears in the Dungeon.
 */
export function TrainingDojo({ onBack, onOpenTrainer }: Props) {
  const [screen, setScreen] = useState<DojoScreen>("menu");
  const [runId, setRunId] = useState(0);
  const [stats, setStats] = useState<GameModeStats>(() => loadGameModeStats());
  const [result, setResult] = useState<FinishedGame | null>(null);
  const [personalBest, setPersonalBest] = useState(false);
  const [leveledUp, setLeveledUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);
  const [previousBest, setPreviousBest] = useState(0);
  const progress = useMemo(
    () => getLevelProgress(stats.totalXp),
    [stats.totalXp]
  );

  function play(mode: GameModeId) {
    setRunId((n) => n + 1);
    setScreen(mode);
  }

  function menu() {
    setScreen("menu");
    setResult(null);
    setStats(loadGameModeStats());
  }

  function onFinished(game: FinishedGame) {
    const prior =
      game.mode === "survival"
        ? stats.survivalBestScore
        : game.mode === "speed"
          ? stats.speedRunBestScore
          : game.mode === "boss"
            ? stats.bossBestScore
            : stats.revengeBestDefeated;
    const recorded = recordGameResult({
      mode: game.mode,
      score: game.mode === "revenge" ? game.revengeDefeated ?? 0 : game.score,
      bestCombo: game.bestCombo,
      xpGained: game.xpGained,
      bossVictory: game.bossVictory,
      revengeDefeated: game.revengeDefeated,
    });
    setPreviousBest(prior);
    setPersonalBest(recorded.personalBest);
    setLeveledUp(recorded.leveledUp);
    setNewLevel(recorded.newLevel);
    setStats(recorded.stats);
    setResult(game);
    setScreen("results");
  }

  if (screen === "survival") {
    return <SurvivalMode key={runId} onQuit={menu} onFinished={onFinished} />;
  }
  if (screen === "speed") {
    return <SpeedRunMode key={runId} onQuit={menu} onFinished={onFinished} />;
  }
  if (screen === "revenge") {
    return (
      <WeakWordRevengeMode
        key={runId}
        onQuit={menu}
        onFinished={onFinished}
        onTrain={() => onOpenTrainer?.()}
      />
    );
  }
  if (screen === "boss") {
    return <BossBattleMode key={runId} onQuit={menu} onFinished={onFinished} />;
  }
  if (screen === "results" && result) {
    return (
      <div className="gm-root" style={{ background: "transparent", minHeight: 0, padding: 0 }}>
        <GameResultScreen
          result={result}
          previousBest={previousBest}
          personalBest={personalBest}
          leveledUp={leveledUp}
          newLevel={newLevel}
          onPlayAgain={() => play(result.mode)}
          onReview={() => setScreen("review")}
          onHub={menu}
        />
      </div>
    );
  }
  if (screen === "review" && result) {
    return (
      <div className="gm-root" style={{ background: "transparent", minHeight: 0, padding: 0 }}>
        <MistakeReview mistakes={result.mistakes} onBack={() => setScreen("results")} />
      </div>
    );
  }

  return (
    <div>
      <header style={{ marginBottom: 14 }}>
        <button type="button" className="ppq-btn ppq-btn--ghost" onClick={onBack}>
          ← Quest Home
        </button>
        <h2 style={{ margin: "12px 0 4px" }}>⚔ Training Dojo</h2>
        <p style={{ color: "var(--ppq-muted)", margin: 0, fontSize: 13 }}>
          Drill with the classic arcade modes. Arcade XP: Lv. {progress.level} ·{" "}
          {stats.totalXp} XP
        </p>
      </header>
      <div className="gm-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
        <GameModeCard
          emoji="❤️"
          title="Survival Mode"
          description="Three lives. Rising difficulty."
          statLabel="Best score"
          statValue={stats.survivalBestScore ? String(stats.survivalBestScore) : "—"}
          onPlay={() => play("survival")}
        />
        <GameModeCard
          emoji="⚡"
          title="Speed Run"
          description="Sixty seconds of rapid questions."
          statLabel="Best correct"
          statValue={stats.speedRunBestScore ? String(stats.speedRunBestScore) : "—"}
          onPlay={() => play("speed")}
        />
        <GameModeCard
          emoji="👹"
          title="Boss Battle"
          description="語彙の鬼 — chip the demon's HP."
          statLabel="Victories"
          statValue={String(stats.bossVictories)}
          onPlay={() => play("boss")}
        />
        <GameModeCard
          emoji="🧠"
          title="Weak Word Revenge"
          description="Also available from the Weak Word Dungeon."
          statLabel="Best defeated"
          statValue={stats.revengeBestDefeated ? String(stats.revengeBestDefeated) : "—"}
          onPlay={() => play("revenge")}
        />
      </div>
    </div>
  );
}
