import { useMemo } from "react";
import type { SpeechHighlight } from "../../services/speechService";
import { phraseChunks } from "./phraseBreaks";

/**
 * The Short's example sentence: furigana over kanji, karaoke highlight from
 * the voice, and line breaks only between phrases.
 */
export function ShortSentence({
  surface,
  reading,
  highlight,
}: {
  surface: string;
  reading: string;
  highlight: SpeechHighlight | null;
}) {
  const phrases = useMemo(() => phraseChunks(surface, reading), [surface, reading]);
  return (
    <div className="sh-sentence-ja" lang="ja">
      {phrases.map((pieces, pi) => (
        <span key={pi} className="sh-phrase">
          {pieces.map((p) => {
            const active = !!highlight && highlight.start < p.end && highlight.end > p.start;
            const cls = active ? "sh-piece speech-active" : "sh-piece";
            return p.reading ? (
              <ruby key={p.start} className={cls}>
                {p.text}
                <rt>{p.reading}</rt>
              </ruby>
            ) : (
              <span key={p.start} className={cls}>
                {p.text}
              </span>
            );
          })}
        </span>
      ))}
    </div>
  );
}
