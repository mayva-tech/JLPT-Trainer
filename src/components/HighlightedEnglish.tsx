import { Fragment, useMemo, type ReactNode } from "react";
import type { SpeechHighlight } from "../services/speechService";
import { nuanceFurigana } from "../utils/nuanceFurigana";
import type { ReadingGloss } from "../utils/readingGloss";

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
  /**
   * Nuance notes: every kanji gets furigana. A kanji word written with its
   * reading after it ("方 かた", "者（もの）") shows that reading over the
   * kanji instead of beside it.
   */
  readingGlosses?: boolean;
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

/**
 * One word of the line with its glosses applied: the kanji get the reading as
 * furigana and the written-out reading after them is left out.
 */
function withGlosses(
  start: number,
  text: string,
  glosses: readonly ReadingGloss[],
  plain: (piece: string) => ReactNode
): ReactNode {
  const end = start + text.length;
  const out: ReactNode[] = [];
  let at = start;
  for (const g of glosses) {
    if (g.end <= start || g.rubyStart >= end) continue;
    if (g.rubyStart > at) out.push(plain(text.slice(at - start, g.rubyStart - start)));
    if (g.rubyStart >= at && g.rubyEnd <= end) {
      out.push(
        <ruby key={g.rubyStart} className="reading-gloss">
          {text.slice(g.rubyStart - start, g.rubyEnd - start)}
          <rt>{g.ruby}</rt>
        </ruby>
      );
    }
    at = Math.min(end, Math.max(at, g.end));
  }
  if (at < end) out.push(plain(text.slice(at - start)));
  return out.map((node, i) => <Fragment key={i}>{node}</Fragment>);
}

/** English text with per-word speech highlight (spaces preserved between words). */
export function HighlightedEnglish({
  text,
  className,
  highlight,
  inline = false,
  jpWordBreaks = false,
  readingGlosses = false,
}: Props) {
  const glosses = useMemo(() => (readingGlosses ? nuanceFurigana(text) : []), [readingGlosses, text]);
  const parts: { text: string; start: number }[] = [];
  const re = /(\s+|\S+)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const start = match.index;
    const end = start + match[0].length;
    // The reading (and the space before it) now sits above the kanji.
    if (glosses.some((g) => start >= g.rubyEnd && end <= g.end)) continue;
    parts.push({ text: match[0], start });
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
              {isSpace
                ? part.text
                : glosses.length
                  ? withGlosses(start, part.text, glosses, (piece) =>
                      jpWordBreaks ? withJapaneseBreaks(piece) : piece
                    )
                  : jpWordBreaks
                    ? withJapaneseBreaks(part.text)
                    : part.text}
            </span>
          );
        })}
      </span>
    </Wrapper>
  );
}
