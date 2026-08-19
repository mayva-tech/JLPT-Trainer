import { describe, expect, it } from "vitest";
import { splitNuanceForSpeech } from "./nuanceSpeech";

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
});
