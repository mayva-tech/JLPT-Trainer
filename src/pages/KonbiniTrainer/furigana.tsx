import { Fragment, type ReactElement } from 'react';

const KANJI = '\u4E00-\u9FAF\u3400-\u4DBF\u3005\u3006\u30F6';
const RUBY_RE = new RegExp(`([${KANJI}]+)\\(([^()]+)\\)`, 'g');

interface Segment {
  base: string;
  reading?: string;
}

/** Splits "少々(しょうしょう)お待(ま)ちください" into ruby / plain segments. */
export function parseFurigana(text: string): Segment[] {
  const segments: Segment[] = [];
  let cursor = 0;
  RUBY_RE.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = RUBY_RE.exec(text)) !== null) {
    if (match.index > cursor) {
      segments.push({ base: text.slice(cursor, match.index) });
    }
    segments.push({ base: match[1], reading: match[2] });
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) {
    segments.push({ base: text.slice(cursor) });
  }
  return segments;
}

/**
 * Removes the parenthesised readings, leaving plain Japanese.
 * The speech engine reads kanji correctly on its own; leaving the readings in
 * makes it say each word twice.
 */
export function stripFurigana(text: string): string {
  return text.replace(RUBY_RE, '$1');
}

export function Furigana({ text }: { text: string }): ReactElement {
  return (
    <>
      {parseFurigana(text).map((segment, i) =>
        segment.reading ? (
          <ruby key={i}>
            {segment.base}
            <rp>(</rp>
            <rt>{segment.reading}</rt>
            <rp>)</rp>
          </ruby>
        ) : (
          <Fragment key={i}>{segment.base}</Fragment>
        ),
      )}
    </>
  );
}
