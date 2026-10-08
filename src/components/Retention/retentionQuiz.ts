import type { VocabularyItem } from "../../types/vocabulary";

/**
 * "Pause & answer" checkpoints for long-form lesson videos.
 *
 * Every few words the lesson stops for one three-choice question about a
 * word just taught. Everything is derived from the lesson's own words and a
 * stable hash, so the same lesson always produces the same questions — a
 * re-recording matches the first take.
 */

export type CheckKind = "meaning" | "reading";

export interface CheckOption {
  label: "A" | "B" | "C";
  text: string;
  correct: boolean;
}

export interface CheckCard {
  kind: CheckKind;
  /** The word asked about. */
  item: VocabularyItem;
  options: CheckOption[];
  /** 1-based number of this checkpoint in the lesson. */
  number: number;
}

export const CHECK_LABELS = ["A", "B", "C"] as const;
const KANJI = /[㐀-䶿一-鿿々]/u;

/** First sense only: "to rise; to go up" → "to rise". */
export function firstSense(meaning: string): string {
  const first = meaning.split(/[;；]/)[0] ?? meaning;
  return first.replace(/\s*\([^)]*\)\s*$/, "").trim() || meaning.trim();
}

/** Small stable hash (FNV-1a). */
export function stableHash(value: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Deterministic 0..1 generator (mulberry32). */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Indices of the words after which a checkpoint plays.
 * Every `every` words; a short tail (fewer than `minTail` words since the
 * last checkpoint) gets none, so a card never quizzes just one or two words.
 */
export function checkpointIndices(count: number, every = 5, minTail = 3): number[] {
  const out: number[] = [];
  let since = 0;
  for (let i = 0; i < count; i++) {
    since++;
    const last = i === count - 1;
    if (since >= every || (last && since >= minTail)) {
      out.push(i);
      since = 0;
    }
  }
  return out;
}

function answerText(item: VocabularyItem, kind: CheckKind): string {
  return kind === "meaning" ? firstSense(item.meaning) : item.reading.trim();
}

/**
 * One checkpoint question.
 *
 * @param window  words taught since the previous checkpoint (the question
 *                is about one of these)
 * @param pool    words to draw wrong answers from (the whole lesson first,
 *                then `fallback` if the lesson is too small)
 * @param number  1-based checkpoint number — alternates meaning / reading
 */
export function buildCheckCard(
  window: readonly VocabularyItem[],
  pool: readonly VocabularyItem[],
  number: number,
  fallback: readonly VocabularyItem[] = []
): CheckCard | null {
  if (window.length === 0) return null;
  const seed = stableHash(window.map((w) => w.id).join(",") + `#${number}`);
  const rand = seeded(seed);

  const target = window[Math.floor(rand() * window.length)]!;
  // Reading questions only make sense for words written with kanji.
  const kind: CheckKind = number % 2 === 0 && KANJI.test(target.word) ? "reading" : "meaning";
  const answer = answerText(target, kind);

  const wrong: string[] = [];
  const seen = new Set([answer.toLowerCase()]);
  // Wrong answers: lesson words first (shuffled), then the fallback pool.
  const inPool = new Set(pool.map((w) => w.id));
  const lessonFirst = [
    ...shuffle(pool.filter((w) => w.id !== target.id), rand),
    ...shuffle(fallback.filter((w) => w.id !== target.id && !inPool.has(w.id)), rand),
  ];
  for (const c of lessonFirst) {
    const text = answerText(c, kind);
    const key = text.toLowerCase();
    if (!text || seen.has(key)) continue;
    seen.add(key);
    wrong.push(text);
    if (wrong.length === 2) break;
  }
  if (wrong.length < 2) return null;

  const texts = shuffle([answer, ...wrong], rand);
  return {
    kind,
    item: target,
    number,
    options: texts.map((text, i) => ({
      label: CHECK_LABELS[i]!,
      text,
      correct: text === answer,
    })),
  };
}

function shuffle<T>(list: readonly T[], rand: () => number): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** The spoken / on-screen prompt. */
export function checkQuestion(card: CheckCard): string {
  return card.kind === "meaning" ? "What does this word mean?" : "How do you read this word?";
}
