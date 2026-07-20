import type { Lesson } from "../types/lesson";
import type { VocabularyItem } from "../types/vocabulary";
import type {
  VocabularyQuizChoiceKind,
  VocabularyQuizQuestion,
  VocabularyQuizQuestionType,
} from "../types/vocabularyQuiz";
import { getVocabularyByIds } from "../data/vocabulary";

export type VocabularyQuizLevel = "N1" | "N2";

const FULL_TYPE_ORDER: VocabularyQuizQuestionType[] = [
  "japanese-to-english",
  "japanese-to-english",
  "japanese-to-english",
  "japanese-to-english",
  "english-to-japanese",
  "english-to-japanese",
  "audio-to-english",
  "audio-to-english",
  "phrase-context",
  "sentence-context",
];

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

export function assignQuestionTypes(count: number): VocabularyQuizQuestionType[] {
  if (count <= 0) return [];
  if (count >= FULL_TYPE_ORDER.length) {
    return FULL_TYPE_ORDER.slice(0, count);
  }

  const order: VocabularyQuizQuestionType[] = [];
  for (const type of FULL_TYPE_ORDER) {
    if (order.length >= count) break;
    order.push(type);
  }

  if (!order.includes("japanese-to-english") && count > 0) {
    order[0] = "japanese-to-english";
  }

  return order.slice(0, count);
}

function blankContext(text: string, word: string): string {
  if (!text) return "＿＿＿";
  if (text.includes(word)) {
    return text.replace(word, "＿＿＿");
  }
  return `＿＿＿${text}`;
}

function pickDistractors(
  pool: VocabularyItem[],
  target: VocabularyItem,
  kind: VocabularyQuizChoiceKind,
  count: number,
  seed: string
): string[] {
  const candidates = pool
    .filter((item) => item.id !== target.id)
    .map((item) => (kind === "english" ? item.meaning : item.word));

  const shuffled = seededShuffle(candidates, `${seed}:distractors:${target.id}`);
  const picked: string[] = [];
  const seen = new Set<string>([normalizeChoice(kind === "english" ? target.meaning : target.word)]);

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
  target: VocabularyItem,
  pool: VocabularyItem[],
  kind: VocabularyQuizChoiceKind,
  seed: string
): { choices: string[]; correctChoiceIndex: number } {
  const correct = kind === "english" ? target.meaning : target.word;
  const distractors = pickDistractors(pool, target, kind, 2, seed);
  const choices = seededShuffle(
    uniqueChoices([correct, ...distractors]).slice(0, 3),
    `${seed}:choices:${target.id}:${kind}`
  );

  while (choices.length < 3) {
    choices.push(kind === "english" ? "—" : "？");
  }

  const finalChoices = uniqueChoices(choices).slice(0, 3);
  while (finalChoices.length < 3) {
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
  type: VocabularyQuizQuestionType,
  seed: string
): VocabularyQuizQuestion {
  switch (type) {
    case "english-to-japanese": {
      const built = buildChoices(item, pool, "japanese", seed);
      return {
        type,
        item,
        promptText: item.meaning,
        promptEnglish: item.meaning,
        choices: built.choices,
        correctChoiceIndex: built.correctChoiceIndex,
        choiceKind: "japanese",
      };
    }
    case "audio-to-english": {
      const built = buildChoices(item, pool, "english", seed);
      return {
        type,
        item,
        promptText: "Listen to the word",
        choices: built.choices,
        correctChoiceIndex: built.correctChoiceIndex,
        choiceKind: "english",
        audioPath: item.audioWord,
      };
    }
    case "phrase-context": {
      const built = buildChoices(item, pool, "japanese", seed);
      return {
        type,
        item,
        promptText: blankContext(item.phrase, item.word),
        choices: built.choices,
        correctChoiceIndex: built.correctChoiceIndex,
        choiceKind: "japanese",
        contextSource: item.phrase,
        contextReading: item.phraseReading,
      };
    }
    case "sentence-context": {
      const built = buildChoices(item, pool, "japanese", seed);
      return {
        type,
        item,
        promptText: blankContext(item.sentence, item.word),
        choices: built.choices,
        correctChoiceIndex: built.correctChoiceIndex,
        choiceKind: "japanese",
        contextSource: item.sentence,
        contextReading: item.sentenceReading,
      };
    }
    case "japanese-to-english":
    default: {
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
  }
}

/**
 * Build a deterministic mixed-type vocabulary quiz for one lesson.
 * One question per available quiz item (after N1/N2 filtering).
 */
export function buildVocabularyQuizQuestions(
  items: VocabularyItem[],
  quizId: string
): VocabularyQuizQuestion[] {
  if (items.length === 0) return [];

  const orderedItems = seededShuffle(items, `${quizId}:items`);
  const types = assignQuestionTypes(orderedItems.length);

  return orderedItems.map((item, index) =>
    buildQuestion(item, orderedItems, types[index]!, `${quizId}:q${index}`)
  );
}

export function vocabularyQuestionToQuizWord(
  question: VocabularyQuizQuestion
): {
  id: number;
  word: string;
  reading: string;
  meaning: string;
  phrase?: string;
  phraseReading?: string;
  phraseMeaning?: string;
  sentence?: string;
  sentenceReading?: string;
  sentenceMeaning?: string;
  audioWord?: string;
  jlpt?: "N1" | "N2";
  questionType: VocabularyQuizQuestionType;
  promptText: string;
  promptEnglish?: string;
  contextSource?: string;
  contextReading?: string;
  choiceKind: VocabularyQuizChoiceKind;
  choices: string[];
  correctChoiceIndex: number;
} {
  const { item } = question;
  return {
    id: item.id,
    word: item.word,
    reading: item.reading,
    meaning: item.meaning,
    phrase: item.phrase,
    phraseReading: item.phraseReading,
    phraseMeaning: item.phraseMeaning,
    sentence: item.sentence,
    sentenceReading: item.sentenceReading,
    sentenceMeaning: item.sentenceMeaning,
    audioWord: item.audioWord,
    jlpt: item.jlpt,
    questionType: question.type,
    promptText: question.promptText,
    promptEnglish: question.promptEnglish,
    contextSource: question.contextSource,
    contextReading: question.contextReading,
    choiceKind: question.choiceKind,
    choices: question.choices,
    correctChoiceIndex: question.correctChoiceIndex,
  };
}

export function buildVocabularyQuizChoices(
  questions: VocabularyQuizQuestion[],
  questionIndex: number
): { choices: string[]; correctChoiceIndex: number } {
  const question = questions[questionIndex];
  if (!question) {
    return { choices: [], correctChoiceIndex: 0 };
  }
  return {
    choices: question.choices,
    correctChoiceIndex: question.correctChoiceIndex,
  };
}
