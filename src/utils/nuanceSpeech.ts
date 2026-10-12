import { findReadingGlosses } from "./readingGloss";

export type NuanceSpeechSegment = {
  lang: "ja" | "en";
  text: string;
};

export type LocatedNuanceSegment = NuanceSpeechSegment & {
  /** Span of the segment in the note (`text` may differ: see `reread`). */
  start: number;
  end: number;
  /**
   * `text` swaps a kanji word written with its reading ("方 かた") for the
   * reading alone, so the voice says it once; offsets inside `text` then no
   * longer line up with the note.
   */
  reread: boolean;
};

const JP_CHAR =
  /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf\u3005\u3006\u30fc]/u;

function isJapaneseChar(ch: string): boolean {
  return JP_CHAR.test(ch);
}

/**
 * Japanese and English runs of a note with where each sits in it. A kanji
 * word followed by its reading is one Japanese run, spoken by the reading.
 */
export function locateNuanceSegments(text: string): LocatedNuanceSegment[] {
  const glosses = findReadingGlosses(text);
  const segments: LocatedNuanceSegment[] = [];
  const push = (lang: "ja" | "en", start: number, end: number, speak?: string) => {
    const slice = text.slice(start, end);
    if (!slice.trim()) return;
    const said = speak ?? slice;
    const reread = speak !== undefined;
    const last = segments[segments.length - 1];
    if (last?.lang === lang) {
      last.text += said;
      last.end = end;
      last.reread ||= reread;
    } else {
      segments.push({ lang, text: said, start, end, reread });
    }
  };

  let index = 0;
  let next = 0;
  while (index < text.length) {
    while (glosses[next] && glosses[next]!.baseStart < index) next += 1;
    const gloss = glosses[next];
    if (gloss && index === gloss.baseStart) {
      push("ja", gloss.baseStart, gloss.end, gloss.reading);
      index = gloss.end;
      next += 1;
      continue;
    }
    const stop = gloss ? gloss.baseStart : text.length;
    const japanese = isJapaneseChar(text[index]!);
    let end = index + 1;
    while (end < stop && isJapaneseChar(text[end]!) === japanese) {
      end += 1;
    }
    push(japanese ? "ja" : "en", index, end);
    index = end;
  }

  return segments;
}

/**
 * Splits a nuance note into alternating Japanese and English runs so each can
 * use the correct TTS voice (Nanami vs English).
 */
export function splitNuanceForSpeech(text: string): NuanceSpeechSegment[] {
  return locateNuanceSegments(text).map(({ lang, text: said }) => ({ lang, text: said }));
}
