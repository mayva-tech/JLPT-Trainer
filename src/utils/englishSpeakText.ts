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
    .replace(/,(?=[^\s])/g, ", ")
    .replace(/,\s*,+/g, ",")
    .replace(/^,\s*/, "")
    .replace(/,\s*$/, "")
    .trim();
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
    appendWaveDashSpeakPause(stripParentheticalNotes(text))
  );
  for (const [word, spoken] of Object.entries(WORD_OVERRIDES)) {
    const re = new RegExp(`\\b${word}\\b`, "gi");
    out = out.replace(re, (match) => applyCase(match, spoken));
  }
  return out;
}
