import { getVocabularyLessonIdForQuiz } from "./quizVocabLesson";

export const VOCAB_QUIZ_STATS_KEY = "jlpt-trainer:vocab-quiz-stats:v1";

export type VocabQuizItemStats = {
  itemId: number;
  seenCount: number;
  correctCount: number;
  wrongCount: number;
  lastResult: "correct" | "incorrect";
  lastReviewedAt: number;
};

export type VocabQuizStatsFile = {
  version: 1;
  items: Record<string, VocabQuizItemStats>;
};

export type VocabQuizStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export function emptyVocabQuizStats(): VocabQuizStatsFile {
  return { version: 1, items: {} };
}

/** Lesson vocab quizzes, N1 vocab quizzes, mixed, final, weak retest. Not grammar. */
export function isVocabularyQuizId(
  quizId: string | null | undefined
): boolean {
  if (!quizId) return false;
  if (
    quizId === "quiz-mixed" ||
    quizId === "quiz-final" ||
    quizId === "quiz-weak-retest"
  ) {
    return true;
  }
  return getVocabularyLessonIdForQuiz(quizId) !== null;
}

function browserStore(): VocabQuizStore | null {
  try {
    const store = globalThis.localStorage;
    if (
      !store ||
      typeof store.getItem !== "function" ||
      typeof store.setItem !== "function"
    ) {
      return null;
    }
    return store;
  } catch {
    return null;
  }
}

function nonNegativeInt(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return null;
  }
  return Math.floor(value);
}

function parseItem(raw: unknown): VocabQuizItemStats | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const itemId = nonNegativeInt(row.itemId);
  const seenCount = nonNegativeInt(row.seenCount);
  const correctCount = nonNegativeInt(row.correctCount);
  const wrongCount = nonNegativeInt(row.wrongCount);
  const lastReviewedAt = nonNegativeInt(row.lastReviewedAt);
  const lastResult = row.lastResult;
  if (
    itemId === null ||
    itemId === 0 ||
    seenCount === null ||
    correctCount === null ||
    wrongCount === null ||
    lastReviewedAt === null
  ) {
    return null;
  }
  if (lastResult !== "correct" && lastResult !== "incorrect") return null;
  return {
    itemId,
    seenCount,
    correctCount,
    wrongCount,
    lastResult,
    lastReviewedAt,
  };
}

export function loadVocabQuizStats(
  store: VocabQuizStore | null = browserStore()
): VocabQuizStatsFile {
  if (!store) return emptyVocabQuizStats();
  try {
    const raw = store.getItem(VOCAB_QUIZ_STATS_KEY);
    if (!raw) return emptyVocabQuizStats();
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return emptyVocabQuizStats();
    const source = (parsed as { items?: unknown }).items;
    const items: Record<string, VocabQuizItemStats> = {};
    if (source && typeof source === "object") {
      for (const value of Object.values(source as Record<string, unknown>)) {
        const item = parseItem(value);
        if (!item) continue;
        items[String(item.itemId)] = item;
      }
    }
    return { version: 1, items };
  } catch {
    return emptyVocabQuizStats();
  }
}

export function saveVocabQuizStats(
  file: VocabQuizStatsFile,
  store: VocabQuizStore | null = browserStore()
): void {
  if (!store) return;
  try {
    store.setItem(
      VOCAB_QUIZ_STATS_KEY,
      JSON.stringify({ version: 1, items: file.items })
    );
  } catch {
    // Private mode or a full quota: stats just won't persist.
  }
}

export function getVocabQuizItemStats(
  itemId: number,
  file: VocabQuizStatsFile = loadVocabQuizStats()
): VocabQuizItemStats | undefined {
  return file.items[String(itemId)];
}

export function isWeakVocabItem(stats: VocabQuizItemStats): boolean {
  return (
    stats.wrongCount > 0 &&
    (stats.lastResult === "incorrect" || stats.wrongCount > stats.correctCount)
  );
}

export function getWeakVocabItemIds(
  file: VocabQuizStatsFile = loadVocabQuizStats()
): number[] {
  return Object.values(file.items)
    .filter(isWeakVocabItem)
    .map((item) => item.itemId)
    .sort((a, b) => a - b);
}

export type VocabQuizSummary = {
  uniqueItemsAttempted: number;
  totalAttempts: number;
  totalCorrect: number;
  totalIncorrect: number;
  /** Whole-percent accuracy, or null when there are no answers. */
  accuracyPercent: number | null;
  weakCount: number;
  nonWeakAttemptedCount: number;
  /** Up to 5 item ids, newest `lastReviewedAt` first; ties by item id asc. */
  recentItemIds: number[];
};

/**
 * Read-only aggregates from stored vocabulary quiz stats.
 * Does not write storage or change weak classification.
 */
export function getVocabQuizSummary(
  file: VocabQuizStatsFile = loadVocabQuizStats()
): VocabQuizSummary {
  const rows = Object.values(file.items);
  let totalAttempts = 0;
  let totalCorrect = 0;
  let totalIncorrect = 0;
  let weakCount = 0;

  for (const row of rows) {
    totalAttempts += row.seenCount;
    totalCorrect += row.correctCount;
    totalIncorrect += row.wrongCount;
    if (isWeakVocabItem(row)) weakCount += 1;
  }

  const answered = totalCorrect + totalIncorrect;
  const uniqueItemsAttempted = rows.length;

  const recentItemIds = [...rows]
    .sort((a, b) => {
      if (b.lastReviewedAt !== a.lastReviewedAt) {
        return b.lastReviewedAt - a.lastReviewedAt;
      }
      return a.itemId - b.itemId;
    })
    .slice(0, 5)
    .map((row) => row.itemId);

  return {
    uniqueItemsAttempted,
    totalAttempts,
    totalCorrect,
    totalIncorrect,
    accuracyPercent:
      answered === 0 ? null : Math.round((totalCorrect / answered) * 100),
    weakCount,
    nonWeakAttemptedCount: uniqueItemsAttempted - weakCount,
    recentItemIds,
  };
}

export function recordVocabQuizAnswer(
  options: {
    itemId: number;
    correct: boolean;
    at?: number;
    quizId?: string | null;
  },
  store: VocabQuizStore | null = browserStore()
): VocabQuizItemStats | null {
  if (options.quizId !== undefined && !isVocabularyQuizId(options.quizId)) {
    return null;
  }

  const at = options.at ?? Date.now();
  const file = loadVocabQuizStats(store);
  const key = String(options.itemId);
  const prev = file.items[key];
  const next: VocabQuizItemStats = {
    itemId: options.itemId,
    seenCount: (prev?.seenCount ?? 0) + 1,
    correctCount: (prev?.correctCount ?? 0) + (options.correct ? 1 : 0),
    wrongCount: (prev?.wrongCount ?? 0) + (options.correct ? 0 : 1),
    lastResult: options.correct ? "correct" : "incorrect",
    lastReviewedAt: at,
  };
  file.items[key] = next;
  saveVocabQuizStats(file, store);
  return next;
}
