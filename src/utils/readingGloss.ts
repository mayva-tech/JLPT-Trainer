/**
 * A kanji word followed by its kana reading inside English prose:
 * "方 かた is polite", "者（もの）", "二人 (ふたり)". Shown as furigana over the
 * kanji and spoken once, by its reading, instead of twice.
 */
export type ReadingGloss = {
  /** Span of the kanji part that gets the furigana. */
  rubyStart: number;
  rubyEnd: number;
  /** Furigana for that span (okurigana and leading kana excluded). */
  ruby: string;
  /** Whole written word, e.g. 引き出し in "引き出し ひきだし". */
  baseStart: number;
  /** End of the gloss: after the reading and any closing bracket. */
  end: number;
  /** Full reading of the word — what the Japanese voice says. */
  reading: string;
};

const JP = "\\p{Script=Han}\\p{Script=Hiragana}\\p{Script=Katakana}ー々〆";
const GLOSS_RE = new RegExp(
  `(?<![${JP}])([${JP}]*[\\p{Script=Han}々〆][${JP}]*)(?:( )|( ?[(（]))([\\p{Script=Hiragana}ー]+)([)）]?)(?![${JP}])`,
  "gu"
);
const KANJI_RE = /[\p{Script=Han}々〆]/u;
const DIGIT_RE = /[0-9０-９]/u;
/** Kana that follow a word as grammar, not as its reading ("人 が" is not 人 read が). */
const NOT_A_READING = new Set([
  "が", "は", "を", "に", "で", "と", "も", "の", "へ", "や", "か", "な", "ね", "よ",
  "だ", "です", "ます", "する", "した", "して", "など", "から", "まで", "より", "って",
]);

/** Readings written right after their kanji, in text order. */
export function findReadingGlosses(text: string): ReadingGloss[] {
  const glosses: ReadingGloss[] = [];
  for (const m of text.matchAll(GLOSS_RE)) {
    const [whole, base, space, open, reading, close] = m;
    if (!base || !reading) continue;
    if (open ? !close : close) continue;
    if (space && NOT_A_READING.has(reading)) continue;

    let lead = 0;
    while (lead < base.length && !KANJI_RE.test(base[lead]!)) lead += 1;
    let trail = base.length;
    while (trail > lead && !KANJI_RE.test(base[trail - 1]!)) trail -= 1;
    const leadKana = base.slice(0, lead);
    const trailKana = base.slice(trail);
    if (!reading.startsWith(leadKana) || !reading.endsWith(trailKana)) continue;
    const ruby = reading.slice(leadKana.length, reading.length - trailKana.length);
    const kanjiCount = [...base.slice(lead, trail)].filter((ch) => KANJI_RE.test(ch)).length;
    if (ruby.length < kanjiCount) continue;

    // A number written before the kanji is part of the reading: 2階(にかい).
    const at = m.index ?? 0;
    let digits = 0;
    while (at - digits > 0 && DIGIT_RE.test(text[at - digits - 1]!)) digits += 1;
    if (digits && lead) continue;
    glosses.push({
      rubyStart: digits ? at - digits : at + lead,
      rubyEnd: at + trail,
      ruby,
      baseStart: at - digits,
      end: at + whole.length,
      reading,
    });
  }
  return glosses;
}
