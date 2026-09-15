/**
 * Browser TTS mispronounces some English words (e.g. "fare" → "far").
 * Map to homophone / phonetic spellings the voice reads correctly.
 * Display text and karaoke highlights stay unchanged.
 */
const WORD_OVERRIDES: Readonly<Record<string, string>> = {
  fare: "fair",
  // Isolated "lecture" often comes out clipped / non-native on Edge neural voices.
  lecture: "lekcher",
  // Verb /lɪv/, not adjective /laɪv/ ("live TV").
  live: "liv",
  // /daɪ/, not "dee".
  die: "dai",
  // /streɪndʒ/ as one word — "straynj" is spelled out by neural voices.
  strange: "straynge",
  // Isolated "odd" often comes out as "ode".
  odd: "awd",
};

function applyCase(match: string, spoken: string): string {
  if (match === match.toUpperCase()) return spoken.toUpperCase();
  if (match[0] === match[0]!.toUpperCase()) {
    return spoken[0]!.toUpperCase() + spoken.slice(1);
  }
  return spoken;
}

/**
 * Meta tags TTS should skip (display keeps them). Descriptive gloss asides
 * like "(refined, feminine)" or "(humble)" are spoken so Style Trainer /
 * dictionary nuance stays audible and karaoke-visible.
 */
const SKIP_PAREN_NOTE =
  /^\s*(formal|casual|polite|written|spoken|strong inference|causative|also|note)\s*$/i;

/** True when a `(...)` span is a skipped meta tag, not spoken gloss. */
export function isSkippedParentheticalNote(inner: string): boolean {
  return SKIP_PAREN_NOTE.test(inner);
}

/**
 * Trailing descriptive gloss like `I (soft, casual)` — Andrew ignores an
 * in-utterance period, so `speakEnglish` splits into two utterances with a
 * real pause. Indices are UTF-16 offsets into the display string.
 */
export type EnglishAsideSplit = {
  /** Text before the aside, e.g. `"I"`. */
  head: string;
  /** Inner aside without parentheses, e.g. `"soft, casual"`. */
  aside: string;
  /** Index of `(` on the display string. */
  asideOpen: number;
  /** Index just past `)` on the display string. */
  asideClose: number;
};

/**
 * When `text` ends with a spoken descriptive `(aside)`, return head/aside so
 * TTS can pause between two utterances. Meta tags like `(formal)` are ignored.
 */
export function splitEnglishDescriptiveAside(
  text: string
): EnglishAsideSplit | null {
  const re = /\(([^)]*)\)/g;
  let m: RegExpExecArray | null;
  let lastSpoken: RegExpExecArray | null = null;
  while ((m = re.exec(text)) !== null) {
    const inner = (m[1] ?? "").trim();
    if (!inner || isSkippedParentheticalNote(inner)) continue;
    lastSpoken = m;
  }
  if (!lastSpoken) return null;

  const after = text.slice(lastSpoken.index + lastSpoken[0].length).trim();
  // Only split when the aside closes the phrase (Style Trainer gloss form).
  if (after.length > 0) return null;

  const head = text.slice(0, lastSpoken.index).trimEnd();
  if (!head) return null;

  return {
    head,
    aside: (lastSpoken[1] ?? "").trim(),
    asideOpen: lastSpoken.index,
    asideClose: lastSpoken.index + lastSpoken[0].length,
  };
}

/**
 * One clause from an English `;` split — display range is UTF-16 into the
 * full string (for karaoke); `speak` is what Andrew should say for the clause.
 */
export type EnglishSemicolonClause = {
  /** Inclusive start on the display string. */
  start: number;
  /** Exclusive end on the display string (includes trailing `;` when present). */
  end: number;
  /** Spoken clause without relying on in-utterance `;` → `...`. */
  speak: string;
};

/**
 * Split long EN on `;` so each clause is its own utterance with a real pause.
 * A single fallback karaoke timeline over-dwells on `soft ...` and never
 * reaches later words (e.g. Style Trainer warnings with 私).
 */
export function splitEnglishBySemicolon(
  text: string
): EnglishSemicolonClause[] | null {
  if (!/;/.test(text)) return null;

  const clauses: EnglishSemicolonClause[] = [];
  let start = 0;
  const re = /;/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const end = m.index + 1;
    const raw = text.slice(start, end);
    const speakSource = raw.replace(/;+\s*$/u, "").trim();
    if (speakSource) {
      clauses.push({
        start,
        end,
        // Build without the semicolon so we do not insert `...` — the pause
        // between utterances is the clause break.
        speak: buildEnglishSpeakText(speakSource),
      });
    }
    start = end;
  }
  const rest = text.slice(start);
  if (rest.trim()) {
    clauses.push({
      start,
      end: text.length,
      speak: buildEnglishSpeakText(rest.trim()),
    });
  }
  return clauses.length >= 2 ? clauses : null;
}

/**
 * Japanese pronouns embedded in English gloss/warning lines — Andrew will not
 * read kanji reliably; speak a romaji form so audio + karaoke stay aligned.
 */
const JA_IN_EN: Readonly<Record<string, string>> = {
  私: "watashi",
  僕: "boku",
  俺: "ore",
  あたし: "atashi",
  わたし: "watashi",
};

