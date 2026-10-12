import { describe, expect, it } from "vitest";
import { locateNuanceSegments, splitNuanceForSpeech } from "./nuanceSpeech";

describe("splitNuanceForSpeech", () => {
  it("alternates Japanese words and English prose", () => {
    expect(
      splitNuanceForSpeech(
        "うち is your own home and carries warmth; 家 is the building itself."
      )
    ).toEqual([
      { lang: "ja", text: "うち" },
      { lang: "en", text: " is your own home and carries warmth; " },
      { lang: "ja", text: "家" },
      { lang: "en", text: " is the building itself." },
    ]);
  });

  it("keeps katakana on the Japanese voice", () => {
    expect(
      splitNuanceForSpeech(
        "かばん covers briefcases and school bags; バッグ leans toward fashion bags."
      )
    ).toEqual([
      { lang: "ja", text: "かばん" },
      { lang: "en", text: " covers briefcases and school bags; " },
      { lang: "ja", text: "バッグ" },
      { lang: "en", text: " leans toward fashion bags." },
    ]);
  });

  it("handles several Japanese tokens in one sentence", () => {
    expect(
      splitNuanceForSpeech("3 あつい: 厚い is thickness, 暑い weather, 熱い touch.")
    ).toEqual([
      { lang: "en", text: "3 " },
      { lang: "ja", text: "あつい" },
      { lang: "en", text: ": " },
      { lang: "ja", text: "厚い" },
      { lang: "en", text: " is thickness, " },
      { lang: "ja", text: "暑い" },
      { lang: "en", text: " weather, " },
      { lang: "ja", text: "熱い" },
      { lang: "en", text: " touch." },
    ]);
  });

  it("says a kanji word written with its reading once, by the reading", () => {
    expect(
      splitNuanceForSpeech("人 is neutral; 方 かた is polite, and 者（もの） is humble.")
    ).toEqual([
      { lang: "ja", text: "人" },
      { lang: "en", text: " is neutral; " },
      { lang: "ja", text: "かた" },
      { lang: "en", text: " is polite, and " },
      { lang: "ja", text: "もの" },
      { lang: "en", text: " is humble." },
    ]);
    expect(splitNuanceForSpeech("Platform 3 = 3番線(さんばんせん).")).toEqual([
      { lang: "en", text: "Platform 3 = " },
      { lang: "ja", text: "さんばんせん" },
      { lang: "en", text: "." },
    ]);
  });

  it("locates each run in the note, the reread word over its whole span", () => {
    const note = "人 is neutral; 方 かた is polite.";
    const reread = locateNuanceSegments(note).find((s) => s.reread);
    expect(reread && note.slice(reread.start, reread.end)).toBe("方 かた");
  });
});
