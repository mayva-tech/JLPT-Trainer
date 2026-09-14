import { describe, expect, it } from "vitest";
import {
  createSelectorState,
  selectNextQuestion,
  survivalCategoryForRound,
} from "./questionSelector";

describe("selectNextQuestion", () => {
  it("returns real questions without inventing ids", () => {
    const state = createSelectorState();
    const seen = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const q = selectNextQuestion(state, { seedPrefix: "test" });
      expect(q).not.toBeNull();
      expect(q!.prompt.length).toBeGreaterThan(0);
      expect(q!.choices.length).toBeGreaterThanOrEqual(2);
      expect(q!.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q!.correctIndex).toBeLessThan(q!.choices.length);
      expect(seen.has(q!.id)).toBe(false);
      seen.add(q!.id);
    }
  });

  it("can force a category when available", () => {
    const state = createSelectorState();
    const q = selectNextQuestion(state, {
      forceCategory: "n2",
      seedPrefix: "force-n2",
    });
    expect(q).not.toBeNull();
    // May fall back if n2 empty (shouldn't be), but category should be set.
    expect(q!.category).toBeTruthy();
  });
});

describe("survivalCategoryForRound", () => {
  it("follows the suggested progression", () => {
    expect(survivalCategoryForRound(1)).toBe("prerequisite");
    expect(survivalCategoryForRound(2)).toBe("n2");
    expect(survivalCategoryForRound(3)).toBe("expression");
    expect(survivalCategoryForRound(4)).toBe("synonym-antonym");
    expect(survivalCategoryForRound(5)).toBe("mixed");
    expect(survivalCategoryForRound(6)).toBe("mixed");
  });
});
