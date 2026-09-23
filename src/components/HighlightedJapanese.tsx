import type { SpeechHighlight } from "../services/speechService";
import { buildJapaneseHighlightUnits } from "../utils/speechHighlightUnits";

type Props = {
  text: string;
  className: string;
  highlight: SpeechHighlight | null;
  lang?: string;
  /**
   * Inline tip/feedback quotes (「…」). Block `jp-wrap` + flex centering would
   * yank the active word out of the sentence onto its own centered line.
   */
  inline?: boolean;
};

/**
 * Japanese text with per-word speech highlight.
 * Ranges are UTF-16 indices (same as SpeechSynthesisEvent.charIndex / text.slice).
 * Word spans match speech karaoke units (e.g. もと, not も|と).
 */
export function HighlightedJapanese({
  text,
  className,
  highlight,
  inline = false,
}: Props) {
  const units = buildJapaneseHighlightUnits(text);
  const Wrapper = inline ? "span" : "div";

  return (
    <Wrapper
      className={`jp-wrap ${inline ? "jp-wrap--inline" : ""} ${className}`.trim()}
      lang="ja"
    >
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
    </Wrapper>
  );
}
