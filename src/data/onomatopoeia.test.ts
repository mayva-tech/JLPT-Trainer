import { describe, expect, it } from "vitest";
import {
  ONOMATOPOEIA_LEVELS,
  filterOnomatopoeia,
  getOnomatopoeiaForLevel,
  onomatopoeiaCountByLevel,
  onomatopoeiaItems,
  onomatopoeiaTotal,
} from "./onomatopoeia";

describe("onomatopoeia corpus", () => {
  it("has 131 unique expressions from N5 to N2", () => {
    expect(onomatopoeiaTotal).toBe(131);
    expect(onomatopoeiaItems).toHaveLength(131);
    const ids = onomatopoeiaItems.map((item) => item.id);
    expect(new Set(ids).size).toBe(131);
    expect(ids[0]).toBe("ono-001");
    expect(ids[130]).toBe("ono-131");
  });

  it("derives level counts from the array", () => {
    expect(onomatopoeiaCountByLevel).toEqual({
      N5: 15,
      N4: 28,
      N3: 40,
      N2: 48,
    });
    for (const level of ONOMATOPOEIA_LEVELS) {
      expect(getOnomatopoeiaForLevel(level)).toHaveLength(
        onomatopoeiaCountByLevel[level]
      );
    }
  });

  it("filters by search and category", () => {
    const pounding = filterOnomatopoeia(onomatopoeiaItems, {
      search: "どきどき",
    });
    expect(pounding.map((item) => item.id)).toContain("ono-001");
    expect(pounding[0]?.japanese).toBe("どきどき");
    const emotion = filterOnomatopoeia(onomatopoeiaItems, {
      category: "emotion",
      level: "N5",
    });
    expect(emotion.every((item) => item.category === "emotion")).toBe(true);
    expect(emotion.every((item) => item.jlptLevel === "N5")).toBe(true);
  });

  it("requires the core playback fields", () => {
    for (const item of onomatopoeiaItems) {
      expect(item.japanese.trim()).not.toBe("");
      expect(item.reading.trim()).not.toBe("");
      expect(item.meaning.trim()).not.toBe("");
      expect(item.exampleJapanese.trim()).not.toBe("");
      expect(item.exampleReading.trim()).not.toBe("");
      expect(item.exampleEnglish.trim()).not.toBe("");
    }
  });
});
