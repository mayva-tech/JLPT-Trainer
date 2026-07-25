import type { Lesson } from "../types/lesson";
import type { VocabularyItem } from "../types/vocabulary";
import type { GrammarItem } from "../types/grammar";
import type {
  QuizSourceItem,
  VocabularyQuizChoiceKind,
  VocabularyQuizQuestion,
  VocabularyQuizQuestionType,
} from "../types/vocabularyQuiz";
import { getVocabularyByIds } from "../data/vocabulary";

export type VocabularyQuizLevel = "N1" | "N2";

const FULL_TYPE_ORDER: VocabularyQuizQuestionType[] = Array.from(
  { length: 10 },
  () => "japanese-to-english" as const
);

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

/** Deterministic shuffle — stable for recording sessions. */
export function seededShuffle<T>(items: T[], seed: string): T[] {
  const arr = [...items];
  let state = hashString(seed) || 1;
  for (let i = arr.length - 1; i > 0; i--) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const j = state % (i + 1);
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

function normalizeChoice(text: string): string {
  return text.trim().toLowerCase();
}

function uniqueChoices(choices: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const choice of choices) {
    const key = normalizeChoice(choice);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(choice);
  }
  return out;
}

export function getVocabularyItemsForQuiz(options: {
  lesson: Lesson;
  quizLevel: VocabularyQuizLevel;
}): VocabularyItem[] {
  const items = getVocabularyByIds(options.lesson.vocabularyIds);
  if (options.quizLevel === "N1") {
    return items.filter((item) => item.jlpt === "N1");
  }
  return items.filter((item) => item.jlpt === "N2");
}

export function assignQuestionTypes(
  count: number
): VocabularyQuizQuestionType[] {
  if (count <= 0) return [];
  return FULL_TYPE_ORDER.slice(0, count);
}

function pickDistractors(
  pool: QuizSourceItem[],
  target: QuizSourceItem,
  kind: VocabularyQuizChoiceKind,
  count: number,
  seed: string
): string[] {
  const candidates = pool
    .filter((item) => item.id !== target.id)
    .map((item) => (kind === "english" ? item.meaning : item.word));

  const shuffled = seededShuffle(
    candidates,
    `${seed}:distractors:${target.id}`
  );
  const picked: string[] = [];
  const seen = new Set<string>([
    normalizeChoice(kind === "english" ? target.meaning : target.word),
  ]);

  for (const candidate of shuffled) {
    const key = normalizeChoice(candidate);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    picked.push(candidate);
    if (picked.length >= count) break;
  }

  while (picked.length < count) {
    picked.push(kind === "english" ? "—" : "？");
  }

  return picked;
}

function buildChoices(
  target: QuizSourceItem,
  pool: QuizSourceItem[],
  kind: VocabularyQuizChoiceKind,
  seed: string,
  choiceCount = 2
): { choices: string[]; correctChoiceIndex: number } {
  const correct = kind === "english" ? target.meaning : target.word;
  const distractorCount = Math.max(0, choiceCount - 1);
  const distractors = pickDistractors(
    pool,
    target,
    kind,
    distractorCount,
    seed
  );
  const choices = seededShuffle(
    uniqueChoices([correct, ...distractors]).slice(0, choiceCount),
    `${seed}:choices:${target.id}:${kind}`
  );

  while (choices.length < choiceCount) {
    choices.push(kind === "english" ? "—" : "？");
  }

  const finalChoices = uniqueChoices(choices).slice(0, choiceCount);
  while (finalChoices.length < choiceCount) {
    finalChoices.push(kind === "english" ? "—" : "？");
  }

  const correctChoiceIndex = finalChoices.findIndex(
    (choice) => normalizeChoice(choice) === normalizeChoice(correct)
  );

  return {
    choices: finalChoices,
    correctChoiceIndex: correctChoiceIndex >= 0 ? correctChoiceIndex : 0,
  };
}

function buildQuestion(
  item: VocabularyItem,
  pool: VocabularyItem[],
  seed: string
): VocabularyQuizQuestion {
  const built = buildChoices(item, pool, "english", seed);
  return {
    type: "japanese-to-english",
    item,
    promptText: item.word,
    choices: built.choices,
    correctChoiceIndex: built.correctChoiceIndex,
    choiceKind: "english",
  };
}

/**
 * Build a deterministic Japanese→English vocabulary quiz for one lesson.
 * One question per available quiz item (after N1/N2 filtering).
 */
export function buildVocabularyQuizQuestions(
  items: VocabularyItem[],
  quizId: string
): VocabularyQuizQuestion[] {
  if (items.length === 0) return [];

  const orderedItems = seededShuffle(items, `${quizId}:items`);
  return orderedItems.map((item, index) =>
    buildQuestion(item, orderedItems, `${quizId}:q${index}`)
  );
}

/** Map a grammar item onto the shared quiz source shape. */
export function grammarToQuizSource(item: GrammarItem): QuizSourceItem {
  return {
    id: item.id,
    word: item.pattern,
    reading: item.patternReading,
    meaning: item.meaning,
    sentence: item.sentence,
    sentenceReading: item.sentenceReading,
    sentenceMeaning: item.sentenceMeaning,
    jlpt: item.jlpt,
  };
}

/**
 * Grammar quizzes use japanese-to-english with 2 choices (historical layout).
 * Choices are embedded so the runner has a single choices owner.
 */
export function buildGrammarQuizQuestions(
  items: GrammarItem[],
  quizId: string
): VocabularyQuizQuestion[] {
  if (items.length === 0) return [];

  const sources = items.map(grammarToQuizSource);
  const ordered = seededShuffle(sources, `${quizId}:items`);

  return ordered.map((item, index) => {
    const built = buildChoices(
      item,
      ordered,
      "english",
      `${quizId}:q${index}`,
      2
    );
    return {
      type: "japanese-to-english" as const,
      item,
      promptText: item.word,
      choices: built.choices,
      correctChoiceIndex: built.correctChoiceIndex,
      choiceKind: "english" as const,
    };
  });
}

/** Read embedded choices from a question (single owner). */
export function getQuestionChoices(question: VocabularyQuizQuestion): {
  choices: string[];
  correctChoiceIndex: number;
} {
  return {
    choices: question.choices,
    correctChoiceIndex: question.correctChoiceIndex,
  };
}
