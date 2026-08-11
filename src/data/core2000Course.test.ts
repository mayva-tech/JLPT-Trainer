import { describe, expect, it } from "vitest";
import {
  N2_VOCAB_ID_END,
  N2_VOCAB_ID_START,
  N2_VOCAB_ITEM_COUNT,
  N2_VOCAB_LESSON_COUNT,
} from "../config/vocabularyCourse";
import { lessons } from "../data/lessons";
import { vocabulary } from "../data/vocabulary";
import { getTocItem, quizIds } from "../data/toc";
import { getVocabularyLessonIdForQuiz } from "../utils/quizVocabLesson";
import {
  formatLessonIdFromNumber,
  formatN2VocabularyTocQuizId,
  formatN2VocabularyTocWordId,
  getVocabularyDisplayRange,
} from "../utils/vocabularyDisplay";

describe("Core 2000 vocabulary course", () => {
  const n2Lessons = lessons.filter((l) => l.id.startsWith("lesson-"));

  it("has exactly 2000 vocabulary items with IDs 4001–6000", () => {
    expect(vocabulary.length).toBe(N2_VOCAB_ITEM_COUNT);
    expect(N2_VOCAB_ITEM_COUNT).toBe(2000);
    expect(N2_VOCAB_ID_START).toBe(4001);
    expect(N2_VOCAB_ID_END).toBe(6000);

    const ids = vocabulary.map((v) => v.id).sort((a, b) => a - b);
    expect(new Set(ids).size).toBe(2000);
    expect(ids[0]).toBe(4001);
    expect(ids[ids.length - 1]).toBe(6000);
    for (let i = 0; i < ids.length; i++) {
      expect(ids[i]).toBe(4001 + i);
    }
  });

  it("has 200 N2 lessons with 10 ids each and unique coverage", () => {
    expect(n2Lessons).toHaveLength(N2_VOCAB_LESSON_COUNT);
    const seen = new Set<number>();
    for (const lesson of n2Lessons) {
      expect(lesson.vocabularyIds).toHaveLength(10);
      for (const id of lesson.vocabularyIds) {
        expect(seen.has(id)).toBe(false);
        seen.add(id);
      }
    }
    expect(seen.size).toBe(2000);
  });

  it("reaches lesson/quiz boundaries 75, 76, 99, 100, 199, 200", () => {
    for (const n of [75, 76, 99, 100, 199, 200]) {
      const lessonId = formatLessonIdFromNumber(n);
      expect(lessons.some((l) => l.id === lessonId)).toBe(true);
      expect(getVocabularyDisplayRange(lessonId)).toMatchObject({
        lessonNumber: n,
        firstWordNumber: (n - 1) * 10 + 1,
        lastWordNumber: n * 10,
      });

      const quizId = formatN2VocabularyTocQuizId(n);
      expect(getVocabularyLessonIdForQuiz(quizId)).toBe(lessonId);
      expect(getTocItem(quizId as never)?.kind).toBe("quiz");
      expect(getTocItem(formatN2VocabularyTocWordId(n) as never)?.kind).toBe(
        "word"
      );
    }
  });

  it("includes quiz-vocab entries for all 200 lessons in quizIds", () => {
    const vocabQuizIds = quizIds.filter((id) =>
      /^quiz-vocab-\d+-\d+$/.test(id)
    );
    expect(vocabQuizIds).toHaveLength(200);
  });

  it("requires non-empty core fields on every vocabulary item", () => {
    for (const v of vocabulary) {
      expect(v.word.trim()).not.toBe("");
      expect(v.reading.trim()).not.toBe("");
      expect(v.meaning.trim()).not.toBe("");
      expect(v.phrase.trim()).not.toBe("");
      expect(v.phraseReading.trim()).not.toBe("");
      expect(v.phraseMeaning.trim()).not.toBe("");
      expect(v.sentence.trim()).not.toBe("");
      expect(v.sentenceReading.trim()).not.toBe("");
      expect(v.sentenceMeaning.trim()).not.toBe("");
      expect(v.wordType.trim()).not.toBe("");
    }
  });
});
