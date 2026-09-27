import { useCallback, useMemo, useRef, useState } from "react";
import {
  speechService,
  type SpeechHighlight,
} from "../../../services/speechService";
import {
  PLAY_ALL_CARD_HOLD_MS,
  PLAY_ALL_CARD_LEAD_IN_MS,
} from "../../../config/speechTiming";
import type { RelationStatus, WordRelation } from "../../../types/wordRelation";
import {
  playRelationSequence,
  type RelationPlayPart,
} from "../relationPlayback";
import { RelationPairCard } from "./RelationPairCard";

interface Props {
  relations: readonly WordRelation[];
  statusOf: (id: string) => RelationStatus;
  onToggleLearning: (id: string) => void;
  onToggleLearned: (id: string) => void;
}

const PAGE_SIZE = 24;

export function RelationBrowse({
  relations,
  statusOf,
  onToggleLearning,
  onToggleLearned,
}: Props) {
  const playSessionRef = useRef(0);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [playingAll, setPlayingAll] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [playPart, setPlayPart] = useState<RelationPlayPart | null>(null);
  const [highlight, setHighlight] = useState<SpeechHighlight | null>(null);

  const shown = useMemo(
    () => relations.slice(0, visible),
    [relations, visible]
  );

  const stopAll = useCallback(() => {
    playSessionRef.current += 1;
    speechService.stop();
    setPlayingAll(false);
    setActiveId(null);
    setPlayPart(null);
    setHighlight(null);
  }, []);

  const playAll = useCallback(() => {
    if (playingAll) {
      stopAll();
      return;
    }
    if (shown.length === 0) return;

    speechService.stop();
    const session = ++playSessionRef.current;
    setPlayingAll(true);
    setHighlight(null);

    const isAlive = () => session === playSessionRef.current;

    const run = (cardIndex: number, leadIn: number) => {
      if (!isAlive()) return;
      const item = shown[cardIndex];
      if (!item) {
        stopAll();
        return;
      }
      setActiveId(item.id);
      setPlayPart(null);
      setHighlight(null);
      window.setTimeout(() => {
        if (!isAlive()) return;
        playRelationSequence(
          item,
          session,
          isAlive,
          setPlayPart,
          () => {
            if (!isAlive()) return;
            const next = cardIndex + 1;
            if (next >= shown.length) {
              stopAll();
              return;
            }
            window.setTimeout(
              () => run(next, PLAY_ALL_CARD_LEAD_IN_MS),
              PLAY_ALL_CARD_HOLD_MS
            );
          },
          setHighlight
        );
      }, leadIn);
    };

    run(0, 0);
  }, [playingAll, shown, stopAll]);

  if (relations.length === 0) {
    return (
      <p className="rt-empty">
        No relations match your filters. Try clearing the search or choosing a
        different level or type.
      </p>
    );
  }

  return (
    <>
      <div className="rt-playrow rt-playrow--browse">
        <button
          type="button"
          className={`rt-playbtn${playingAll ? " rt-playbtn--active" : ""}`}
          title="Play every visible card: both words JP+EN, nuance, then example"
          onClick={playAll}
        >
          {playingAll ? "■ Stop All" : "▶ Play All"}
        </button>
        <p className="rt-play-note">
          Each card also has its own ▶ Play button.
        </p>
      </div>

      <div className="rt-grid">
        {shown.map((relation) => (
          <RelationPairCard
            key={relation.id}
            relation={relation}
            status={statusOf(relation.id)}
            onToggleLearning={onToggleLearning}
            onToggleLearned={onToggleLearned}
            playOverride={
              playingAll && activeId === relation.id
                ? { part: playPart, highlight }
                : null
            }
            onStopExternal={playingAll ? stopAll : undefined}
          />
        ))}
      </div>
      {visible < relations.length ? (
        <button
          type="button"
          className="rt-btn rt-more"
          onClick={() => setVisible((count) => count + PAGE_SIZE)}
        >
          Show more ({relations.length - visible} remaining)
        </button>
      ) : null}
    </>
  );
}
