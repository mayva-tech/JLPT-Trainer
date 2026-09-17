import {
  ensureDailyQuests,
  getDailyQuestDef,
} from "../utils/dailyQuests";
import type { PlayerRpgProfile } from "../types";

type Props = {
  profile: PlayerRpgProfile;
};

export function DailyQuestPanel({ profile }: Props) {
  const withDay = ensureDailyQuests(profile);
  const daily = withDay.daily;
  if (!daily) return null;

  return (
    <div className="ppq-daily">
      <header>
        <h2>Daily Quests</h2>
        <p style={{ color: "var(--ppq-muted)", fontSize: 13, margin: "4px 0 0" }}>
          Resets each local day · {daily.dayKey}
        </p>
      </header>
      <ul className="ppq-daily-list">
        {daily.questIds.map((id) => {
          const def = getDailyQuestDef(id);
          if (!def) return null;
          const progress = daily.progress[id] ?? 0;
          const done = daily.completedIds.includes(id);
          const pct = Math.round((progress / def.target) * 100);
          return (
            <li key={id} className={done ? "ppq-daily-item ppq-daily-item--done" : "ppq-daily-item"}>
              <div className="ppq-daily-item-head">
                <strong lang="ja">{def.japaneseLabel}</strong>
                <span>{done ? "✅" : `${progress}/${def.target}`}</span>
              </div>
              <span style={{ fontSize: 13, color: "var(--ppq-muted)" }}>
                {def.label} · +{def.rewardXp} XP · +{def.rewardCoins} coins
              </span>
              <div className="ppq-comm-meter-track" style={{ marginTop: 6 }}>
                <div
                  className="ppq-comm-meter-fill"
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
