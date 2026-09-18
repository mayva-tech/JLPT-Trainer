export type FeedbackSpeakSegment = {
  language: "ja" | "en";
  text: string;
};

const QUOTE_RE = /「([^」]+)」/g;
const EMOJI_PREFIX_RE = /^[✅❌💡]\s*/;

/**
 * Hiragana, katakana, CJK ideographs, halfwidth kana, prolonged sound, and
 * grammar-slot waves. Trailing JP punct sticks with the run.
 */
const JA_RUN_RE =
  /[\u3040-\u309f\u30a0-\u30ff\u31f0-\u31ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9fー〜～]+[ー〜～、。！？]*/gu;

/**
 * Split quest feedback / help text into JA + EN speak segments so lines like
 * `ご用件 = your business / reason for coming.` play Nanami then Andrew
 * (not Andrew mangling the Japanese). Also covers `「届を出す」 means…` glosses.
 */
export function parseBilingualSpeakSegments(
  raw: string
): FeedbackSpeakSegment[] {
  const cleaned = raw
    .split("\n")
    .map((line) => line.replace(EMOJI_PREFIX_RE, "").trim())
    .filter(Boolean)
    .join("\n")
    .trim();
  if (!cleaned) return [];

  const segments: FeedbackSpeakSegment[] = [];
  let cursor = 0;
  QUOTE_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = QUOTE_RE.exec(cleaned)) !== null) {
    pushScriptRuns(segments, cleaned.slice(cursor, match.index));
    pushJapanese(segments, match[1] ?? "");
    cursor = match.index + match[0].length;
  }
  pushScriptRuns(segments, cleaned.slice(cursor));
  return mergeAdjacent(segments);
}

export function hasSpeakableFeedback(raw: string): boolean {
  return parseBilingualSpeakSegments(raw).length > 0;
}

/** Split a non-quoted chunk into Nanami (JA) / Andrew (EN) runs by script. */
function pushScriptRuns(
  segments: FeedbackSpeakSegment[],
  chunk: string
): void {
  if (!chunk) return;
  JA_RUN_RE.lastIndex = 0;
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = JA_RUN_RE.exec(chunk)) !== null) {
    pushEnglish(segments, chunk.slice(cursor, match.index));
    pushJapanese(segments, match[0] ?? "");
    cursor = match.index + match[0].length;
  }
  pushEnglish(segments, chunk.slice(cursor));
}

function pushEnglish(segments: FeedbackSpeakSegment[], chunk: string) {
  const text = normalizeEnglish(chunk);
  if (!text) return;
  segments.push({ language: "en", text });
}

function pushJapanese(segments: FeedbackSpeakSegment[], chunk: string) {
  const text = normalizeJapanese(chunk);
  if (!text) return;
  segments.push({ language: "ja", text });
}

function normalizeEnglish(chunk: string): string {
  let text = chunk.replace(/\s+/g, " ").trim();
  // Drop leading gloss separators after a JA headword ("= current address").
  text = text.replace(/^[=:：≈~～\-–—·•／/]+\s*/u, "").trim();
  // Drop trailing breath/gloss marks before the next JA run ("dropped — 今…").
  // Keep "Better:" style colons.
  text = text.replace(/\s*[≈\-–—·•／/]+$/u, "").trim();
  // Ignore leftover punctuation after a closing 「…」 (e.g. trailing ".").
  if (!/[A-Za-z0-9]/.test(text)) return "";
  return text;
}

function normalizeJapanese(chunk: string): string {
  return chunk.replace(/\s+/g, "").trim();
}

function mergeAdjacent(
  segments: FeedbackSpeakSegment[]
): FeedbackSpeakSegment[] {
  const out: FeedbackSpeakSegment[] = [];
  for (const seg of segments) {
    const prev = out[out.length - 1];
    // Merge adjacent English only — keep each Japanese phrase as its own beat
    // so Nanami gets a clean utterance (not glued into Andrew).
    if (prev && prev.language === "en" && seg.language === "en") {
      prev.text = `${prev.text} ${seg.text}`.replace(/\s+/g, " ").trim();
    } else {
      out.push({ ...seg });
    }
  }
  return out.filter((s) => s.text.length > 0);
}
