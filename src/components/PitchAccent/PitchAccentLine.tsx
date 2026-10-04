import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ACCENT_TYPE_LABEL,
  accentType,
  getPhrasePitch,
  getPitchAccent,
  pitchPattern,
  splitMorae,
} from "../../utils/pitchAccent";
import "./pitchAccent.css";

/** Per-mora timing of the draw-on animation at normal speech rate. */
const MS_PER_MORA = 170;
/** Viewbox units per cell; the cell is 1.25em wide and the svg 1em tall (10 units). */
const CELL = 12.5;
const Y = { H: 2, L: 8.5 } as const;

/** Replay counter: bumps when speech starts and on tap. */
function useReplay(speaking: boolean) {
  const [play, setPlay] = useState(0);
  const wasSpeaking = useRef(false);
  useEffect(() => {
    if (speaking && !wasSpeaking.current) setPlay((p) => p + 1);
    wasSpeaking.current = speaking;
  }, [speaking]);
  return [play, () => setPlay((p) => p + 1)] as const;
}

/**
 * One word's kana with its high/low line; `particles` follow it in their own
 * colour (high after heiban, low otherwise). `start` is the mora offset of
 * this word in the draw-on animation.
 */
function PitchFigure({
  kana,
  n,
  particles,
  start = 0,
  sample = false,
}: {
  kana: string;
  n: number;
  particles: string;
  start?: number;
  sample?: boolean;
}) {
  const morae = splitMorae(kana);
  const after = splitMorae(particles);
  const { morae: pitches, particle } = pitchPattern(morae.length, n);
  const cells = morae.length + after.length;
  const pts = [...pitches, ...after.map(() => particle)].map((p, i) => ({
    x: i * CELL + CELL / 2,
    y: Y[p],
  }));
  const wordLine = pts.slice(0, morae.length).map((p) => `${p.x},${p.y}`).join(" ");
  const tailLine = pts.slice(morae.length - 1).map((p) => `${p.x},${p.y}`).join(" ");
  const delay = (i: number) => ({ animationDelay: `${(start + i) * MS_PER_MORA}ms` });

  return (
    <div className="pa-figure" style={{ "--pa-cells": cells } as CSSProperties}>
      <svg className="pa-svg" viewBox={`0 0 ${cells * CELL} 10`} aria-hidden="true" focusable="false">
        <polyline
          className="pa-line"
          points={wordLine}
          pathLength={1}
          style={{ animationDuration: `${morae.length * MS_PER_MORA}ms`, ...delay(0) }}
        />
        {after.length ? <polyline className="pa-tail" points={tailLine} style={delay(morae.length)} /> : null}
        {pts.map((p, i) => (
          <circle
            key={i}
            className={i < morae.length ? "pa-dot" : "pa-dot pa-dot--particle"}
            cx={p.x}
            cy={p.y}
            r={1.5}
            style={delay(i)}
          />
        ))}
      </svg>
      <div className="pa-kana" lang="ja" aria-hidden="true">
        {morae.map((m, i) => (
          <span
            key={i}
            className={`pa-mora pa-mora--${pitches[i]}${m.length > 1 ? " pa-mora--wide" : ""}`}
            style={delay(i)}
          >
            {m}
          </span>
        ))}
        {after.map((m, i) => (
          <span
            key={`p${i}`}
            className="pa-mora pa-mora--particle"
            title={sample ? "Sample particle: shows the pitch after the word" : undefined}
          >
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * The word's reading in kana with its high/low pitch drawn above it (its
 * primary accent when usage varies). The last, hollow dot is the
 * pitch of a sample particle — the only way to tell 端 [0] from 橋 [2].
 *
 * While the word is being spoken the line draws itself mora by mora, so the
 * learner can shadow along. Tap to replay. Renders nothing when the word has
 * no verified accent entry.
 */
export function PitchAccentLine({
  word,
  reading,
  speaking = false,
  className = "",
}: {
  word: string;
  reading: string;
  speaking?: boolean;
  className?: string;
}) {
  const accents = getPitchAccent(word, reading);
  const [play, replay] = useReplay(speaking);

  if (!accents) return null;
  const active = accents[0];
  const moraCount = splitMorae(reading).length;
  const { morae: pitches, particle } = pitchPattern(moraCount, active.n);
  const type = ACCENT_TYPE_LABEL[accentType(moraCount, active.n)];

  return (
    <div
      className={`pa ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        replay();
      }}
      title="Pitch accent — tap to replay"
      style={{ "--pa-ms": `${MS_PER_MORA}ms` } as CSSProperties}
    >
      <div key={`${word}-${active.n}-${play}`} className={`pa-figures${play > 0 ? " pa-play" : ""}`}>
        <PitchFigure kana={reading} n={active.n} particles="が" sample />
      </div>
      <span className="pa-sr">
        {`Pitch accent ${active.n}, ${type.en}: ${pitches.join(" ")}, particle ${particle}`}
      </span>
    </div>
  );
}

/**
 * Pitch line for a vocabulary sample phrase: each word with its own accent,
 * the particles after it in the particle colour. Draws itself while the
 * phrase is spoken; tap to replay. Renders nothing without verified data.
 */
export function PhrasePitchLine({
  phrase,
  reading,
  speaking = false,
  className = "",
}: {
  phrase: string;
  reading: string;
  speaking?: boolean;
  className?: string;
}) {
  const segments = getPhrasePitch(phrase, reading);
  const [play, replay] = useReplay(speaking);
  if (!segments) return null;

  let start = 0;
  const figures = segments.map(([kana, n, particles], i) => {
    const at = start;
    start += splitMorae(kana).length + splitMorae(particles).length;
    return <PitchFigure key={i} kana={kana} n={n} particles={particles} start={at} />;
  });
  const summary = segments
    .map(([kana, n, particles]) => {
      const { morae, particle } = pitchPattern(splitMorae(kana).length, n);
      return `${kana} ${morae.join(" ")}${particles ? `, ${particles} ${particle}` : ""}`;
    })
    .join("; ");

  return (
    <div
      className={`pa pa--phrase ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        replay();
      }}
      title="Pitch accent — tap to replay"
      style={{ "--pa-ms": `${MS_PER_MORA}ms` } as CSSProperties}
    >
      <div key={`${phrase}-${play}`} className={`pa-figures${play > 0 ? " pa-play" : ""}`}>
        {figures}
      </div>
      <span className="pa-sr">{`Pitch accent: ${summary}`}</span>
    </div>
  );
}
