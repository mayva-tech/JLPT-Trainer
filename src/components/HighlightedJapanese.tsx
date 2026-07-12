import type { SpeechHighlight } from "../services/speechService";
import { groupWrapUnits, splitIntoWords } from "../utils/wrapWords";

type Props = {
  text: string;
  className: string;
  highlight: SpeechHighlight | null;
  lang?: string;
};

/** Japanese text with per-character speech highlight; wraps at word boundaries. */
export function HighlightedJapanese({
  text,
  className,
  highlight,
  lang = "ja",
}: Props) {
  const units = groupWrapUnits(splitIntoWords(text, lang));

  return (
    <div className={`jp-wrap ${className}`} lang={lang}>
      <span className="jp-wrap-line">
        {units.map((unit, ui) => {
          const slice = text.slice(unit.start, unit.end);
          const chars = [...slice];
          let cursor = unit.start;
          return (
            <span className="jp-word" key={`${unit.start}-${ui}`}>
              {chars.map((ch, i) => {
                const idx = cursor;
                cursor += ch.length;
                let state = "";
                if (highlight) {
                  if (idx >= highlight.start && idx < highlight.end) {
                    state = "speech-active";
                  } else if (idx < highlight.start) {
                    state = "speech-spoken";
                  }
                }
                return (
                  <span key={`${idx}-${i}`} className={`speech-char ${state}`}>
                    {ch}
                  </span>
                );
              })}
            </span>
          );
        })}
      </span>
    </div>
  );
}