function expandJapaneseInEnglish(text: string): string {
  let out = text;
  for (const [ja, en] of Object.entries(JA_IN_EN)) {
    if (out.includes(ja)) out = out.split(ja).join(en);
  }
  return out;
}

/** Drop meta notes like "(formal)"; speak descriptive `(nuance)` after a pause. */
function rewriteParentheticalNotes(text: string): string {
  return text
    // Consume the space before "(" so "I (soft" → "I. soft" (sentence break).
    // Prefer `splitEnglishDescriptiveAside` + two utterances when the aside
    // ends the string — Andrew often ignores this period in one utterance.
    .replace(/\s*\(([^)]*)\)/g, (_full, inner: string) => {
      if (isSkippedParentheticalNote(inner)) return "";
      const trimmed = inner.trim();
      // Period = Andrew breathes before the aside; do not rush into "(...)".
      return trimmed ? `. ${trimmed}` : "";
    })
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,;:.!?])/g, "$1")
    .replace(/([,;:])\s*([,;:.!?])/g, "$2")
    .trim();
}

function normalizeSpeakCommas(text: string): string {
  return text
    .replace(/\s+,/g, ",")
    // Semicolon = clause break. Ellipsis makes Andrew pause (comma is too short).
    .replace(/\s*;\s*/g, " ... ")
    // Do not split thousand separators (1,000 → "one, zero zero zero").
    .replace(/(?<!\d),(?=\S)/g, ", ")
    .replace(/,\s*,+/g, ",")
    .replace(/\s*\.{3,}\s*/g, " ... ")
    .replace(/^,\s*/, "")
    .replace(/,\s*$/, "")
    .replace(/^\s*\.{3}\s*/, "")
    .replace(/\s*\.{3}\s*$/, "")
    .trim();
}

const ONES = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
] as const;

const TENS = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
] as const;

function underThousand(n: number): string {
  const parts: string[] = [];
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  if (hundreds > 0) parts.push(`${ONES[hundreds]} hundred`);
  if (rest === 0) return parts.join(" ");
  if (rest < 20) {
    parts.push(ONES[rest]!);
  } else {
    const ten = Math.floor(rest / 10);
    const one = rest % 10;
    parts.push(one > 0 ? `${TENS[ten]}-${ONES[one]}` : TENS[ten]!);
  }
  return parts.join(" ");
}

function integerToWords(n: number): string {
  if (!Number.isFinite(n) || n < 0) return String(n);
  if (n === 0) return "zero";
  const scales: Array<[number, string]> = [
    [1_000_000_000, "billion"],
    [1_000_000, "million"],
    [1_000, "thousand"],
  ];
  const parts: string[] = [];
  let rest = Math.floor(n);
  for (const [value, name] of scales) {
    if (rest >= value) {
      parts.push(`${underThousand(Math.floor(rest / value))} ${name}`);
      rest %= value;
    }
  }
  if (rest > 0) parts.push(underThousand(rest));
  return parts.join(" ");
}

function numeralToWords(raw: string): string {
  const [intRaw, fracRaw] = raw.replace(/,/g, "").split(".");
  const intWords = integerToWords(Number(intRaw));
  if (fracRaw == null || fracRaw === "") return intWords;
  const fracWords = [...fracRaw]
    .map((digit) => ONES[Number(digit)] ?? digit)
    .join(" ");
  return `${intWords} point ${fracWords}`;
}

/**
 * Speak money amounts as words so TTS does not read 1,000 as "one zero zero zero".
 * Grouped thousands (1,000) and any number attached to "yen" are expanded.
 * Display text is unchanged — only the spoken string is rewritten.
 */
function expandSpokenMoney(text: string): string {
  return text.replace(
    /(?:¥\s*)?(\d{1,3}(?:,\d{3})+|\d+)(\.\d+)?(?:\s*-?\s*yen\b)?/gi,
    (full, intPart: string, fracPart: string | undefined) => {
      const grouped = intPart.includes(",");
      const hasYen = /yen/i.test(full);
      if (!grouped && !hasYen) return full;
      const words = numeralToWords(`${intPart}${fracPart ?? ""}`);
      return hasYen ? `${words} yen` : words;
    }
  );
}

/**
 * Grammar slot marker ～ / 〜 / ~ — pause after each before the next slot
 * ("not only ～ but also" → "not only, but also").
 */
function appendWaveDashSpeakPause(text: string): string {
  return normalizeSpeakCommas(text.replace(/\s*[〜～~]\s*/g, ", "));
}

/**
 * Alternates joined by "/" (make/let) — do not say "slash"; insert a longer
 * ellipsis pause so the voice leaves space between the two words.
 */
function appendSlashSpeakPause(text: string): string {
  return text
    .replace(/\s*\/\s*/g, " ... ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s*\.{3,}\s*/g, " ... ")
    .replace(/^\s*\.{3}\s*/, "")
    .replace(/\s*\.{3}\s*$/, "")
    .trim();
}

export function buildEnglishSpeakText(text: string): string {
  let out = appendSlashSpeakPause(
    appendWaveDashSpeakPause(
      expandSpokenMoney(
        expandJapaneseInEnglish(rewriteParentheticalNotes(text))
      )
    )
  );
  for (const [word, spoken] of Object.entries(WORD_OVERRIDES)) {
    const re = new RegExp(`\\b${word}\\b`, "gi");
    out = out.replace(re, (match) => applyCase(match, spoken));
  }
  return out;
}
