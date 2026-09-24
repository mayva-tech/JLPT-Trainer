import { useRef, useState } from "react";
import { WORD_RELATION_TYPE_LABELS } from "../../../data/wordRelations";
import { HighlightedEnglish } from "../../../components/HighlightedEnglish";
import {
  speechService,
  type SpeechHighlight,
} from "../../../services/speechService";
import type { RelationStatus, WordRelation } from "../../../types/wordRelation";
import {
  playRelationSequence,
  type RelationPlayPart,
} from "../relationPlayback";
import { RelationPair } from "./RelationPair";
import { RelationTypeBanner } from "./RelationTypeBanner";
import { RelationWord } from "./RelationWord";

export type RelationCardPlayback = {
  part: RelationPlayPart | null;
  highlight: SpeechHighlight | null;
};

interface Props {
  relation: WordRelation;
  status: RelationStatus;
  onToggleLearning: (id: string) => void;
  onToggleLearned: (id: string) => void;
  compact?: boolean;
  /** Browse Play All — drives karaoke on the active card. */
  playOverride?: RelationCardPlayback | null;
  /** Stop parent Play All before this card starts (or when stopping). */
  onStopExternal?: () => void;
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
  playOverride = null,
  onStopExternal,
}: Props) {
  const playSessionRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [playPart, setPlayPart] = useState<RelationPlayPart | null>(null);
  const [highlight, setHighlight] = useState<SpeechHighlight | null>(null);

  const typeLabel = WORD_RELATION_TYPE_LABELS[relation.type];
  const activePart = playOverride?.part ?? playPart;
  const activeHighlight = playOverride?.highlight ?? highlight;
  const isPlaying = playOverride != null || playing;

  function stopPlay() {
    playSessionRef.current += 1;
    speechService.stop();
    setPlaying(false);
    setPlayPart(null);
    setHighlight(null);
  }

  function playCard() {
    if (playOverride) {
      onStopExternal?.();
      return;
    }
    if (playing) {
      stopPlay();
      return;
    }
    onStopExternal?.();
    speechService.stop();
    const session = ++playSessionRef.current;
    setPlaying(true);
    setHighlight(null);
    playRelationSequence(
      relation,
      session,
      () => session === playSessionRef.current,
      setPlayPart,
      () => {
        if (session !== playSessionRef.current) return;
        setPlaying(false);
        setPlayPart(null);
        setHighlight(null);
      },
      setHighlight
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
          activeJp={activePart === "word1-jp"}
          activeEn={activePart === "word1-en"}
          highlight={activeHighlight}
        />
        <span className="rt-symbol" aria-hidden="true">
          {typeLabel.symbol}
        </span>
        <RelationWord
          word={relation.word2}
          small={compact}
          activeJp={activePart === "word2-jp"}
          activeEn={activePart === "word2-en"}
          highlight={activeHighlight}
        />
      </RelationPair>

      {relation.nuance ? (
        <div
          className={
            activePart === "nuance"
              ? "rt-nuance rt-nuance--active"
              : "rt-nuance"
          }
        >
          <span className="rt-nuance-label">Nuance</span>
          <HighlightedEnglish
            text={relation.nuance}
            className="rt-nuance-body"
            highlight={activePart === "nuance" ? activeHighlight : null}
          />
        </div>
      ) : null}

      <div className="rt-card-foot">
        <button
          type="button"
          className={`rt-btn rt-playbtn${isPlaying ? " rt-playbtn--active" : ""}`}
          onClick={playCard}
        >
          {isPlaying ? "■ Stop" : "▶ Play"}
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
