import { Fragment, type ReactNode } from "react";
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
  /**
   * Japanese inside the text wraps only between word groups (pair with CSS
   * `word-break: keep-all`), never mid-word like 在庫切|れ.
   */
  jpWordBreaks?: boolean;
};

/**
 * Break opportunities inside a Japanese run: after 、。 and where hiragana
 * gives way to kanji/katakana (品切れの|商品) — usually a particle or
 * okurigana ending one word and the next word starting.
 */
const JP_BREAK_RE = /(?<=[、。，．！？])(?=.)|(?<=[\u3041-\u309f])(?=[\u4e00-\u9fff\u3400-\u4dbf\u30a0-\u30ff々])/u;

function withJapaneseBreaks(text: string): ReactNode {
  const pieces = text.split(JP_BREAK_RE);
  if (pieces.length < 2) return text;
  return pieces.map((piece, i) => (
    <Fragment key={i}>
      {i > 0 ? <wbr /> : null}
      {piece}
    </Fragment>
  ));
}

/** English text with per-word speech highlight (spaces preserved between words). */
export function HighlightedEnglish({
  text,
  className,
  highlight,
  inline = false,
  jpWordBreaks = false,
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
              {jpWordBreaks && !isSpace ? withJapaneseBreaks(part.text) : part.text}
            </span>
          );
        })}
      </span>
    </Wrapper>
  );
}
