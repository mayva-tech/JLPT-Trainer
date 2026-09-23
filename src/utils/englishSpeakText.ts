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
 * One clause from an English `;` / em-dash / sentence split — display range is
 * UTF-16 into the full string (for karaoke); `speak` is what Andrew should say
 * for the clause.
 */
export type EnglishClauseSplit = {
  /** Inclusive start on the display string. */
  start: number;
  /** Exclusive end on the display string (includes trailing `;` / `—` / `.` when present). */
  end: number;
  /** Spoken clause without in-utterance `;`/`—` → `...` (pause is between utterances). */
  speak: string;
};

/** @deprecated alias — Prefer {@link EnglishClauseSplit}. */
export type EnglishSemicolonClause = EnglishClauseSplit;

/** Trailing punct stripped when building a clause's spoken string. */
const ENGLISH_CLAUSE_TRAILING_PUNCT = /[;,.!?—–]+$/u;

/**
 * Collect clause ends: every `;`, em/en dash (`—` / `–`), newline (quest tip
 * title/body), and `.` / `!` / `?` before a new sentence (space + capital /
 * quote). Skips decimals like `1.5`. Dashes/newlines consume trailing spaces
 * so the next clause starts on the next word.
 */
function findEnglishClauseBreakEnds(text: string): number[] {
  const ends = new Set<number>();
  for (const m of text.matchAll(/;/g)) {
    ends.add(m.index + 1);
  }
  // Em/en dash = breath pause (Game Mode EN like "Sorry — I'll…").
  // Include trailing spaces so karaoke ranges do not leave a dangling gap unit.
  for (const m of text.matchAll(/[—–]\s*/g)) {
    ends.add(m.index + m[0].length);
  }
  // Quest tip lines ("✓ Natural\nClear purpose.") — same inter-utterance breath.
  for (const m of text.matchAll(/\n+/g)) {
    ends.add(m.index + m[0].length);
  }
  for (const m of text.matchAll(/(?<!\d)[.!?](?=\s+["'“‘(]*[A-Z0-9])/g)) {
    ends.add(m.index + 1);
  }
  return [...ends].sort((a, b) => a - b);
}

/**
 * Split long EN on `;`, em/en dash, newlines, and sentence endings so each
 * clause is its own utterance. A single fallback karaoke timeline over-dwells
 * on periods/ellipsis and lags Style Trainer warnings / explanations behind
 * Andrew.
 */
export function splitEnglishByClauses(
  text: string
): EnglishClauseSplit[] | null {
  const breakEnds = findEnglishClauseBreakEnds(text);
  if (breakEnds.length === 0) return null;

  const clauses: EnglishClauseSplit[] = [];
  let start = 0;
  for (const end of breakEnds) {
    if (end <= start) continue;
    const raw = text.slice(start, end);
    const speakSource = raw.replace(ENGLISH_CLAUSE_TRAILING_PUNCT, "").trim();
    if (speakSource) {
      clauses.push({
        start,
        end,
        speak: buildEnglishSpeakText(speakSource),
      });
    }
    start = end;
  }
  const rest = text.slice(start);
  if (rest.trim()) {
    const speakSource = rest.replace(ENGLISH_CLAUSE_TRAILING_PUNCT, "").trim();
    clauses.push({
      start,
      end: text.length,
      speak: buildEnglishSpeakText(speakSource || rest.trim()),
    });
  }
  return clauses.length >= 2 ? clauses : null;
}

/** @deprecated Use {@link splitEnglishByClauses}. */
export function splitEnglishBySemicolon(
  text: string
): EnglishClauseSplit[] | null {
  return splitEnglishByClauses(text);
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
    // Em/en dash = same breath pause when kept in a single utterance.
    .replace(/\s*[—–]\s*/g, " ... ")
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
 * "75%" → "seventy five percent" so Andrew and karaoke share the same duration.
 * Bare digits stay unchanged; only the `%` form is expanded.
 */
function expandSpokenPercents(text: string): string {
  return text.replace(/\b(\d{1,3}(?:,\d{3})*|\d+)(\.\d+)?%/g, (_full, intPart: string, fracPart?: string) => {
    return `${numeralToWords(`${intPart}${fracPart ?? ""}`)} percent`;
  });
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

/**
 * "Mt Fuji" / "Mt." — Andrew spells "M-T" unless expanded to "Mount".
 * Display text stays "Mt"; only the spoken string changes.
 */
function expandMountAbbreviation(text: string): string {
  // `\b` between "Mt" and "." so match "Mt" then consume the abbrev period.
  return text.replace(/\bMt\b\.?/gi, (match) =>
    applyCase(match.replace(/\.$/, ""), "mount")
  );
}

/**
 * Clock times for Andrew karaoke.
 * - `22:00` → `10 p.m.` (24h → 12h)
 * - `3:00 p.m.` → `3 p.m.` (drop :00 so he does not say "colon")
 * - bare `9:00` → `9` (same as the hour unit next to `p.m.`)
 * - `9:15` → `9 15` (no colon)
 */
function expandSpokenClockTimes(text: string): string {
  let out = text.replace(
    /\b([01]?\d|2[0-3]):([0-5]\d)\s*(a\.m\.|p\.m\.|am|pm)\b/gi,
    (_full, hs: string, ms: string, merRaw: string) => {
      const h = Number(hs);
      const m = Number(ms);
      const mer = /p/i.test(merRaw) ? "p.m." : "a.m.";
      if (m === 0) return `${h} ${mer}`;
      return `${h} ${String(m).padStart(2, "0")} ${mer}`;
    }
  );
  return out.replace(
    /\b([01]?\d|2[0-3]):([0-5]\d)\b/g,
    (_full, hs: string, ms: string) => {
      const h = Number(hs);
      const m = Number(ms);
      if (h >= 13 || h === 0) {
        const h12 = h % 12 === 0 ? 12 : h % 12;
        const mer = h < 12 ? "a.m." : "p.m.";
        if (m === 0) return `${h12} ${mer}`;
        return `${h12} ${String(m).padStart(2, "0")} ${mer}`;
      }
      if (m === 0) return String(h);
      return `${h} ${String(m).padStart(2, "0")}`;
    }
  );
}

export function buildEnglishSpeakText(text: string): string {
  let out = expandMountAbbreviation(
    appendSlashSpeakPause(
      appendWaveDashSpeakPause(
        expandSpokenPercents(
          expandSpokenMoney(
            expandSpokenClockTimes(
              expandJapaneseInEnglish(rewriteParentheticalNotes(text))
            )
          )
        )
      )
    )
  );
  for (const [word, spoken] of Object.entries(WORD_OVERRIDES)) {
    const re = new RegExp(`\\b${word}\\b`, "gi");
    out = out.replace(re, (match) => applyCase(match, spoken));
  }
  return out;
}
