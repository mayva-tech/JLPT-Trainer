import {
  SKILL_GROUP_LABELS,
  SKILL_NODES,
  type SkillGroupId,
} from "../data/skills";
import { isSkillUnlocked } from "../utils/skillTree";
import type { PlayerRpgProfile } from "../types";

type Props = {
  profile: PlayerRpgProfile;
};

const GROUPS: SkillGroupId[] = [
  "listening",
  "conversation",
  "grammar",
  "vocabulary",
];

export function SkillTreePanel({ profile }: Props) {
  return (
    <div className="ppq-skills">
      <header>
        <h2>Japanese Skill Tree</h2>
        <p style={{ color: "var(--ppq-muted)", fontSize: 13, margin: "4px 0 0" }}>
          Unlock nodes by clearing missions. Conversation Repair grants an extra
          Try again.
        </p>
      </header>
      {GROUPS.map((group) => (
        <section key={group} className="ppq-panel" style={{ marginTop: 12 }}>
          <h2>
            <span lang="ja">{SKILL_GROUP_LABELS[group].ja}</span>
            {" · "}
            {SKILL_GROUP_LABELS[group].en}
          </h2>
          <ul className="ppq-skill-list">
            {SKILL_NODES.filter((n) => n.group === group).map((node) => {
              const on = isSkillUnlocked(profile, node);
              return (
                <li
                  key={node.id}
                  className={on ? "ppq-skill-node ppq-skill-node--on" : "ppq-skill-node"}
                >
                  <strong>
                    {on ? "◆" : "◇"}{" "}
                    <span lang="ja">{node.japaneseName}</span>
                  </strong>
                  <span>{node.englishName}</span>
                  <span className="ppq-skill-desc">{node.description}</span>
                  {!on ? (
                    <span className="ppq-skill-req">
                      Needs {node.requiresQuests}+ quests
                      {node.requiresNode ? " · prior node" : ""}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
