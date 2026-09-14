import type { NpcDefinition } from "../types";

type Props = {
  npc: NpcDefinition;
};

export function NpcPortrait({ npc }: Props) {
  return (
    <div className="ppq-npc">
      <div className="ppq-npc-portrait" aria-hidden="true">
        {npc.portrait}
      </div>
      <div className="ppq-npc-meta">
        <strong lang="ja">{npc.japaneseName}</strong>
        <span>
          {npc.name} · {npc.role}
        </span>
      </div>
    </div>
  );
}
