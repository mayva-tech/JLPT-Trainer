import type { VocabularyItem } from "../../types/vocabulary";
import { vocabulary } from "../../data/vocabulary";

/**
 * "Nanami texted you" — the message hook for Shorts.
 *
 * Every other vocab Short opens on a word on a background, so the feed has
 * already trained viewers to swipe past that frame. This one opens on
 * something every viewer stops for: a text from a friend. Frame 0 is a chat
 * (an original design, no messaging-app branding) with the word's example
 * sentence as the message and the word marked in it, plus two quick-reply
 * chips — A and B, the real meaning and a decoy. A ding and a buzz land on
 * the first beat; the question is on screen before a word is said, and
 * "what does she mean?" turns the Short into a reply the viewer owes.
 *
 * The answer arrives after the stroke-order draw ("It's A!"), the Short
 * teaches the word as usual, the shadowing beat becomes "reply back", and
 * the outro asks "Did you pick A or B?" — a comment anyone can leave.
 *
 * Pure data, stable per word, so a re-take says the same thing as the
 * upload text.
 */

export type HookStyle = "classic" | "message" | "mix";

export const HOOK_STYLES: readonly { id: HookStyle; label: string; hint: string }[] = [
  { id: "classic", label: "Classic", hint: "Can you read this? / reading trap / twin / kanji math" },
  { id: "message", label: "Text message", hint: "Nanami texted you — A or B?" },
  { id: "mix", label: "Mix", hint: "Alternate by word, to compare retention per hook type" },
];

export const SENDER = { en: "Nanami", ja: "七海", initial: "七" } as const;

export const MESSAGE_HOOK_LABEL = "Nanami texted you";

const OPENERS: readonly string[] = [
  "Nanami just texted you.",
  "New message from Nanami.",
  "Nanami sent you this.",
  "You've got a text from Nanami.",
];

const ASKS: readonly string[] = [
  "What does the highlighted word mean? A, or B?",
  "The highlighted word. Is it A, or B?",
  "Quick! What does the highlighted word mean? A, or B?",
];

/** The question on screen, naming the word (dictionary form): What does 「甥」 mean? */
export const ASK_SHOWN = { before: "What does ", after: " mean?" } as const;
export const REPLY_BANNER = "🎤 Reply back — say it!";
export const BAIT_SHOWN = "Did you pick A or B? Comment below!";
export const BAIT_SPOKEN = "Did you pick A or B? Tell me in the comments!";

export type Letter = "A" | "B";
export const LETTERS: readonly [Letter, Letter] = ["A", "B"];

export interface MessageHook {
  /** The taught word (dictionary form), named in the on-screen question. */
  word: string;
  /** Andrew, before the message. */
  opener: string;
  /** Andrew, after Nanami reads it. */
  ask: string;
  /** The message: the word's example sentence. */
  text: string;
  reading: string;
  /** The word inside the message (UTF-16 offsets into `text`). */
  mark: { start: number; end: number };
  /** Quick replies: A and B (first senses). */
  choices: readonly [string, string];
  /** Index of the real meaning in `choices`. */
  answer: 0 | 1;
  /** "It's A!" — Andrew, right after the word is revealed. */
  answerSpoken: string;
}

function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** First sense only: "to rise; to go up" → "to rise". */
function firstSense(meaning: string): string {
  const first = meaning.split(/[;；]/)[0] ?? meaning;
  return first.replace(/\s*\([^)]*\)\s*$/, "").trim() || meaning.trim();
}

/**
 * Where the word sits in its sentence: the whole word, else the longest
 * leading part of it that occurs (食べる → 食べ in 食べました). Kana-only
 * stems need two characters, so する never marks a stray す.
 */
export function findMark(word: string, sentence: string): { start: number; end: number } | null {
  if (!word || !sentence) return null;
  const chars = [...word];
  for (let n = chars.length; n >= 1; n--) {
    const part = chars.slice(0, n).join("");
    if (n < 2 && !/[一-龯々]/u.test(part)) break;
    // A one-character stem is only safe when it is a kanji the word starts with
    // and the word is longer than it (見る → 見 in 見ました).
    if (n === 1 && chars.length > 2) break;
    const at = sentence.indexOf(part);
    if (at >= 0) {
      // Stretch over okurigana the sentence shares with the word.
      let end = at + part.length;
      const rest = word.slice(part.length);
      let k = 0;
      while (k < rest.length && sentence[end] === rest[k]) {
        end++;
        k++;
      }
      return { start: at, end };
    }
  }
  return null;
}

const STOP = new Set(["to", "the", "a", "an", "be", "of", "in", "on", "at", "for", "and", "or", "one", "one's", "something", "someone", "with", "as", "up", "out", "off", "very", "get", "make", "do"]);

