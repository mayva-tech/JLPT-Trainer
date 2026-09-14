import { onomatopoeiaItems } from "../../data/onomatopoeia";
import { registerPairs } from "../../data/registerPairs";
import { styleExpressions } from "../../data/speechStyles";
import { getVocabularyByIds } from "../../data/vocabulary";
import { wordRelations } from "../../data/wordRelations";
import type { VocabularyItem } from "../../types/vocabulary";
import {
  getWeakVocabItemIds,
  loadVocabQuizStats,
} from "../vocabQuizStats";
import {
  buildVocabularyQuizQuestions,
  getN2VocabularyCoursePool,
  seededShuffle,
} from "../vocabularyQuiz";
import { buildRelationQuiz } from "../wordRelationQuiz";
import type { GameQuestion, GameQuestionCategory } from "./types";

function normalizeChoice(text: string): string {
  return text.trim().toLowerCase();
}

function uniqueMeanings(meanings: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const meaning of meanings) {
    const key = normalizeChoice(meaning);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(meaning);
  }
  return out;
}

function pickDistractorMeanings(
  correct: string,
  pool: string[],
  count: number,
  seed: string
): string[] {
  const shuffled = seededShuffle(
    uniqueMeanings(pool.filter((m) => normalizeChoice(m) !== normalizeChoice(correct))),
    seed
  );
  return shuffled.slice(0, count);
}

function buildMeaningChoices(
  correct: string,
  distractorPool: string[],
  seed: string,
  choiceCount = 4
): { choices: string[]; correctIndex: number } {
  const distractors = pickDistractorMeanings(
    correct,
    distractorPool,
    choiceCount - 1,
    `${seed}:d`
  );
  const raw = seededShuffle(
    uniqueMeanings([correct, ...distractors]).slice(0, choiceCount),
    `${seed}:c`
  );
  while (raw.length < choiceCount) raw.push("—");
  const correctIndex = raw.findIndex(
    (c) => normalizeChoice(c) === normalizeChoice(correct)
  );
  return {
    choices: raw,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
  };
}

export function getN2VocabPool(): VocabularyItem[] {
  return getN2VocabularyCoursePool();
}

export function getWeakVocabPool(): VocabularyItem[] {
  return getVocabularyByIds(getWeakVocabItemIds(loadVocabQuizStats()));
}

function vocabToGameQuestion(
  item: VocabularyItem,
  pool: VocabularyItem[],
  category: GameQuestionCategory,
  seed: string
): GameQuestion {
  const [q] = buildVocabularyQuizQuestions([item], seed, {
    distractorPool: pool.length >= 2 ? pool : getN2VocabPool(),
  });
  if (!q) {
    return {
      id: `${category}:fallback:${item.id}`,
      category,
      prompt: item.word,
      promptReading: item.reading,
      choices: [item.meaning, "—", "—", "—"],
      correctIndex: 0,
      explanation: item.meaning,
      vocabItemId: item.id,
    };
  }
  // Expand to 4 choices when the trainer default is 2.
  if (q.choices.length < 4) {
    const distractors = pickDistractorMeanings(
      item.meaning,
      pool.map((p) => p.meaning),
      3,
      `${seed}:expand`
    );
    const built = buildMeaningChoices(
      item.meaning,
      [...q.choices, ...distractors],
      `${seed}:4`
    );
    return {
      id: `${category}:vocab:${item.id}:${seed}`,
      category,
      prompt: q.promptText,
      promptReading: item.reading,
      choices: built.choices,
      correctIndex: built.correctIndex,
      explanation: item.meaning,
      vocabItemId: item.id,
    };
  }
  return {
    id: `${category}:vocab:${item.id}:${seed}`,
    category,
    prompt: q.promptText,
    promptReading: item.reading,
    choices: q.choices,
    correctIndex: q.correctChoiceIndex,
    explanation: item.meaning,
    vocabItemId: item.id,
  };
}

