import { N2_VOCAB_ITEMS_PER_LESSON } from "../config/vocabularyCourse";
import { getVocabularyByIds } from "../data/vocabulary";
import type { VocabularyItem } from "../types/vocabulary";
import {
  getWeakVocabItemIds,
  loadVocabQuizStats,
  type VocabQuizStatsFile,
} from "./vocabQuizStats";
import { seededShuffle } from "./vocabularyQuiz";

/** Dedicated quiz id for Weak Words Retest (not a TOC / Video Flow quiz). */
export const WEAK_WORDS_RETEST_QUIZ_ID = "quiz-weak-retest" as const;

/**
 * Resolve weak vocabulary quiz ids to real corpus items.
 * Drops unknown ids. Does not write stats or change ordering.
 */
export function getWeakVocabularyReviewItems(
  file: VocabQuizStatsFile = loadVocabQuizStats()
): VocabularyItem[] {
  return getVocabularyByIds(getWeakVocabItemIds(file));
}

/**
 * Targets for Weak Words Retest: current weak items only.
 * Caps at lesson size (10) with a deterministic sample when larger.
 * Does not write stats or change weak classification.
 */
export function getWeakVocabularyRetestItems(
  file: VocabQuizStatsFile = loadVocabQuizStats()
): VocabularyItem[] {
  const weak = getWeakVocabularyReviewItems(file);
  if (weak.length <= N2_VOCAB_ITEMS_PER_LESSON) return weak;
  return seededShuffle(
    weak,
    `${WEAK_WORDS_RETEST_QUIZ_ID}:pool`
  ).slice(0, N2_VOCAB_ITEMS_PER_LESSON);
}
