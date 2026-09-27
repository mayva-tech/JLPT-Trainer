import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WORD_RELATION_TYPE_LABELS } from "../../../data/wordRelations";
import { HighlightedEnglish } from "../../../components/HighlightedEnglish";
import {
  speechService,
  type SpeechHighlight,
} from "../../../services/speechService";
import {
  PLAY_ALL_CARD_HOLD_MS,
  PLAY_ALL_CARD_LEAD_IN_MS,
} from "../../../config/speechTiming";
import type { WordRelation } from "../../../types/wordRelation";
import {
  playRelationSequence,
  type RelationPlayPart,
} from "../relationPlayback";
import { RelationExampleBlock } from "./RelationExampleBlock";
import { RelationPair } from "./RelationPair";
import { RelationTypeBanner } from "./RelationTypeBanner";
import { RelationWord } from "./RelationWord";

interface Props {
  relations: readonly WordRelation[];
}

const ChevronLeft = () => (
  <svg width={28} height={28} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="m15 18-6-6 6-6"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronRight = () => (
  <svg width={28} height={28} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="m9 18 6-6-6-6"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function RelationStudy({ relations }: Props) {
  const playSessionRef = useRef(0);
  const [order, setOrder] = useState<string[]>(() =>
    relations.map((relation) => relation.id)
  );
  const [index, setIndex] = useState(0);
  const [playingCard, setPlayingCard] = useState(false);
  const [playingAll, setPlayingAll] = useState(false);
  const [playPart, setPlayPart] = useState<RelationPlayPart | null>(null);
  const [highlight, setHighlight] = useState<SpeechHighlight | null>(null);

  const stopAuto = useCallback(() => {
    playSessionRef.current += 1;
    speechService.stop();
    setPlayingCard(false);
    setPlayingAll(false);
    setPlayPart(null);
    setHighlight(null);
  }, []);

  useEffect(() => {
    setOrder(relations.map((relation) => relation.id));
    setIndex(0);
    stopAuto();
  }, [relations, stopAuto]);

  const byId = useMemo(
    () => new Map(relations.map((relation) => [relation.id, relation])),
    [relations]
  );

  const deck = useMemo(
    () =>
      order
        .map((id) => byId.get(id))
        .filter((relation): relation is WordRelation => Boolean(relation)),
    [order, byId]
  );

  const relation = deck[index] ?? null;

  const backRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const back = backRef.current;
    if (!back) return;
    if (!playPart) {
      back.scrollTop = 0;
      return;
    }
    const target = back.querySelector<HTMLElement>(
      playPart.startsWith("example")
        ? ".rt-example"
        : playPart === "nuance"
          ? ".rt-nuance"
          : ".rt-pair"
    );
    target?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [playPart, relation?.id]);

  const go = useCallback(
    (delta: number) => {
      if (deck.length === 0) return;
      stopAuto();
      setIndex((current) => (current + delta + deck.length) % deck.length);
    },
    [deck.length, stopAuto]
  );

  const playCurrent = useCallback(() => {
    if (!relation) return;
    if (playingCard) {
      stopAuto();
      return;
    }
    speechService.stop();
    const session = ++playSessionRef.current;
    setPlayingAll(false);
    setPlayingCard(true);
    setHighlight(null);
    playRelationSequence(
      relation,
      session,
      () => session === playSessionRef.current,
      setPlayPart,
      () => {
        if (session !== playSessionRef.current) return;
        setPlayingCard(false);
        setPlayPart(null);
        setHighlight(null);
      },
      setHighlight
    );
  }, [relation, playingCard, stopAuto]);

  const playAll = useCallback(() => {
    if (playingAll) {
      stopAuto();
      return;
    }
    if (deck.length === 0) return;

    speechService.stop();
    const session = ++playSessionRef.current;
    setPlayingCard(false);
    setPlayingAll(true);
    setHighlight(null);

    const startIndex = index;

    const isAlive = () => session === playSessionRef.current;

    const run = (cardIndex: number, leadIn: number) => {
      if (!isAlive()) return;
      const item = deck[cardIndex];
      if (!item) {
        stopAuto();
        return;
      }
      setIndex(cardIndex);
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
            if (next >= deck.length) {
              stopAuto();
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

    run(startIndex, 0);
  }, [deck, playingAll, stopAuto, index]);

  if (deck.length === 0) {
    return (
      <p className="rt-empty">
        No relations in this deck. Adjust the level or type filters above.
      </p>
    );
  }

  if (!relation) return null;

  const typeLabel = WORD_RELATION_TYPE_LABELS[relation.type];

  return (
    <div className="rt-study-card">
      <div className="rt-card-head">
        <div className="rt-playrow">
          <button
            type="button"
            className={`rt-playbtn${playingCard ? " rt-playbtn--active" : ""}`}
            title="Play both words JP+EN, the nuance, then the example"
            onClick={playCurrent}
          >
            {playingCard ? "■ Stop" : "▶ Play"}
          </button>
          <button
            type="button"
            className={`rt-playbtn${playingAll ? " rt-playbtn--active" : ""}`}
            title="Play every pair in this deck from the current card"
            onClick={playAll}
          >
            {playingAll ? "■ Stop All" : "▶ Play All"}
          </button>
        </div>
        <span className="rt-study-count">
          {index + 1} / {deck.length}
        </span>
      </div>

      <div className="rt-study-nav">
        <button
          type="button"
          className="rt-navbtn"
          aria-label="Previous card"
          onClick={() => go(-1)}
        >
          <ChevronLeft />
        </button>

        <div className="rt-study-panel">
          <div className="rt-study-back" ref={backRef}>
            <RelationTypeBanner type={relation.type} level={relation.jlptLevel} />
            <RelationPair watch={relation.id}>
              <RelationWord
                word={relation.word1}
                activeJp={playPart === "word1-jp"}
                activeEn={playPart === "word1-en"}
                highlight={highlight}
              />
              <span className="rt-symbol" aria-hidden="true">
                {typeLabel.symbol}
              </span>
              <RelationWord
                word={relation.word2}
                activeJp={playPart === "word2-jp"}
                activeEn={playPart === "word2-en"}
                highlight={highlight}
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
                <HighlightedEnglish
                  text={relation.nuance}
                  className="rt-nuance-body"
                  highlight={playPart === "nuance" ? highlight : null}
                />
              </div>
            ) : null}
            {relation.example ? (
              <RelationExampleBlock
                example={relation.example}
                activePart={playPart}
                highlight={highlight}
              />
            ) : null}
          </div>
        </div>

        <button
          type="button"
          className="rt-navbtn"
          aria-label="Next card"
          onClick={() => go(1)}
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