export function buildN2Question(
  usedIds: Set<string>,
  seed: string
): GameQuestion | null {
  const pool = getN2VocabPool();
  const candidates = seededShuffle(pool, seed).filter(
    (item) => !usedIds.has(`n2:vocab:${item.id}`)
  );
  const item = candidates[0];
  if (!item) return null;
  return vocabToGameQuestion(item, pool, "n2", seed);
}

export function buildWeakQuestion(
  usedIds: Set<string>,
  seed: string
): GameQuestion | null {
  const weak = getWeakVocabPool();
  if (weak.length === 0) return null;
  const n2 = getN2VocabPool();
  const candidates = seededShuffle(weak, seed).filter(
    (item) => !usedIds.has(`weak:vocab:${item.id}`)
  );
  // Allow reuse of weak ids only after the pool is exhausted for long runs.
  const item = candidates[0] ?? seededShuffle(weak, `${seed}:reuse`)[0];
  if (!item) return null;
  return vocabToGameQuestion(item, n2.length > 0 ? n2 : weak, "weak", seed);
}

export function buildSynonymAntonymQuestion(
  usedIds: Set<string>,
  seed: string
): GameQuestion | null {
  const pool = wordRelations.filter(
    (r) => r.jlptLevel === "N2" || r.jlptLevel === "N3"
  );
  const available = pool.filter((r) => !usedIds.has(`rel:${r.id}`));
  const source = available.length > 0 ? available : pool;
  if (source.length === 0) return null;

  const built = buildRelationQuiz({
    pool: seededShuffle(source, seed).slice(0, Math.min(12, source.length)),
    count: 1,
    random: (() => {
      let state = hashSeed(seed) || 1;
      return () => {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 0x100000000;
      };
    })(),
  });
  const q = built[0];
  if (!q) return null;
  return {
    id: `synonym-antonym:${q.id}:${q.relationId}`,
    category: "synonym-antonym",
    prompt: q.prompt,
    promptEn: q.promptEn,
    promptReading: q.promptDetail,
    choices: q.options.map((o) => o.label),
    correctIndex: Math.max(
      0,
      q.options.findIndex((o) => o.id === q.correctOptionId)
    ),
    explanation: q.explanation,
  };
}

export function buildExpressionQuestion(
  usedIds: Set<string>,
  seed: string
): GameQuestion | null {
  // Prefer register pairs (casual⇄formal expressions), then speech styles.
  const unusedPairs = registerPairs.filter(
    (p) => !usedIds.has(`expr:reg:${p.id}`)
  );
  const pairPool = unusedPairs.length > 0 ? unusedPairs : registerPairs;
  if (pairPool.length > 0) {
    const pair = seededShuffle(pairPool, seed)[0]!;
    const meanings = registerPairs.map((p) => p.meaning);
    const built = buildMeaningChoices(pair.meaning, meanings, seed);
    return {
      id: `expression:reg:${pair.id}:${seed}`,
      category: "expression",
      prompt: pair.casual.text,
      promptReading: pair.casual.reading,
      promptEn: "What does this expression mean?",
      choices: built.choices,
      correctIndex: built.correctIndex,
      explanation: `${pair.casual.text} / ${pair.formal.text} — ${pair.meaning}`,
    };
  }

  const unusedStyles = styleExpressions.filter(
    (s) => !usedIds.has(`expr:style:${s.id}`)
  );
  const stylePool =
    unusedStyles.length > 0 ? unusedStyles : [...styleExpressions];
  if (stylePool.length === 0) return null;
  const style = seededShuffle(stylePool, seed)[0]!;
  const meanings = styleExpressions.map((s) => s.english);
  const built = buildMeaningChoices(style.english, meanings, seed);
  return {
    id: `expression:style:${style.id}:${seed}`,
    category: "expression",
    prompt: style.japanese,
    promptReading: style.reading,
    promptEn: "What does this expression mean?",
    choices: built.choices,
    correctIndex: built.correctIndex,
    explanation: style.english,
  };
}

