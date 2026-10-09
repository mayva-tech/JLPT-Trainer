import { KanjiStrokes } from "./KanjiStrokes";

/**
 * A target word written with the brush, its reading on a line above
 * (instead of per-kanji furigana, which brush glyphs don't line up with).
 * The reading keeps its space when hidden, so nothing moves when it shows.
 */
export function BrushWord({
  word,
  reading,
  showReading = true,
  state,
  runKey,
  delayMs = 0,
  speaking = false,
  className = "",
}: {
  word: string;
  reading: string;
  showReading?: boolean;
  state: "blank" | "draw" | "done";
  runKey: number | string;
  delayMs?: number;
  /** The word is being spoken: ink takes the highlight colour. */
  speaking?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`kbw${speaking ? " kbw--speaking" : ""} ${className}`.trim()}
      lang="ja"
    >
      <span className={showReading ? "kbw-reading" : "kbw-reading kbw-reading--hidden"}>
        {reading.replace(/\s+/g, "")}
      </span>
      <KanjiStrokes
        word={word}
        state={state}
        runKey={runKey}
        delayMs={delayMs}
        className="kbw-strokes"
      />
    </span>
  );
}
