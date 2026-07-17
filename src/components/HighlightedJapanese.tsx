import type { SpeechHighlight } from "../services/speechService";
import { groupWrapUnits, splitIntoWords } from "../utils/wrapWords";

type Props = {
  text: string;
  className: string;
  highlight: SpeechHighlight | null;
  lang?: string;
};

/** Japanese text with per-word speech highlight (matches TTS word boundaries). */
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
          let state = "";
          if (highlight) {
            if (highlight.start < unit.end && highlight.end > unit.start) {
              state = "speech-active";
            } else if (unit.end <= highlight.start) {
              state = "speech-spoken";
            }
          }
          return (
            <span
              className={`jp-word speech-char ${state}`.trim()}
              key={`${unit.start}-${ui}`}
            >
              {slice}
            </span>
          );
        })}
      </span>
    </div>
  );
}
