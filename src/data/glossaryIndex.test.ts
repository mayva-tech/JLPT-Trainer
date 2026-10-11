import { describe, expect, it } from "vitest";
import { getGrammarItemsForLesson, getGrammarLessonById } from "./grammar";
import { getLessonById } from "./lessons";
import { findTocItemByLessonId } from "./toc";
import { buildGrammarGroups, buildWordGroups, GLOSSARY_LEVELS } from "./glossaryIndex";
import { vocabulary } from "./vocabulary";
import { vocabularyN3 } from "./n3/vocabularyN3";
import { grammar } from "./grammar";
import { grammarN3 } from "./n3/grammarN3";

const words = buildWordGroups();
const grammarGroups = buildGrammarGroups();

describe("glossary index", () => {
  it("lists every vocabulary word exactly once, N5 to N1", () => {
    const ids = words.flatMap((g) => g.items.map((v) => v.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBe(vocabulary.length + vocabularyN3.length);
    for (const level of GLOSSARY_LEVELS) {
      expect(words.some((g) => g.level === level), level).toBe(true);
    }
  });

  it("makes every word row openable in the Player", () => {
    for (const g of words) {
      expect(findTocItemByLessonId(g.lessonId), g.lessonId).toBeDefined();
      expect(getLessonById(g.lessonId)?.vocabularyIds.length).toBe(g.items.length);
    }
  });

  it("lists every grammar pattern exactly once, with no duplicates", () => {
    const ids = grammarGroups.flatMap((g) => g.rows.map((r) => r.item.id));
    expect(new Set(ids).size).toBe(ids.length);
    const corpus = new Set([...grammar, ...grammarN3].map((g) => g.id));
    expect(new Set(ids)).toEqual(corpus);
  });

  it("opens each tappable grammar row on a slide that exists", () => {
    for (const g of grammarGroups) {
      for (const r of g.rows) {
        if (r.lessonId === null) continue;
        expect(findTocItemByLessonId(r.lessonId), r.lessonId).toBeDefined();
        const lesson = getGrammarLessonById(r.lessonId)!;
        const idx = getGrammarItemsForLesson(lesson).findIndex((x) => x.id === r.openId);
        expect(idx, `${r.item.pattern} → ${r.lessonId}`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("only marks patterns untappable when no lesson teaches their family", () => {
    const untappable = grammarGroups.flatMap((g) => g.rows).filter((r) => r.lessonId === null);
    for (const r of untappable) expect(r.viaFamily).toBe(false);
  });
});
