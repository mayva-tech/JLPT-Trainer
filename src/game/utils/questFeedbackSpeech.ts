export type FeedbackSpeakSegment = {
  language: "ja" | "en";
  text: string;
};

const QUOTE_RE = /「([^」]+)」/g;
const EMOJI_PREFIX_RE = /^[✅❌]\s*/;

/**
 * Split quest feedback / help text into JA + EN speak segments so lines like
 * `「届を出す」 means to submit/file a notification or form.` play Japanese
 * then English (and every other 「…」 gloss in Pera Pera Quest).
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
    const before = cleaned.slice(cursor, match.index);
    pushEnglish(segments, before);
    pushJapanese(segments, match[1] ?? "");
    cursor = match.index + match[0].length;
  }
  pushEnglish(segments, cleaned.slice(cursor));
  return mergeAdjacent(segments);
}

export function hasSpeakableFeedback(raw: string): boolean {
  return parseBilingualSpeakSegments(raw).length > 0;
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
  // Drop leading gloss separators ("= current address", ": …").
  text = text.replace(/^[=:：\-–—·•]+\s*/, "").trim();
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
    // Merge adjacent English only — keep each 「…」 phrase as its own beat.
    if (prev && prev.language === "en" && seg.language === "en") {
      prev.text = `${prev.text} ${seg.text}`.replace(/\s+/g, " ").trim();
    } else {
      out.push({ ...seg });
    }
  }
  return out.filter((s) => s.text.length > 0);
}
