import type { SpeechHighlight } from "../services/speechService";

type Props = {
  text: string;
  className: string;
  highlight: SpeechHighlight | null;
};

/** English text with per-word speech highlight (spaces preserved between words). */
export function HighlightedEnglish({ text, className, highlight }: Props) {
  const parts: { text: string; start: number }[] = [];
  const re = /(\s+|\S+)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    parts.push({ text: match[0], start: match.index });
  }

  return (
    <div className={className} lang="en">
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
              {isSpace ? part.text.replace(/ /g, "\u00A0") : part.text}
            </span>
          );
        })}
      </span>
    </div>
  );
}
