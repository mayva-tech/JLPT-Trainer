import { describe, expect, it } from "vitest";
import {
  STYLE_CATEGORIES,
  styleExpressions,
} from "./speechStyles";
import {
  buildComparisons,
  styleCountByGender,
  styleTotal,
} from "../utils/speechStyles";
import type { StyleGender, StyleStrength } from "../types/speechStyle";

function genderFromStrength(strength: StyleStrength): StyleGender {
  if (strength === "strongly-feminine" || strength === "somewhat-feminine") {
    return "feminine";
  }
  if (strength === "strongly-masculine" || strength === "somewhat-masculine") {
    return "masculine";
  }
  return "neutral";
}

/** Kana readings; `+` marks placeholders like なまえ+さん. */
const KANA_ONLY = /^[\u3040-\u309F\u30A0-\u30FFー・、。！？!?…〜～+\s]+$/u;

describe("speechStyles corpus", () => {
  it("has 197 expressions with unique ids", () => {
    expect(styleTotal).toBe(197);
    expect(styleExpressions).toHaveLength(197);
    const ids = styleExpressions.map((item) => item.id);
    expect(new Set(ids).size).toBe(197);
  });

  it("keeps a neutral majority", () => {
    expect(styleCountByGender.neutral).toBeGreaterThan(
      styleCountByGender.masculine
    );
    expect(styleCountByGender.neutral).toBeGreaterThan(
      styleCountByGender.feminine
    );
    expect(styleCountByGender.neutral).toBeGreaterThanOrEqual(80);
  });

  it("derives gender consistently from strength", () => {
    for (const item of styleExpressions) {
      expect(item.gender).toBe(genderFromStrength(item.strength));
    }
  });

  it("uses kana-only readings", () => {
    for (const item of styleExpressions) {
      expect(item.reading).toMatch(KANA_ONLY);
      expect(item.example.reading).toMatch(KANA_ONLY);
    }
  });

  it("requires a warning on rough, anime-drama, and old-fashioned entries", () => {
    for (const item of styleExpressions) {
      const needsWarning =
        item.politeness === "rough" ||
        item.naturalness === "rough" ||
        item.naturalness === "anime-drama" ||
        item.naturalness === "old-fashioned";
      if (needsWarning) {
        expect(item.warning?.trim()).toBeTruthy();
      }
    }
  });

  it("populates every category", () => {
    expect(STYLE_CATEGORIES).toHaveLength(12);
    for (const category of STYLE_CATEGORIES) {
      const count = styleExpressions.filter(
        (item) => item.category === category.id
      ).length;
      expect(count).toBeGreaterThan(0);
    }
  });

  it("builds comparison groups with 2+ members", () => {
    const comparisons = buildComparisons(styleExpressions);
    expect(comparisons.length).toBe(56);
    for (const group of comparisons) {
      expect(group.members.length).toBeGreaterThanOrEqual(2);
    }
  });
});
