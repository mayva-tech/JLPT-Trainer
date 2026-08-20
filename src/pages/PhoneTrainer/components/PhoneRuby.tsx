import { Fragment, type ReactElement } from "react";

const KANJI_RE = /[\u4E00-\u9FAF\u3400-\u4DBF\u3005\u3006\u30F6]/;

function isKanji(ch: string): boolean {
  return KANJI_RE.test(ch);
}

interface RubySegment {
  base: string;
  reading?: string;
}

/**
 * Align a japanese surface string with its full-kana reading to produce
 * ruby segments. Non-kanji characters are matched 1:1; kanji runs get
 * their reading from the remaining kana up to the next matching anchor.
 */
function alignRuby(japanese: string, reading: string): RubySegment[] {
  const segments: RubySegment[] = [];
  let ji = 0;
  let ri = 0;

  while (ji < japanese.length) {
    if (!isKanji(japanese[ji])) {
      let plain = "";
      while (ji < japanese.length && !isKanji(japanese[ji])) {
        plain += japanese[ji];
        ji++;
        ri++;
      }
      segments.push({ base: plain });
    } else {
      let kanjiRun = "";
      while (ji < japanese.length && isKanji(japanese[ji])) {
        kanjiRun += japanese[ji];
        ji++;
      }

      const nextJpChar = ji < japanese.length ? japanese[ji] : null;

      if (nextJpChar && !isKanji(nextJpChar)) {
        const anchorIdx = reading.indexOf(nextJpChar, ri);
        if (anchorIdx > ri) {
          segments.push({ base: kanjiRun, reading: reading.slice(ri, anchorIdx) });
          ri = anchorIdx;
        } else {
          segments.push({ base: kanjiRun, reading: kanjiRun });
        }
      } else {
        const remainingReading = reading.slice(ri);
        segments.push({ base: kanjiRun, reading: remainingReading });
        ri = reading.length;
      }
    }
  }

  return segments;
}

interface PhoneRubyProps {
  japanese: string;
  reading: string;
}

export function PhoneRuby({ japanese, reading }: PhoneRubyProps): ReactElement {
  if (!reading || japanese === reading) {
    return <>{japanese}</>;
  }

  const segments = alignRuby(japanese, reading);

  return (
    <>
      {segments.map((seg, i) =>
        seg.reading ? (
          <ruby key={i}>
            {seg.base}
            <rp>(</rp>
            <rt>{seg.reading}</rt>
            <rp>)</rp>
          </ruby>
        ) : (
          <Fragment key={i}>{seg.base}</Fragment>
        )
      )}
    </>
  );
}
