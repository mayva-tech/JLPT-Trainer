/**
 * Everyday Japanese progress — one localStorage key, the same per-trainer
 * pattern as Konbini (`jlpt-trainer:konbini:v1`) and Trip. It keeps the
 * shared `known` / `practiced` fields of lib/japanese/types `Progress` and
 * adds what a visual vocabulary deck needs: favorites, per-word quiz stats
 * (same shape as the JLPT vocab quiz stats), a short review history and the
 * place to resume.
 *
 * Everything here is pure (state in → state out) so it is easy to test; the
 * hook in useEverydayProgress.ts does the storing.
 */

import type { Progress } from "../../lib/japanese/types";

export const EVERYDAY_PROGRESS_KEY = "jlpt-trainer:everyday:v1";
const HISTORY_LIMIT = 50;

/** Same fields as VocabQuizItemStats (utils/vocabQuizStats), keyed by word id. */
export interface WordStats {
  seenCount: number;
  correctCount: number;
  wrongCount: number;
  lastResult: "correct" | "incorrect";
  lastReviewedAt: number;
}

export type ReviewMode = "picture" | "listen" | "recall" | "review";

export interface ReviewRecord {
  at: number;
  mode: ReviewMode;
  categoryId: string | null;
  total: number;
  correct: number;
}

/** How a card is played: Japanese only, English only, or both in either order. */
export type PlayOrder = "jp" | "en" | "jp-en" | "en-jp";

export interface EverydayPrefs {
  order: PlayOrder;
  /** Explore shows only words that have a picture. */
  picturesOnly: boolean;
  /** Recognition mode: the picture first, the words only on tap. */
  imageOnly: boolean;
}

export const DEFAULT_PREFS: EverydayPrefs = { order: "jp-en", picturesOnly: false, imageOnly: false };

export interface EverydayProgress extends Progress {
  /** Words marked learned (`known`, as in every trainer). */
  known: string[];
  /** Words opened at least once in Explore ("explored"). */
  practiced: string[];
  /** Words the learner saved for review. */
  favorites: string[];
  stats: Record<string, WordStats>;
  /** Newest first. */
  history: ReviewRecord[];
  resume: { categoryId: string; wordId: string } | null;
  prefs: EverydayPrefs;
}

export const EMPTY_PROGRESS: EverydayProgress = {
  known: [],
  practiced: [],
  favorites: [],
  stats: {},
  history: [],
  resume: null,
  prefs: DEFAULT_PREFS,
};

type Store = Pick<Storage, "getItem" | "setItem">;

function browserStore(): Store | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];

function parseStats(value: unknown): Record<string, WordStats> {
  if (!value || typeof value !== "object") return {};
  const out: Record<string, WordStats> = {};
  for (const [id, raw] of Object.entries(value as Record<string, unknown>)) {
    const s = raw as Partial<WordStats> | null;
    if (!s || typeof s.seenCount !== "number") continue;
    out[id] = {
      seenCount: s.seenCount,
      correctCount: Number(s.correctCount) || 0,
      wrongCount: Number(s.wrongCount) || 0,
      lastResult: s.lastResult === "incorrect" ? "incorrect" : "correct",
      lastReviewedAt: Number(s.lastReviewedAt) || 0,
    };
  }
  return out;
}

const ORDERS: readonly PlayOrder[] = ["jp", "en", "jp-en", "en-jp"];

function parsePrefs(value: unknown): EverydayPrefs {
  const v = (value ?? {}) as Partial<EverydayPrefs>;
  return {
    order: ORDERS.includes(v.order as PlayOrder) ? (v.order as PlayOrder) : DEFAULT_PREFS.order,
    picturesOnly: v.picturesOnly === true,
    imageOnly: v.imageOnly === true,
  };
}

/** Never throws: a corrupt or missing entry starts clean instead of breaking the page. */
export function loadEverydayProgress(store: Store | null = browserStore()): EverydayProgress {
  if (!store) return { ...EMPTY_PROGRESS };
  try {
    const raw = store.getItem(EVERYDAY_PROGRESS_KEY);
    if (!raw) return { ...EMPTY_PROGRESS };
    const p = JSON.parse(raw) as Record<string, unknown>;
    const resume = p.resume as EverydayProgress["resume"];
    return {
      known: strings(p.known),
      practiced: strings(p.practiced),
      favorites: strings(p.favorites),
      stats: parseStats(p.stats),
      history: Array.isArray(p.history) ? (p.history as ReviewRecord[]).slice(0, HISTORY_LIMIT) : [],
      resume:
        resume && typeof resume.categoryId === "string" && typeof resume.wordId === "string"
          ? { categoryId: resume.categoryId, wordId: resume.wordId }
          : null,
      prefs: parsePrefs(p.prefs),
    };
  } catch {
    return { ...EMPTY_PROGRESS };
  }
}

