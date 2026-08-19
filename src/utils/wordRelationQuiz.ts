import { wordRelations } from "../data/wordRelations";
import { shuffle } from "./wordRelations";
import type {
  RelatedWord,
  WordRelation,
  WordRelationLevel,
} from "../types/wordRelation";

/**
 * Question shapes for the 類義語・反対語 quiz.
 *
 * `choose-synonym` / `choose-antonym` are the JLPT vocabulary format: a
 * Japanese prompt word with four Japanese answer choices.
 * `relation-type` asks whether a displayed pair means the same or the opposite.
 * `meaning-match` goes English → Japanese.
 */
export type RelationQuestionKind =
  | "choose-synonym"
  | "choose-antonym"
  | "relation-type"
  | "meaning-match";

export interface RelationQuizOption {
  id: string;
  /** Japanese answer text, or the English label for relation-type questions. */
  label: string;
  /** Reading shown under the option, when the label is a Japanese word. */
  reading?: string;
}

export interface RelationQuizQuestion {
  id: string;
  relationId: string;
  kind: RelationQuestionKind;
  /** Japanese question text, JLPT style. */
  prompt: string;
  /** Plain-English restatement of the task, for learners below N3. */
  promptEn: string;
  /** Extra line shown above the choices (the pair, for relation-type). */
  promptDetail?: string;
  options: RelationQuizOption[];
  correctOptionId: string;
  explanation: string;
  jlptLevel: WordRelationLevel;
}

export interface RelationQuizConfig {
  /** Relations already narrowed by the page's level/type filters. */
  pool: readonly WordRelation[];
  count: number;
  random?: () => number;
}

interface PoolWord extends RelatedWord {
  level: WordRelationLevel;
}

const LEVELS: WordRelationLevel[] = ["N5", "N4", "N3", "N2"];

/** Every distinct word in the corpus, used to draw plausible distractors. */
const allWords: PoolWord[] = (() => {
  const seen = new Map<string, PoolWord>();
  for (const relation of wordRelations) {
    for (const word of [relation.word1, relation.word2]) {
      if (!seen.has(word.japanese)) {
        seen.set(word.japanese, { ...word, level: relation.jlptLevel });
      }
    }
  }
  return [...seen.values()];
})();

/** japanese -> every word it is directly paired with, in either direction. */
const partners = new Map<string, Set<string>>();
for (const relation of wordRelations) {
  const a = relation.word1.japanese;
  const b = relation.word2.japanese;
  if (!partners.has(a)) partners.set(a, new Set());
  if (!partners.has(b)) partners.set(b, new Set());
  partners.get(a)!.add(b);
  partners.get(b)!.add(a);
}

function isRelated(a: string, b: string): boolean {
  return partners.get(a)?.has(b) ?? false;
}

/**
 * Picks three distractors that could plausibly be the answer: same part of
 * speech and JLPT level first, then same level, then anything. Words that are
 * genuinely related to the prompt are excluded so no question has two defensible
 * answers.
 */
function pickDistractors(
  prompt: RelatedWord,
  answer: RelatedWord,
  level: WordRelationLevel,
  random: () => number,
  wanted = 3
): PoolWord[] {
  const banned = new Set<string>([prompt.japanese, answer.japanese]);
  const eligible = allWords.filter(
    (word) =>
      !banned.has(word.japanese) &&
      !isRelated(prompt.japanese, word.japanese) &&
      !isRelated(answer.japanese, word.japanese) &&
      word.meaning !== answer.meaning
  );

  const levelIndex = LEVELS.indexOf(level);
  const tiers = [
    eligible.filter(
      (word) =>
        word.partOfSpeech === answer.partOfSpeech && word.level === level
    ),
    eligible.filter(
      (word) =>
        word.partOfSpeech === answer.partOfSpeech &&
        Math.abs(LEVELS.indexOf(word.level) - levelIndex) <= 1
    ),
    eligible.filter((word) => word.partOfSpeech === answer.partOfSpeech),
    eligible,
  ];

  const chosen: PoolWord[] = [];
  const used = new Set<string>();

  for (const tier of tiers) {
    for (const word of shuffle(tier, random)) {
      if (chosen.length >= wanted) break;
      if (used.has(word.japanese)) continue;
      used.add(word.japanese);
      chosen.push(word);
    }
    if (chosen.length >= wanted) break;
  }

  return chosen;
}

function toOption(word: RelatedWord, index: number): RelationQuizOption {
  return {
    id: `opt-${index}`,
    label: word.japanese,
    reading: word.reading,
  };
}

