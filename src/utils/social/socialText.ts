import type { JlptLevel } from "../../types/level";

/** YouTube's title limit; titles are fitted to it. */
export const TITLE_MAX = 100;

/** Length in characters as the platforms count them (code points). */
export function charLength(text: string): number {
  return [...text].length;
}

/** First sense only: "to rise; to go up" → "to rise". */
export function firstSense(meaning: string): string {
  const first = meaning.split(/[;；]/)[0] ?? meaning;
  return first.replace(/\s*\([^)]*\)\s*$/, "").trim() || meaning.trim();
}

/** Cut to `max` characters on a word boundary when possible, with "…". */
export function clip(text: string, max: number): string {
  const chars = [...text.trim()];
  if (chars.length <= max) return chars.join("");
  const cut = chars.slice(0, max - 1).join("");
  const space = cut.lastIndexOf(" ");
  return `${space > max * 0.6 ? cut.slice(0, space) : cut}…`;
}

/**
 * First head that fits before `tail` within `max`; otherwise the last head
 * clipped so the tail still fits.
 */
export function fitTitle(heads: readonly string[], tail: string, max = TITLE_MAX): string {
  for (const head of heads) {
    if (head && charLength(head) + charLength(tail) <= max) return head + tail;
  }
  const last = heads.at(-1) ?? "";
  return clip(last, Math.max(8, max - charLength(tail))) + tail;
}

/** Word as written with its reading, unless the word is already kana. */
export function wordWithReading(word: string, reading: string): string {
  const r = reading.replace(/\s+/g, "");
  return r && r !== word ? `${word}（${r}）` : word;
}

/**
 * Who the trainer is for: English speakers learning Japanese, and Japanese
 * speakers learning English from the same bilingual lessons.
 */
export const AUDIENCE_LINE =
  "🌏 For English speakers learning Japanese — and Japanese speakers learning English. 英語の勉強にもどうぞ！";

/** Compact form for short-form captions. */
export const AUDIENCE_LINE_SHORT = "🌏 Learn Japanese in English · 英語学習にも";

export const AUDIENCE_KEYWORDS = ["learn Japanese in English", "Japanese for English speakers", "英語学習"];

/** Tags for the Japanese-speaking English learners. */
const AUDIENCE_TAGS = ["#learnenglish", "#英語学習"];

export type HashtagKind = "vocabulary" | "grammar" | "vocabulary-quiz" | "grammar-quiz" | "register" | "topic";

/**
 * One fixed, content-based hashtag set (no random rotation, no spam):
 * core tags, the level, the content tags, the English-learner tags, then
 * #shorts for short-form. The first three show above YouTube titles.
 */
export function buildHashtags({
  level,
  kind,
  shortForm = false,
}: {
  level?: JlptLevel;
  kind: HashtagKind;
  shortForm?: boolean;
}): string[] {
  const tags = ["#learnjapanese", "#japanese", "#jlpt"];
  if (level) tags.push(`#jlpt${level.toLowerCase()}`);
  if (kind === "vocabulary") {
    tags.push("#japanesevocabulary");
    if (!shortForm) tags.push("#japanesewords");
  } else if (kind === "grammar") {
    tags.push("#japanesegrammar");
  } else if (kind === "vocabulary-quiz") {
    tags.push("#jlptquiz", "#japanesevocabulary");
  } else if (kind === "grammar-quiz") {
    tags.push("#jlptquiz", "#japanesegrammar");
  } else if (kind === "register") {
    tags.push("#keigo", "#politejapanese");
    if (!shortForm) tags.push("#businessjapanese");
  }
  tags.push("#nihongo", ...AUDIENCE_TAGS);
  if (shortForm) tags.push("#shorts");
  return tags;
}

/** YouTube's limit for the whole Tags field. */
export const TAGS_MAX = 500;

/**
 * YouTube Tags field: comma-separated, deduplicated case-insensitively,
 * dropping later tags once the field would pass TAGS_MAX.
 */
export function formatTags(keywords: readonly string[], max = TAGS_MAX): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of keywords) {
    // YouTube rejects < > in tags.
    const tag = raw.replace(/[<>,]/g, " ").replace(/\s+/g, " ").trim();
    const key = tag.toLowerCase();
    if (!tag || seen.has(key)) continue;
    if (charLength([...out, tag].join(", ")) > max) break;
    seen.add(key);
    out.push(tag);
  }
  return out.join(", ");
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return legacyCopy(text);
  }
}

/** Embedded browsers without clipboard permission still allow execCommand. */
function legacyCopy(text: string): boolean {
  if (typeof document === "undefined") return false;
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  const active = document.activeElement as HTMLElement | null;
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  active?.focus?.();
  return ok;
}
