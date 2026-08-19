import { useRef, useState } from "react";
import { WORD_RELATION_TYPE_LABELS } from "../../../data/wordRelations";
import { speechService } from "../../../services/speechService";
import type { RelationStatus, WordRelation } from "../../../types/wordRelation";
import {
  playRelationSequence,
  type RelationPlayPart,
} from "../relationPlayback";
import { RelationPair } from "./RelationPair";
import { RelationTypeBanner } from "./RelationTypeBanner";
import { RelationWord } from "./RelationWord";

interface Props {
  relation: WordRelation;
  status: RelationStatus;
  onToggleLearning: (id: string) => void;
  onToggleLearned: (id: string) => void;
  compact?: boolean;
}

const STATUS_LABEL: Record<RelationStatus, string> = {
  new: "New",
  learning: "Learning",
  learned: "Learned",
};

export function RelationPairCard({
  relation,
  status,
  onToggleLearning,
  onToggleLearned,
  compact = false,
}: Props) {
  const playSessionRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [playPart, setPlayPart] = useState<RelationPlayPart | null>(null);

  const typeLabel = WORD_RELATION_TYPE_LABELS[relation.type];

  function stopPlay() {
    playSessionRef.current += 1;
    speechService.stop();
    setPlaying(false);
    setPlayPart(null);
  }

  function playCard() {
    if (playing) {
      stopPlay();
      return;
    }
    speechService.stop();
    const session = ++playSessionRef.current;
    setPlaying(true);
    playRelationSequence(
      relation,
      session,
      () => session === playSessionRef.current,
      setPlayPart,
      () => {
        if (session !== playSessionRef.current) return;
        setPlaying(false);
        setPlayPart(null);
      }
    );
  }

  return (
    <article className="rt-card" data-status={status}>
      <div className="rt-card-head">
        <span className="rt-level" data-level={relation.jlptLevel}>
          {relation.jlptLevel}
        </span>
        <span className="rt-type" data-type={relation.type}>
          <span aria-hidden="true">{typeLabel.symbol}</span>
          <span>{typeLabel.japanese}</span>
          <span className="rt-type-en">{typeLabel.english}</span>
        </span>
        <span className="rt-status" data-status={status}>
          {STATUS_LABEL[status]}
        </span>
      </div>

      <RelationTypeBanner type={relation.type} />

      <RelationPair watch={relation.id}>
        <RelationWord
          word={relation.word1}
          small={compact}
          activeJp={playPart === "word1-jp"}
          activeEn={playPart === "word1-en"}
        />
        <span className="rt-symbol" aria-hidden="true">
          {typeLabel.symbol}
        </span>
        <RelationWord
          word={relation.word2}
          small={compact}
          activeJp={playPart === "word2-jp"}
          activeEn={playPart === "word2-en"}
        />
      </RelationPair>

      {relation.nuance ? (
        <div
          className={
            playPart === "nuance"
              ? "rt-nuance rt-nuance--active"
              : "rt-nuance"
          }
        >
          <span className="rt-nuance-label">Nuance</span>
          <p lang="ja">{relation.nuance}</p>
        </div>
      ) : null}

      <div className="rt-card-foot">
        <button
          type="button"
          className={`rt-btn rt-playbtn${playing ? " rt-playbtn--active" : ""}`}
          onClick={playCard}
        >
          {playing ? "■ Stop" : "▶ Play"}
        </button>
        <div className="rt-mark">
          <button
            type="button"
            className="rt-btn rt-btn--ghost"
            aria-pressed={status === "learning"}
            onClick={() => onToggleLearning(relation.id)}
          >
            Learning
          </button>
          <button
            type="button"
            className="rt-btn rt-btn--ghost"
            aria-pressed={status === "learned"}
            onClick={() => onToggleLearned(relation.id)}
          >
            Learned
          </button>
        </div>
      </div>
    </article>
  );
}