export function saveEverydayProgress(progress: EverydayProgress, store: Store | null = browserStore()): void {
  if (!store) return;
  try {
    store.setItem(EVERYDAY_PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Private mode or a full quota: progress just won't persist.
  }
}

const toggleIn = (list: string[], id: string) =>
  list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

export function toggleKnown(p: EverydayProgress, id: string): EverydayProgress {
  return { ...p, known: toggleIn(p.known, id) };
}

export function toggleFavorite(p: EverydayProgress, id: string): EverydayProgress {
  return { ...p, favorites: toggleIn(p.favorites, id) };
}

export function markExplored(p: EverydayProgress, id: string): EverydayProgress {
  return p.practiced.includes(id) ? p : { ...p, practiced: [...p.practiced, id] };
}

export function updatePrefs(p: EverydayProgress, patch: Partial<EverydayPrefs>): EverydayProgress {
  return { ...p, prefs: { ...p.prefs, ...patch } };
}

export function setResume(p: EverydayProgress, categoryId: string, wordId: string): EverydayProgress {
  if (p.resume?.categoryId === categoryId && p.resume.wordId === wordId) return p;
  return { ...p, resume: { categoryId, wordId } };
}

/** One quiz / recall answer. Answering also counts as having explored the word. */
export function recordAnswer(p: EverydayProgress, id: string, correct: boolean, now = Date.now()): EverydayProgress {
  const prev = p.stats[id];
  const next: WordStats = {
    seenCount: (prev?.seenCount ?? 0) + 1,
    correctCount: (prev?.correctCount ?? 0) + (correct ? 1 : 0),
    wrongCount: (prev?.wrongCount ?? 0) + (correct ? 0 : 1),
    lastResult: correct ? "correct" : "incorrect",
    lastReviewedAt: now,
  };
  return markExplored({ ...p, stats: { ...p.stats, [id]: next } }, id);
}

export function recordSession(p: EverydayProgress, record: Omit<ReviewRecord, "at">, now = Date.now()): EverydayProgress {
  if (record.total <= 0) return p;
  return { ...p, history: [{ ...record, at: now }, ...p.history].slice(0, HISTORY_LIMIT) };
}

/**
 * Weak-word rule — identical to `isWeakVocabItem` in utils/vocabQuizStats
 * (missed at least once, and either missed last time or missed more often
 * than not). Mirrored rather than imported so this trainer's chunk doesn't
 * pull in the JLPT course data; everydayProgress.test.ts checks the two agree.
 */
export function isWeakStats(s: WordStats | undefined): boolean {
  if (!s) return false;
  return s.wrongCount > 0 && (s.lastResult === "incorrect" || s.wrongCount > s.correctCount);
}

export function weakWordIds(p: EverydayProgress): string[] {
  return Object.entries(p.stats)
    .filter(([, s]) => isWeakStats(s))
    .map(([id]) => id);
}

export function quizAccuracy(p: EverydayProgress): { answered: number; correct: number } {
  let answered = 0;
  let correct = 0;
  for (const s of Object.values(p.stats)) {
    answered += s.seenCount;
    correct += s.correctCount;
  }
  return { answered, correct };
}

/**
 * Words for Quick Review, most useful first: weak words, then saved ones,
 * then explored-but-not-learned, then learned words not seen for longest.
 * Only words the learner has already met — Quick Review never teaches new ones.
 */
export function reviewCandidates(p: EverydayProgress, knownIds: ReadonlySet<string>): string[] {
  const met = new Set([...p.practiced, ...p.known, ...p.favorites, ...Object.keys(p.stats)]);
  const ids = [...met].filter((id) => knownIds.has(id));
  const rank = (id: string) => {
    if (isWeakStats(p.stats[id])) return 0;
    if (p.favorites.includes(id)) return 1;
    if (!p.known.includes(id)) return 2;
    return 3;
  };
  return ids.sort((a, b) => {
    const r = rank(a) - rank(b);
    if (r !== 0) return r;
    return (p.stats[a]?.lastReviewedAt ?? 0) - (p.stats[b]?.lastReviewedAt ?? 0);
  });
}
