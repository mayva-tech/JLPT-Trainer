import { describe, expect, it } from "vitest";
import {
  buildN2GrammarLessonTocItems,
  buildN2GrammarQuizTocItems,
  formatGrammarCategorySuffix,
  grammarBatchCategorySuffix,
} from "../data/tocGrammarItems";
import { tocGroups } from "../data/toc";
import { formatN2VocabularyTocLessonLabel } from "../utils/vocabularyDisplay";

describe("formatGrammarCategorySuffix", () => {
  it("keeps short lists intact and trims longer ones without a +N count", () => {
    expect(formatGrammarCategorySuffix(["A", "B"])).toBe("A, B");
    expect(formatGrammarCategorySuffix(["A", "B", "C", "D"])).toBe("A, B");
  });
});

describe("grammar TOC categories", () => {
  it("adds subcategory themes to batch labels without Families", () => {
    const items = buildN2GrammarLessonTocItems();
    const first = items.find((i) => i.id === "grammar-f1-10");
    expect(first?.label).toMatch(/^1–10 · /);
    expect(first?.label).not.toMatch(/Families/i);
    expect(grammarBatchCategorySuffix("grammar-batch-001-010").length).toBeGreaterThan(0);
  });

  it("mirrors categories on grammar quiz TOC labels", () => {
    const quizzes = buildN2GrammarQuizTocItems();
    const first = quizzes.find((i) => i.id === "quiz-grammar-1-10");
    expect(first?.label).toMatch(/^Quiz 1–10 · /);
    expect(first?.label).not.toMatch(/Families/i);
  });

  it("wires category labels into tocGroups", () => {
    const grammar = tocGroups.find((g) => g.id === "grammar")!;
    expect(grammar.items[0]?.label).toContain("·");
    expect(grammar.items[0]?.label).not.toMatch(/Families/i);
    const grammarQuizzes = tocGroups.find((g) => g.id === "quiz-grammar")!;
    expect(grammarQuizzes.items[0]?.label).toMatch(/^Quiz 1–10 · /);
    expect(grammarQuizzes.items[0]?.label).not.toMatch(/Families/i);
    for (const item of grammarQuizzes.items) {
      expect(item.label).not.toMatch(/Families/i);
    }
    const vocab = tocGroups.find((g) => g.id === "vocabulary")!;
    expect(vocab.items[0]?.label).toBe(formatN2VocabularyTocLessonLabel(1));
    expect(vocab.items[0]?.label).toContain("Shopping");
  });
});
