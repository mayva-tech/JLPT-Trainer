import { describe, expect, it } from "vitest";
import { allNuanceTexts } from "../data/nuanceTexts";
import { NUANCE_FURIGANA } from "../data/nuanceFurigana.generated";
import { KANJI_RUN_RE, findKanjiFurigana, kanjiRunKey, nuanceFurigana } from "./nuanceFurigana";

const rubies = (text: string) =>
  nuanceFurigana(text).map((g) => [text.slice(g.rubyStart, g.rubyEnd), g.ruby]);

describe("nuanceFurigana", () => {
  it("puts furigana over every kanji word in a note", () => {
    expect(
      rubies("女の人 is the everyday conversational choice; announcements and forms prefer 女性.")
    ).toEqual([
      ["女", "おんな"],
      ["人", "ひと"],
      ["女性", "じょせい"],
    ]);
  });

  it("splits a kanji run into its words", () => {
    const text = "在庫切れ means sold out.";
    expect(findKanjiFurigana(text).map((g) => [text.slice(g.rubyStart, g.rubyEnd), g.ruby])).toEqual([
      ["在庫", "ざいこ"],
      ["切", "ぎ"],
    ]);
  });

  it("keeps a reading the note writes out itself", () => {
    const text = "方 かた is the polite way to say 人.";
    const glosses = nuanceFurigana(text);
    expect(glosses.map((g) => [text.slice(g.rubyStart, g.rubyEnd), g.ruby])).toEqual([
      ["方", "かた"],
      ["人", "ひと"],
    ]);
    expect(glosses[0]!.end).toBe(text.indexOf(" is"));
  });

  it("has a reading for (nearly) every kanji in the nuance data — run `npm run nuance-furigana` after editing notes", () => {
    const missing: string[] = [];
    for (const text of allNuanceTexts()) {
      for (const m of text.matchAll(KANJI_RUN_RE)) {
        const at = m.index ?? 0;
        if (!NUANCE_FURIGANA[kanjiRunKey(m[0], text[at + m[0].length] ?? "")]) missing.push(m[0]);
      }
    }
    expect(missing.length, missing.join(" ")).toBeLessThanOrEqual(20);
  });
});
