import { useMemo, type ReactNode } from "react";
import type { SpeechHighlight } from "../../services/speechService";
import { phraseChunks, type PhrasePiece } from "./phraseBreaks";

type Range = { start: number; end: number };

const hits = (r: Range | null | undefined, start: number, end: number) => !!r && r.start < end && r.end > start;

/** A plain-text piece cut at the mark's edges, so only the word is marked. */
function textPiece(p: PhrasePiece, cls: string, mark: Range | null | undefined): ReactNode {
  if (!mark || !hits(mark, p.start, p.end)) {
    return (
      <span key={p.start} className={cls}>
        {p.text}
      </span>
    );
  }
  const cuts = [p.start, Math.max(p.start, mark.start), Math.min(p.end, mark.end), p.end];
  return (
    <span key={p.start} className={cls}>
      {[0, 1, 2].map((i) => {
        const a = cuts[i]!;
        const b = cuts[i + 1]!;
        if (b <= a) return null;
        const t = p.text.slice(a - p.start, b - p.start);
        return i === 1 ? (
          <mark key={i} className="sh-mark">
            {t}
          </mark>
        ) : (
          t
        );
      })}
    </span>
  );
}

/**
 * The Short's example sentence: furigana over kanji, karaoke highlight from
 * the voice, and line breaks only between phrases. `mark` underlines the
 * taught word (the chat message), `furigana={false}` shows it the way a
 * real text message would.
 */
export function ShortSentence({
  surface,
  reading,
  highlight,
  mark,
  furigana = true,
  className = "sh-sentence-ja",
}: {
  surface: string;
  reading: string;
  highlight: SpeechHighlight | null;
  mark?: Range | null;
  furigana?: boolean;
  className?: string;
}) {
  const phrases = useMemo(() => phraseChunks(surface, reading), [surface, reading]);
  return (
    <div className={className} lang="ja">
      {phrases.map((pieces, pi) => (
        <span key={pi} className="sh-phrase">
          {pieces.map((p) => {
            const active = hits(highlight, p.start, p.end);
            const cls = active ? "sh-piece speech-active" : "sh-piece";
            if (p.reading && furigana) {
              const marked = hits(mark, p.start, p.end);
              return (
                <ruby key={p.start} className={marked ? `${cls} sh-mark` : cls}>
                  {p.text}
                  <rt>{p.reading}</rt>
                </ruby>
              );
            }
            return textPiece(p, cls, mark);
          })}
        </span>
      ))}
    </div>
  );
}