function tokens(sense: string): Set<string> {
  return new Set(
    sense
      .toLowerCase()
      .replace(/[^a-z' ]/g, " ")
      .split(/\s+/)
      .map((w) => w.replace(/(ing|ed|es|s)$/, ""))
      .filter((w) => w.length > 2 && !STOP.has(w))
  );
}

/**
 * Meaning families where any member would also fit the message
 * ("a boy was born to my brother" for 甥 "nephew"): a decoy never comes from
 * the real meaning's family, so the context always decides.
 */
/** "this / that / here": never a decoy (too easy to rule out), nor next to one. */
const POINTING = /\b(here|there|this|that|these|those|where|which|what|who|somewhere|anywhere|everywhere)\b/i;

const FAMILIES: readonly RegExp[] = [
  /\b(person|people|man|men|woman|women|boy|girl|child|children|kid|baby|son|daughter|nephew|niece|father|mother|parent|dad|mom|brother|sister|sibling|uncle|aunt|cousin|grand\w*|wife|husband|spouse|friend|relative|family|adult|elderly|youth|teenager|guest|customer|boss|colleague|neighbo\w*)\b/i,
  /\b(day|days|week|month|year|morning|noon|afternoon|evening|night|today|tomorrow|yesterday|hour|minute|season|spring|summer|autumn|fall|winter|time|period|recently|soon|later|before|after|always|often|sometimes|never)\b/i,
  /\b(red|blue|green|yellow|white|black|color|colour)\b/i,
  /\b(one|two|three|four|five|six|seven|eight|nine|ten|hundred|thousand|number|amount|many|few|several|all|half)\b/i,
  /\b(happy|sad|angry|glad|lonely|afraid|scared|worried|anxious|surprised|tired|fun|enjoyable|pleasant|painful|nervous|embarrassed|disappointed|feeling|emotion)\b/i,
  /\b(big|large|small|little|tall|short|long|wide|narrow|heavy|light|high|low|deep|shallow|thick|thin)\b/i,
  /\b(good|bad|nice|great|terrible|excellent|poor|fine|best|worst|better|worse)\b/i,
  POINTING,
  /\b(however|but|although|though|even|so|yet|still|nevertheless|nonetheless|therefore|then|and|also|besides|moreover|because|anyway|such)\b/i,
  /\b(money|cash|assets?|savings?|price|cost|fee|income|salary|wage|pension|budget|payment|wealth|funds?|property|tax)\b/i,
  /\b(government|system|politics|political|administration|organi[sz]ation|structure|regime|policy|state|authority|institution)\b/i,
  /\b(eat|drink|meal|food|breakfast|lunch|dinner|snack|rice|bread|meat|fish|vegetable|fruit)\b/i,
];

const sameFamily = (a: string, b: string) => FAMILIES.some((f) => f.test(a) && f.test(b));

function overlaps(a: string, b: string): boolean {
  const ta = tokens(a);
  for (const t of tokens(b)) if (ta.has(t)) return true;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

const POS_KEY = (t: string) => {
  const s = t.toLowerCase();
  if (s.includes("verb") && !s.includes("suru") && !s.includes("adverb")) return "verb";
  if (s.includes("i-adjective")) return "adj";
  if (s.includes("na-adjective")) return "na";
  if (s.includes("adverb")) return "adverb";
  if (s.includes("expression")) return "expr";
  return "noun";
};

const pools = new Map<string, VocabularyItem[]>();

function poolFor(item: VocabularyItem): VocabularyItem[] {
  const key = `${POS_KEY(item.wordType ?? "")}|${item.jlpt ?? ""}`;
  let pool = pools.get(key);
  if (!pool) {
    pool = vocabulary.filter(
      (v) => POS_KEY(v.wordType ?? "") === POS_KEY(item.wordType ?? "") && (v.jlpt ?? "") === (item.jlpt ?? "")
    );
    if (pool.length < 20) pool = vocabulary.filter((v) => POS_KEY(v.wordType ?? "") === POS_KEY(item.wordType ?? ""));
    pools.set(key, pool);
  }
  return pool;
}

/**
 * The decoy: a first sense of another word of the same part of speech and
 * level (so it is grammatically plausible), from another category and with
 * no word in common with the real meaning, nor from its meaning family
 * (people, time, size, feelings…), so it is never also right in context.
 * English verbs read "to …" in both chips, nouns never do.
 */
export function decoyFor(item: VocabularyItem): string | null {
  const right = firstSense(item.meaning);
  const pool = poolFor(item);
  if (!pool.length) return null;
  const isTo = /^to\s/i.test(right);
  const start = hash(`decoy:${item.id}:${item.word}`) % pool.length;
  for (let i = 0; i < pool.length; i++) {
    const v = pool[(start + i) % pool.length]!;
    if (v.id === item.id || v.word === item.word) continue;
    if (v.subcategory && item.subcategory && v.subcategory === item.subcategory) continue;
    const s = firstSense(v.meaning);
    if (/^to\s/i.test(s) !== isTo) continue;
    if (s.length > 34 || s.length < 3 || POINTING.test(s)) continue;
    if (overlaps(right, s) || overlaps(item.meaning, s) || sameFamily(item.meaning, s)) continue;
    return s;
  }
  return null;
}

/** The message hook for a word, or null when its sentence can't carry one. */
export function messageHook(item: VocabularyItem): MessageHook | null {
  const text = item.sentence?.trim() ? item.sentence : "";
  if (!text || !item.sentenceReading?.trim()) return null;
  const mark = findMark(item.word, text);
  if (!mark) return null;
  const decoy = decoyFor(item);
  if (!decoy) return null;
  const right = firstSense(item.meaning);
  const h = hash(`msg:${item.id}`);
  const answer = (h & 1) as 0 | 1;
  const choices: [string, string] = answer === 0 ? [right, decoy] : [decoy, right];
  return {
    word: item.word,
    opener: OPENERS[h % OPENERS.length]!,
    ask: ASKS[(h >>> 3) % ASKS.length]!,
    text,
    reading: item.sentenceReading,
    mark,
    choices,
    answer,
    answerSpoken: `It's ${LETTERS[answer]}!`,
  };
}

/**
 * Does this word's Short open with the message hook? "mix" alternates by
 * word (even ids), so a lesson uploads both kinds side by side.
 */
export function usesMessage(item: VocabularyItem, style: HookStyle | undefined): boolean {
  if (!style || style === "classic") return false;
  if (style === "mix" && ((Math.trunc(item.id) % 2) + 2) % 2 !== 0) return false;
  return messageHook(item) !== null;
}

/** The message hook when this style uses one for the word. */
export function messageFor(item: VocabularyItem, style: HookStyle | undefined): MessageHook | null {
  return usesMessage(item, style) ? messageHook(item) : null;
}
