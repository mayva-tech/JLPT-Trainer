/**
 * Browser TTS mispronounces some English words (e.g. "fare" → "far").
 * Map to homophone / phonetic spellings the voice reads correctly.
 * Display text and karaoke highlights stay unchanged.
 */
const WORD_OVERRIDES: Readonly<Record<string, string>> = {
  fare: "fair",
  // Isolated "lecture" often comes out clipped / non-native on Edge neural voices.
  lecture: "lekcher",
};

function applyCase(match: string, spoken: string): string {
  if (match === match.toUpperCase()) return spoken.toUpperCase();
  if (match[0] === match[0]!.toUpperCase()) {
    return spoken[0]!.toUpperCase() + spoken.slice(1);
  }
  return spoken;
}

/** Drop register notes like "(formal)" — display keeps them; TTS should not. */
function stripParentheticalNotes(text: string): string {
  return text
    .replace(/\([^)]*\)/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,;:.!?])/g, "$1")
    .replace(/([,;:])\s*([,;:.!?])/g, "$2")
    .trim();
}

function normalizeSpeakCommas(text: string): string {
  return text
    .replace(/\s+,/g, ",")
    // Do not split thousand separators (1,000 → "one, zero zero zero").
    .replace(/(?<!\d),(?=\S)/g, ", ")
    .replace(/,\s*,+/g, ",")
    .replace(/^,\s*/, "")
    .replace(/,\s*$/, "")
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
    appendWaveDashSpeakPause(expandSpokenMoney(stripParentheticalNotes(text)))
  );
  for (const [word, spoken] of Object.entries(WORD_OVERRIDES)) {
    const re = new RegExp(`\\b${word}\\b`, "gi");
    out = out.replace(re, (match) => applyCase(match, spoken));
  }
  return out;
}