function buildWordChoiceQuestion(
  relation: WordRelation,
  index: number,
  random: () => number
): RelationQuizQuestion | null {
  // Either word can be the prompt, which doubles the variety of the pool.
  const flip = random() < 0.5;
  const prompt = flip ? relation.word2 : relation.word1;
  const answer = flip ? relation.word1 : relation.word2;

  const distractors = pickDistractors(
    prompt,
    answer,
    relation.jlptLevel,
    random
  );
  if (distractors.length < 3) return null;

  const options = shuffle(
    [answer, ...distractors].map((word, i) => toOption(word, i)),
    random
  );
  const correct = options.find((option) => option.label === answer.japanese);
  if (!correct) return null;

  const isSynonym = relation.type === "synonym";

  return {
    id: `q-${index}`,
    relationId: relation.id,
    kind: isSynonym ? "choose-synonym" : "choose-antonym",
    prompt: isSynonym
      ? `「${prompt.japanese}」に近い意味の言葉はどれ？`
      : `「${prompt.japanese}」の反対の意味の言葉はどれ？`,
    promptEn: isSynonym
      ? `Which word is closest in meaning to ${prompt.japanese} (${prompt.meaning})?`
      : `Which word is the opposite of ${prompt.japanese} (${prompt.meaning})?`,
    options,
    correctOptionId: correct.id,
    explanation: relation.nuance
      ? `${prompt.japanese} ${isSynonym ? "≈" : "↔"} ${answer.japanese}（${answer.reading}）— ${answer.meaning}. ${relation.nuance}`
      : `${prompt.japanese} ${isSynonym ? "≈" : "↔"} ${answer.japanese}（${answer.reading}）— ${answer.meaning}.`,
    jlptLevel: relation.jlptLevel,
  };
}

function buildRelationTypeQuestion(
  relation: WordRelation,
  index: number,
  random: () => number
): RelationQuizQuestion {
  const options = shuffle(
    [
      { id: "opt-synonym", label: "同じような意味 / Same meaning" },
      { id: "opt-antonym", label: "反対の意味 / Opposite meaning" },
    ],
    random
  );

  return {
    id: `q-${index}`,
    relationId: relation.id,
    kind: "relation-type",
    prompt: "この二つの言葉の関係は？",
    promptEn: "What is the relationship between these two words?",
    promptDetail: `${relation.word1.japanese} ・ ${relation.word2.japanese}`,
    options,
    correctOptionId:
      relation.type === "synonym" ? "opt-synonym" : "opt-antonym",
    explanation:
      relation.type === "synonym"
        ? `${relation.word1.japanese}（${relation.word1.meaning}）≈ ${relation.word2.japanese}（${relation.word2.meaning}）.${relation.nuance ? ` ${relation.nuance}` : ""}`
        : `${relation.word1.japanese}（${relation.word1.meaning}）↔ ${relation.word2.japanese}（${relation.word2.meaning}）.${relation.nuance ? ` ${relation.nuance}` : ""}`,
    jlptLevel: relation.jlptLevel,
  };
}

function buildMeaningQuestion(
  relation: WordRelation,
  index: number,
  random: () => number
): RelationQuizQuestion | null {
  const flip = random() < 0.5;
  const answer = flip ? relation.word2 : relation.word1;
  const other = flip ? relation.word1 : relation.word2;

  const distractors = pickDistractors(
    other,
    answer,
    relation.jlptLevel,
    random
  );
  if (distractors.length < 3) return null;

  const options = shuffle(
    [answer, ...distractors].map((word, i) => toOption(word, i)),
    random
  );
  const correct = options.find((option) => option.label === answer.japanese);
  if (!correct) return null;

  return {
    id: `q-${index}`,
    relationId: relation.id,
    kind: "meaning-match",
    prompt: `「${answer.meaning}」を表す言葉はどれ？`,
    promptEn: `Which word means "${answer.meaning}"?`,
    options,
    correctOptionId: correct.id,
    explanation: `${answer.japanese}（${answer.reading}）— ${answer.meaning}.`,
    jlptLevel: relation.jlptLevel,
  };
}

/**
 * Builds a quiz from the relations currently selected on the page. Question
 * kinds rotate so a run mixes recognition, direction and production, and the
 * whole thing is driven by an injectable RNG so tests are deterministic.
 */
export function buildRelationQuiz({
  pool,
  count,
  random = Math.random,
}: RelationQuizConfig): RelationQuizQuestion[] {
  if (pool.length === 0 || count <= 0) return [];

  const source = shuffle(pool, random);
  const questions: RelationQuizQuestion[] = [];

  for (const relation of source) {
    if (questions.length >= count) break;

    const slot = questions.length % 4;
    let question: RelationQuizQuestion | null = null;

    if (slot === 2) {
      question = buildRelationTypeQuestion(relation, questions.length, random);
    } else if (slot === 3) {
      question = buildMeaningQuestion(relation, questions.length, random);
    } else {
      question = buildWordChoiceQuestion(relation, questions.length, random);
    }

    // A relation with too few plausible distractors falls back to the
    // two-option relationship question, which always has valid choices.
    if (!question) {
      question = buildRelationTypeQuestion(relation, questions.length, random);
    }

    questions.push(question);
  }

  return questions;
}

export interface RelationQuizAnswer {
  questionId: string;
  selectedOptionId: string;
  correct: boolean;
}

export interface RelationQuizResult {
  total: number;
  correct: number;
  incorrect: number;
  percentage: number;
  missed: RelationQuizQuestion[];
}

export function scoreRelationQuiz(
  questions: readonly RelationQuizQuestion[],
  answers: readonly RelationQuizAnswer[]
): RelationQuizResult {
  const byId = new Map(answers.map((answer) => [answer.questionId, answer]));
  const missed = questions.filter((question) => !byId.get(question.id)?.correct);
  const correct = questions.length - missed.length;

  return {
    total: questions.length,
    correct,
    incorrect: missed.length,
    percentage:
      questions.length === 0
        ? 0
        : Math.round((correct / questions.length) * 100),
    missed,
  };
}
