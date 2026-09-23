import { type ReactNode } from "react";
import { HighlightedEnglish } from "../../components/HighlightedEnglish";
import { HighlightedJapanese } from "../../components/HighlightedJapanese";
import type { SpeechHighlight } from "../../services/speechService";

type TipProps = {
  text: string;
  jaFocus: string | null;
  enFocus: string | null;
  jaHighlight: SpeechHighlight | null;
  enHighlight: SpeechHighlight | null;
};

/**
 * Tip/feedback/choice EN with 「日本語」 + English gloss karaoke while
 * Nanami/Andrew speak. Keeps the full display string visible (no reflow).
 */
export function FeedbackTipText({
  text,
  jaFocus,
  enFocus,
  jaHighlight,
  enHighlight,
}: TipProps) {
  const nodes: ReactNode[] = [];
  const quoteRe = /[「『]([^」』]+)[」』]/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = quoteRe.exec(text)) !== null) {
    if (match.index > cursor) {
      nodes.push(
        <FeedbackMixedChunk
          key={`t-${key++}`}
          text={text.slice(cursor, match.index)}
          jaFocus={jaFocus}
          enFocus={enFocus}
          jaHighlight={jaHighlight}
          enHighlight={enHighlight}
        />
      );
    }
    const open = match[0]![0]!;
    const close = match[0]!.slice(-1)!;
    const ja = match[1] ?? "";
    const focused =
      jaFocus !== null && ja.replace(/\s+/g, "") === jaFocus.replace(/\s+/g, "");
    nodes.push(
      <span key={`q-${key++}`} className="ppq-feedback-ja" lang="ja">
        {open}
        <HighlightedJapanese
          text={ja}
          className="ppq-feedback-ja-inner"
          highlight={focused ? jaHighlight : null}
          inline
        />
        {close}
      </span>
    );
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) {
    nodes.push(
      <FeedbackMixedChunk
        key={`t-${key++}`}
        text={text.slice(cursor)}
        jaFocus={jaFocus}
        enFocus={enFocus}
        jaHighlight={jaHighlight}
        enHighlight={enHighlight}
      />
    );
  }
  return <div className="ppq-feedback-rich">{nodes}</div>;
}

const JA_DISPLAY_RUN_RE =
  /[\u3040-\u309f\u30a0-\u30ff\u31f0-\u31ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9fー〜～]+[ー〜～、。！？]*/gu;

function FeedbackMixedChunk({
  text,
  jaFocus,
  enFocus,
  jaHighlight,
  enHighlight,
}: TipProps) {
  if (!text) return null;
  const parts: ReactNode[] = [];
  let cursor = 0;
  let key = 0;
  JA_DISPLAY_RUN_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = JA_DISPLAY_RUN_RE.exec(text)) !== null) {
    if (match.index > cursor) {
      parts.push(
        <FeedbackPlain
          key={`e-${key++}`}
          text={text.slice(cursor, match.index)}
          enFocus={enFocus}
          enHighlight={enHighlight}
        />
      );
    }
    const ja = match[0] ?? "";
    const focused =
      jaFocus !== null && ja.replace(/\s+/g, "") === jaFocus.replace(/\s+/g, "");
    parts.push(
      <span key={`j-${key++}`} className="ppq-feedback-ja" lang="ja">
        <HighlightedJapanese
          text={ja}
          className="ppq-feedback-ja-inner"
          highlight={focused ? jaHighlight : null}
          inline
        />
      </span>
    );
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) {
    parts.push(
      <FeedbackPlain
        key={`e-${key++}`}
        text={text.slice(cursor)}
        enFocus={enFocus}
        enHighlight={enHighlight}
      />
    );
  }
  return <>{parts}</>;
}

function FeedbackPlain({
  text,
  enFocus,
  enHighlight,
}: {
  text: string;
  enFocus: string | null;
  enHighlight: SpeechHighlight | null;
}) {
  if (!text) return null;
  const parts = text.split("\n");
  const focusLines = enFocus
    ? enFocus
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
    : [];
  return (
    <>
      {parts.map((part, i) => {
        const trimmed = part.trim();
        let focusLine: string | null = null;
        let focusOffset = -1;
        if (enFocus && enHighlight && trimmed) {
          for (const fl of focusLines) {
            if (trimmed === fl) {
              const idx = enFocus.indexOf(fl);
              if (idx >= 0) {
                focusLine = fl;
                focusOffset = idx;
                break;
              }
            }
          }
          if (!focusLine) {
            for (const fl of focusLines) {
              const at = part.indexOf(fl);
              if (at >= 0) {
                focusLine = fl;
                focusOffset = enFocus.indexOf(fl);
                break;
              }
            }
          }
          if (!focusLine && (trimmed === enFocus || part.includes(enFocus))) {
            focusLine = enFocus;
            focusOffset = 0;
          }
        }
        const hlInLine =
          focusLine !== null &&
          enHighlight !== null &&
          focusOffset >= 0 &&
          enHighlight.start >= focusOffset &&
          enHighlight.start < focusOffset + focusLine.length;
        const localHighlight =
          hlInLine && enHighlight && focusLine
            ? {
                ...enHighlight,
                start: Math.max(0, enHighlight.start - focusOffset),
                end: Math.min(
                  focusLine.length,
                  Math.max(
                    enHighlight.start - focusOffset + 1,
                    enHighlight.end - focusOffset
                  )
                ),
              }
            : null;

        let highlight: SpeechHighlight | null = null;
        if (localHighlight && focusLine) {
          const at = part.indexOf(focusLine);
          if (at >= 0) {
            highlight = {
              ...localHighlight,
              start: localHighlight.start + at,
              end: localHighlight.end + at,
            };
          } else if (trimmed === focusLine) {
            highlight = localHighlight;
          }
        }

        return (
          <span key={i}>
            <HighlightedEnglish
              text={part}
              className="ppq-feedback-en"
              highlight={highlight}
              inline
            />
            {i < parts.length - 1 ? <br /> : null}
          </span>
        );
      })}
    </>
  );
}

/** Append strings that are not already in the list (order preserved). */
export function appendUnique(prev: string[], items: string[]): string[] {
  let next = prev;
  for (const item of items) {
    const trimmed = item.trim();
    if (!trimmed || next.includes(trimmed)) continue;
    if (next === prev) next = [...prev];
    next.push(trimmed);
  }
  return next;
}
