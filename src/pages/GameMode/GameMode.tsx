import { useCallback, useState } from "react";
import { GameHeader, GameModeCard, XPBar } from "../../game/components";
import {
  bestOverallScore,
  FEATURED_LABELS,
  loadGameModeStats,
  todaysFeaturedChallenge,
  type GameModeId,
} from "../../utils/gameMode";
import { BossBattleMode } from "./BossBattleMode";
import { SpeedRunMode } from "./SpeedRunMode";
import { SurvivalMode } from "./SurvivalMode";
import { WeakWordRevengeMode } from "./WeakWordRevengeMode";
import "./game-mode.css";

type Screen = "hub" | GameModeId;

export default function GameMode() {
  const [screen, setScreen] = useState<Screen>("hub");
  const [statsVersion, setStatsVersion] = useState(0);

  const refresh = useCallback(() => {
    setStatsVersion((v) => v + 1);
  }, []);

  const backToHub = useCallback(() => {
    refresh();
    setScreen("hub");
  }, [refresh]);

  if (screen === "survival") {
    return <SurvivalMode onBack={backToHub} />;
  }
  if (screen === "speed-run") {
    return <SpeedRunMode onBack={backToHub} />;
  }
  if (screen === "weak-revenge") {
    return <WeakWordRevengeMode onBack={backToHub} />;
  }
  if (screen === "boss-battle") {
    return <BossBattleMode onBack={backToHub} />;
  }

  // statsVersion forces re-read after returning from a mode
  void statsVersion;
  const stats = loadGameModeStats();
  const featured = todaysFeaturedChallenge();
  const overall = bestOverallScore(stats);

  return (
    <div className="gm-root">
      <GameHeader
        title="🎮 Game Mode"
        subtitle="Energetic drills with real JLPT data"
      />

      <section className="gm-hero-stats" aria-label="Player progress">
        <XPBar totalXp={stats.totalXp} />
        <div className="gm-hero-stats__row">
          {stats.dayStreak > 0 ? (
            <div className="gm-stat-pill">
              <span className="gm-stat-pill__label">Streak</span>
              <span className="gm-stat-pill__value">{stats.dayStreak} day{stats.dayStreak === 1 ? "" : "s"}</span>
            </div>
          ) : null}
          <div className="gm-stat-pill">
            <span className="gm-stat-pill__label">Best score</span>
            <span className="gm-stat-pill__value">{overall}</span>
          </div>
          <div className="gm-stat-pill">
            <span className="gm-stat-pill__label">Boss wins</span>
            <span className="gm-stat-pill__value">{stats.bossVictories}</span>
          </div>
          <div className="gm-stat-pill">
            <span className="gm-stat-pill__label">Best combo</span>
            <span className="gm-stat-pill__value">{stats.bestCombo}</span>
          </div>
        </div>
        <p className="gm-featured">
          Today&apos;s featured challenge:{" "}
          <strong>{FEATURED_LABELS[featured]}</strong>
        </p>
      </section>

      <section className="gm-mode-grid" aria-label="Game modes">
        <GameModeCard
          emoji="❤️"
          title="Survival Mode"
          description="3 lives. Keep answering as difficulty climbs — how long can you last?"
          bestLabel="Best score"
          bestValue={stats.survivalBest}
          featured={featured === "survival"}
          onPlay={() => setScreen("survival")}
        />
        <GameModeCard
          emoji="⚡"
          title="Speed Run"
          description="60 seconds. Answer as many as you can — no long pauses."
          bestLabel="Best correct"
          bestValue={stats.speedRunBest}
          featured={featured === "speed-run"}
          onPlay={() => setScreen("speed-run")}
        />
        <GameModeCard
          emoji="🧠"
          title="Weak Word Revenge"
          description="Your weak words have 2 HP. Hit them twice to defeat them."
          bestLabel="Games played"
          bestValue={stats.gamesPlayed}
          featured={featured === "weak-revenge"}
          onPlay={() => setScreen("weak-revenge")}
        />
        <GameModeCard
          emoji="👹"
          title="Boss Battle"
          description="Face 語彙の鬼 — chip away at 100 HP before your hearts run out."
          bestLabel="Victories"
          bestValue={stats.bossVictories}
          featured={featured === "boss-battle"}
          onPlay={() => setScreen("boss-battle")}
        />
      </section>
    </div>
  );
}
