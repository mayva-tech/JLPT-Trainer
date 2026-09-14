import type { LanguageStats, LanguageStatKey } from "../types";

export const LANGUAGE_STAT_LABELS: Record<
  LanguageStatKey,
  { japanese: string; english: string }
> = {
  vocabulary: { japanese: "語彙", english: "Vocabulary" },
  grammar: { japanese: "文法", english: "Grammar" },
  listening: { japanese: "聴解", english: "Listening" },
  reading: { japanese: "読解", english: "Reading" },
  conversation: { japanese: "会話", english: "Conversation" },
  politeness: { japanese: "敬語", english: "Politeness" },
};

export const LANGUAGE_STAT_KEYS: LanguageStatKey[] = [
  "vocabulary",
  "grammar",
  "listening",
  "reading",
  "conversation",
  "politeness",
];

export function clampStat(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function emptyLanguageStats(): LanguageStats {
  return {
    vocabulary: 8,
    grammar: 6,
    listening: 5,
    reading: 7,
    conversation: 5,
    politeness: 4,
  };
}

export function mergeLanguageStats(
  base: LanguageStats,
  delta: Partial<LanguageStats>
): LanguageStats {
  const next = { ...base };
  for (const key of LANGUAGE_STAT_KEYS) {
    const add = delta[key];
    if (typeof add === "number" && Number.isFinite(add)) {
      next[key] = clampStat(base[key] + add);
    }
  }
  return next;
}

/** Japanese Power is derived — never store a fake parallel number. */
export function calcJapanesePower(stats: LanguageStats): number {
  const sum = LANGUAGE_STAT_KEYS.reduce((total, key) => total + stats[key], 0);
  return clampStat(sum / LANGUAGE_STAT_KEYS.length);
}

export function strongestLanguageStat(stats: LanguageStats): LanguageStatKey {
  return LANGUAGE_STAT_KEYS.reduce((best, key) =>
    stats[key] > stats[best] ? key : best
  );
}

export function weakestLanguageStat(stats: LanguageStats): LanguageStatKey {
  return LANGUAGE_STAT_KEYS.reduce((worst, key) =>
    stats[key] < stats[worst] ? key : worst
  );
}

function progressListLength(raw: string | null): number {
  if (!raw) return 0;
  try {
    const parsed = JSON.parse(raw) as { known?: unknown; practiced?: unknown };
    const known = Array.isArray(parsed.known) ? parsed.known.length : 0;
    const practiced = Array.isArray(parsed.practiced)
      ? parsed.practiced.length
      : 0;
    return known + practiced;
  } catch {
    return 0;
  }
}

/**
 * Seed language stats conservatively from existing trainer progress.
 * Missing corpora stay near the default floor.
 */
export function seedLanguageStatsFromTrainer(
  store: { getItem(key: string): string | null } | null = null
): LanguageStats {
  const stats = emptyLanguageStats();
  if (!store) return stats;

  try {
    const vocabRaw = store.getItem("jlpt-trainer:vocab-quiz-stats:v1");
    if (vocabRaw) {
      const parsed = JSON.parse(vocabRaw) as {
        items?: Record<string, { correctCount?: number; seenCount?: number }>;
      };
      const items = parsed.items ? Object.values(parsed.items) : [];
      const unique = items.length;
      let correct = 0;
      let seen = 0;
      for (const item of items) {
        correct += typeof item.correctCount === "number" ? item.correctCount : 0;
        seen += typeof item.seenCount === "number" ? item.seenCount : 0;
      }
      const accuracy = seen > 0 ? correct / seen : 0;
      stats.vocabulary = clampStat(
        8 + Math.min(40, unique * 0.8) + accuracy * 20
      );
      stats.reading = clampStat(7 + Math.min(25, unique * 0.4));
    }

    const relations = progressListLength(
      store.getItem("jlpt-trainer:relations:v1")
    );
    if (relations > 0) {
      stats.vocabulary = clampStat(stats.vocabulary + Math.min(12, relations * 0.3));
    }

    const konbini = progressListLength(store.getItem("jlpt-trainer:konbini:v1"));
    const trip = progressListLength(store.getItem("jlpt-trainer:trip:v1"));
    const phone = progressListLength(store.getItem("jlpt-trainer:phone:v1"));

    stats.conversation = clampStat(
      5 + Math.min(25, (konbini + trip + phone) * 0.35)
    );
    stats.politeness = clampStat(4 + Math.min(20, (konbini + trip) * 0.4));
    stats.listening = clampStat(5 + Math.min(22, phone * 0.5));
  } catch {
    return emptyLanguageStats();
  }

  return stats;
}
