import { describe, expect, it } from "vitest";
import { wordRelations } from "./wordRelations";
import type { RelatedWord } from "../types/wordRelation";

const READING_CHARS = /^[\u3041-\u3096ー 、。？！「」…]+$/;

function toHiragana(text: string): string {
  return text.replace(/[\u30A1-\u30F6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

/** Conjugating words only need their unchanging stem in the sentence. */
function stem(text: string, word: RelatedWord): string {
  if (text.endsWith("する") && text.length > 2) return text.slice(0, -2);
  const conjugates =
    word.partOfSpeech === "verb" ||
    word.partOfSpeech === "i-adjective" ||
    word.partOfSpeech === "expression";
  return conjugates && text.length > 1 ? text.slice(0, -1) : text;
}

describe("word relation example sentences", () => {
  for (const relation of wordRelations) {
    it(`${relation.id} has a valid example`, () => {
      const example = relation.example;
      expect(example, "missing example").toBeDefined();
      if (!example) return;

      expect(example.japanese.trim()).toBe(example.japanese);
      expect(example.japanese).toMatch(/[。？！]$/);
      expect(example.japanese).not.toMatch(/[0-9０-９]/);
      expect(example.english.trim()).toBeTruthy();
      expect(example.reading).toMatch(READING_CHARS);
      expect(example.reading).not.toMatch(/ {2}|^ | $| [、。？！]/);

      const compactReading = example.reading.replace(/ /g, "");
      for (const word of [relation.word1, relation.word2]) {
        expect(example.japanese, word.japanese).toContain(
          stem(word.japanese, word)
        );
        expect(compactReading, word.reading).toContain(
          stem(toHiragana(word.reading), word)
        );
      }
    });
  }
});