export function buildPrerequisiteQuestion(
  usedIds: Set<string>,
  seed: string
): GameQuestion | null {
  // Warm-up from N5/N4 onomatopoeia + lower-level relations.
  const ono = onomatopoeiaItems.filter(
    (item) =>
      (item.jlptLevel === "N5" || item.jlptLevel === "N4") &&
      !usedIds.has(`pre:ono:${item.id}`)
  );
  const onoPool =
    ono.length > 0
      ? ono
      : onomatopoeiaItems.filter(
          (item) => item.jlptLevel === "N5" || item.jlptLevel === "N4"
        );

  if (onoPool.length > 0 && hashSeed(seed) % 2 === 0) {
    const item = seededShuffle(onoPool, seed)[0]!;
    const meanings = onomatopoeiaItems.map((i) => i.meaning);
    const built = buildMeaningChoices(item.meaning, meanings, seed);
    return {
      id: `prerequisite:ono:${item.id}:${seed}`,
      category: "prerequisite",
      prompt: item.japanese,
      promptReading: item.reading,
      promptEn: "What does this onomatopoeia mean?",
      choices: built.choices,
      correctIndex: built.correctIndex,
      explanation: item.meaning,
    };
  }

  const relations = wordRelations.filter(
    (r) =>
      (r.jlptLevel === "N5" || r.jlptLevel === "N4") &&
      !usedIds.has(`pre:rel:${r.id}`)
  );
  const relPool =
    relations.length > 0
      ? relations
      : wordRelations.filter(
          (r) => r.jlptLevel === "N5" || r.jlptLevel === "N4"
        );
  if (relPool.length === 0) {
    // Last resort: any onomatopoeia
    if (onoPool.length === 0) return null;
    const item = seededShuffle(onoPool, seed)[0]!;
    const meanings = onomatopoeiaItems.map((i) => i.meaning);
    const built = buildMeaningChoices(item.meaning, meanings, seed);
    return {
      id: `prerequisite:ono:${item.id}:${seed}`,
      category: "prerequisite",
      prompt: item.japanese,
      promptReading: item.reading,
      choices: built.choices,
      correctIndex: built.correctIndex,
      explanation: item.meaning,
    };
  }

  const built = buildRelationQuiz({
    pool: seededShuffle(relPool, seed).slice(0, Math.min(12, relPool.length)),
    count: 1,
    random: (() => {
      let state = hashSeed(seed) || 1;
      return () => {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 0x100000000;
      };
    })(),
  });
  const q = built[0];
  if (!q) return null;
  return {
    id: `prerequisite:rel:${q.relationId}:${q.id}`,
    category: "prerequisite",
    prompt: q.prompt,
    promptEn: q.promptEn,
    promptReading: q.promptDetail,
    choices: q.options.map((o) => o.label),
    correctIndex: Math.max(
      0,
      q.options.findIndex((o) => o.id === q.correctOptionId)
    ),
    explanation: q.explanation,
  };
}

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

/** Mark a question's source id as used for de-duplication. */
export function markQuestionUsed(
  usedIds: Set<string>,
  question: GameQuestion
): void {
  usedIds.add(question.id);
  if (question.vocabItemId != null) {
    usedIds.add(`n2:vocab:${question.vocabItemId}`);
    usedIds.add(`weak:vocab:${question.vocabItemId}`);
  }
  const reg = question.id.match(/^expression:reg:(\d+)/);
  if (reg) usedIds.add(`expr:reg:${reg[1]}`);
  const style = question.id.match(/^expression:style:([^:]+)/);
  if (style) usedIds.add(`expr:style:${style[1]}`);
  const rel = question.id.match(/(?:synonym-antonym|prerequisite):rel:([^:]+)/);
  if (rel) {
    usedIds.add(`rel:${rel[1]}`);
    usedIds.add(`pre:rel:${rel[1]}`);
  }
  const ono = question.id.match(/^prerequisite:ono:([^:]+)/);
  if (ono) usedIds.add(`pre:ono:${ono[1]}`);
}
