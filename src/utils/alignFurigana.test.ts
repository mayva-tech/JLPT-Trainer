import { describe, expect, it } from "vitest";
import {
  alignFurigana,
  ensureKanjiReadingsSeeded,
} from "./alignFurigana";

describe("ensureKanjiReadingsSeeded", () => {
  it("aligns a dictionary compound without importing the vocabulary corpus", () => {
    const segments = alignFurigana("在庫", "ざいこ");
    expect(segments).toEqual([
      { text: "在", reading: "ざい" },
      { text: "庫", reading: "こ" },
    ]);
  });

  it("keeps a representative okurigana compound split (品切れ)", () => {
    const segments = alignFurigana("品切れ", "しなぎれ");
    expect(segments).toEqual([
      { text: "品", reading: "しな" },
      { text: "切", reading: "ぎ" },
      { text: "れ" },
    ]);
  });

  it("is safe to call repeatedly", () => {
    ensureKanjiReadingsSeeded();
    const first = alignFurigana("在庫", "ざいこ");
    ensureKanjiReadingsSeeded();
    ensureKanjiReadingsSeeded();
    const second = alignFurigana("在庫", "ざいこ");
    expect(second).toEqual(first);
    expect(second).toEqual([
      { text: "在", reading: "ざい" },
      { text: "庫", reading: "こ" },
    ]);
  });
});
