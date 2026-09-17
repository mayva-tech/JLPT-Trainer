import { COMMUNICATION_SEALS } from "../data/seals";
import { PASSPORT_ACHIEVEMENTS } from "../data/achievements";
import { NPCS } from "../data/npcs";
import { CURRENCY } from "../data/rpgConfig";
import { LanguageStatsBars } from "./LanguageStatsBars";
import { getRelationship, relationshipHearts } from "../utils/relationships";
import { calcJapanesePower } from "../utils/languageStats";
import { getProfileLevel, getProfileRank } from "../utils/playerProfile";
import type { PlayerRpgProfile } from "../types";

type Props = {
  profile: PlayerRpgProfile;
};

export function JapanesePassport({ profile }: Props) {
  const rank = getProfileRank(profile);
  const level = getProfileLevel(profile);
  const power = calcJapanesePower(profile.languageStats);
  const met = NPCS.filter((n) => profile.metNpcIds.includes(n.id));

  return (
    <div className="ppq-passport">
      <header className="ppq-passport-hero">
        <p className="ppq-passport-kicker">日本語パスポート</p>
        <h2>Japanese Passport</h2>
        <p style={{ margin: 0, color: "var(--ppq-muted)", fontSize: 14 }}>
          Rank <strong lang="ja">{rank.japaneseName}</strong> · {rank.englishName}
          {" · "}
          Lv. {level} · Power {power}
        </p>
        <p className="ppq-passport-coins">
          {CURRENCY.symbol} {profile.coins} {CURRENCY.name}
        </p>
      </header>

      <section className="ppq-panel">
        <h2>Skills</h2>
        <LanguageStatsBars stats={profile.languageStats} />
      </section>

      <section className="ppq-panel">
        <h2>Communication Seals</h2>
        <div className="ppq-seal-grid">
          {COMMUNICATION_SEALS.map((seal) => {
            const earned = profile.seals.includes(seal.id);
            return (
              <div
                key={seal.id}
                className={earned ? "ppq-seal ppq-seal--on" : "ppq-seal"}
                title={seal.englishName}
              >
                <span aria-hidden="true">{earned ? seal.icon : "🔒"}</span>
                <span lang="ja">{seal.japaneseName}</span>
                <span>{seal.englishName}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="ppq-panel">
        <h2>Relationships</h2>
        {met.length === 0 ? (
          <p style={{ color: "var(--ppq-muted)", fontSize: 13, margin: 0 }}>
            Meet people on quests to build familiarity.
          </p>
        ) : (
          <ul className="ppq-rel-list">
            {met.map((npc) => {
              const rel = getRelationship(profile, npc.id);
              const hearts = relationshipHearts(rel.level);
              return (
                <li key={npc.id}>
                  <strong lang="ja">
                    {npc.portrait} {npc.japaneseName}
                  </strong>
                  <span>
                    {"♥".repeat(hearts)}
                    {"♡".repeat(Math.max(0, 5 - hearts))} Friendship Lv.
                    {rel.level}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="ppq-panel">
        <h2>Achievements</h2>
        <ul className="ppq-achieve-list">
          {PASSPORT_ACHIEVEMENTS.map((a) => {
            const unlocked =
              (a.requireQuestId &&
                profile.completedQuestIds.includes(a.requireQuestId)) ||
              (a.requireFlag && profile.flags[a.requireFlag]);
            return (
              <li
                key={a.id}
                className={unlocked ? "ppq-achieve ppq-achieve--on" : "ppq-achieve"}
              >
                <strong lang="ja">{unlocked ? "✅" : "⬜"} {a.japaneseName}</strong>
                <span>{a.englishName}</span>
                <span className="ppq-achieve-desc">{a.description}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
