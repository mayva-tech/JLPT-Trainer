import type { SpeechHighlight } from "../services/speechService";

type Props = {
  text: string;
  className: string;
  highlight: SpeechHighlight | null;
  /**
   * Inline tip/gloss spans. Block `div` would yank the English gloss onto its
   * own line during karaoke, then jump back when TTS ends.
   */
  inline?: boolean;
};

/** English text with per-word speech highlight (spaces preserved between words). */
export function HighlightedEnglish({
  text,
  className,
  highlight,
  inline = false,
}: Props) {
  const parts: { text: string; start: number }[] = [];
  const re = /(\s+|\S+)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    parts.push({ text: match[0], start: match.index });
  }

  const Wrapper = inline ? "span" : "div";

  return (
    <Wrapper className={className} lang="en">
      <span className="speech-line speech-line--en">
        {parts.map((part, i) => {
          const start = part.start;
          const end = start + part.text.length;
          const isSpace = /^\s+$/.test(part.text);

          let state = "";
          if (highlight && !isSpace) {
            if (highlight.start < end && highlight.end > start) {
              state = "speech-active";
            } else if (end <= highlight.start) {
              state = "speech-spoken";
            }
          }

          return (
            <span
              key={i}
              className={`speech-char ${isSpace ? "speech-space" : ""} ${state}`.trim()}
            >
              {/* Keep real spaces so lines wrap per word (not mid-word). */}
              {part.text}
            </span>
          );
        })}
      </span>
    </Wrapper>
  );
}
