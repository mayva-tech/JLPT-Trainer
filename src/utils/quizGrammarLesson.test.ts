import { describe, expect, it } from "vitest";
import { getGrammarLessonIdForQuiz } from "./quizGrammarLesson";
import { getGrammarLessonById, getGrammarItemsForLesson } from "../data/grammar";
import {
  getGrammarCourseReport,
  getGrammarQuizPool,
  getN2CoreGrammarFamilies,
  getN2SecondaryGrammarFamilies,
  normalizeGrammarPattern,
} from "../data/grammarCourse";
import { grammar } from "../data/grammar";

describe("getGrammarLessonIdForQuiz", () => {
  it("maps family-batch quiz ids to batch lessons", () => {
    expect(getGrammarLessonIdForQuiz("quiz-grammar-1-10")).toBe(
      "grammar-batch-001-010"
    );
    expect(getGrammarLessonIdForQuiz("quiz-grammar-11-20")).toBe(
      "grammar-batch-011-020"
    );
  });

  it("returns null for unrelated quiz ids", () => {
    expect(getGrammarLessonIdForQuiz("quiz-vocab-51-60")).toBeNull();
    expect(getGrammarLessonIdForQuiz("quiz-mixed")).toBeNull();
    expect(getGrammarLessonIdForQuiz(null)).toBeNull();
  });

  it("batch lessons contain only N2 course items", () => {
    const lessonId = getGrammarLessonIdForQuiz("quiz-grammar-1-10");
    const lesson = getGrammarLessonById(lessonId!)!;
    const items = getGrammarItemsForLesson(lesson);
    expect(items.length).toBeGreaterThan(0);
    expect(
      items.every(
        (i) => i.courseLevel === "N2_CORE" || i.courseLevel === "N2_SECONDARY"
      )
    ).toBe(true);
    expect(items.every((i) => i.jlpt !== "N1" && i.jlpt !== "N3")).toBe(true);
  });

  it("batch lessons include one primary item per family (matches TOC size)", () => {
    const lesson = getGrammarLessonById("grammar-batch-001-010")!;
    const items = getGrammarItemsForLesson(lesson);
    expect(items).toHaveLength(10);
    expect(items.every((i) => i.isPrimary)).toBe(true);
    expect(new Set(items.map((i) => i.familyId)).size).toBe(10);

    const last = getGrammarLessonById("grammar-batch-151-152")!;
    const lastItems = getGrammarItemsForLesson(last);
    expect(lastItems).toHaveLength(2);
    expect(new Set(lastItems.map((i) => i.familyId)).size).toBe(2);
  });
});

describe("grammar course layer", () => {
  it("preserves raw inventory size", () => {
    expect(grammar).toHaveLength(500);
    const report = getGrammarCourseReport();
    expect(report.rawN2 + report.rawN1 + report.rawN3).toBe(500);
    expect(report.unassigned).toBe(0);
  });

  it("keeps N2 family count near the curated target", () => {
    const report = getGrammarCourseReport();
    expect(report.totalN2Families).toBeGreaterThanOrEqual(140);
    expect(report.totalN2Families).toBeLessThanOrEqual(160);
    expect(report.coreFamilies).toBeGreaterThanOrEqual(120);
    expect(report.coreFamilies).toBeLessThanOrEqual(140);
  });

  it("gives every N2 core item a family and exactly one primary per family", () => {
    const cores = getN2CoreGrammarFamilies();
    for (const family of cores) {
      const members = grammar.filter((g) => g.familyId === family.id);
      expect(members.length).toBeGreaterThan(0);
      expect(members.filter((m) => m.isPrimary)).toHaveLength(1);
      expect(members.every((m) => m.courseLevel === "N2_CORE")).toBe(true);
    }
  });

  it("exposes raw N2 patterns to the quiz pool", () => {
    const pool = getGrammarQuizPool("N2");
    expect(pool.length).toBeGreaterThan(200);
    expect(pool.every((g) => g.jlpt === "N2" || g.courseLevel.startsWith("N2"))).toBe(
      true
    );
  });

  it("normalizes kanji/kana aliases for comparison", () => {
    expect(normalizeGrammarPattern("〜挙句に")).toBe(
      normalizeGrammarPattern("〜あげくに")
    );
    expect(normalizeGrammarPattern("〜に過ぎない")).toBe(
      normalizeGrammarPattern("〜にすぎない")
    );
  });

  it("does not put N1/N3 into N2 secondary families", () => {
    for (const family of getN2SecondaryGrammarFamilies()) {
      const members = grammar.filter((g) => g.familyId === family.id);
      expect(members.every((m) => m.courseLevel === "N2_SECONDARY")).toBe(true);
    }
  });
});
