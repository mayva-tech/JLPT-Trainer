import { describe, expect, it } from "vitest";
import { vocabulary } from "./vocabulary";
import { grammar } from "./grammar";
import { phraseNuances } from "./vocabularyPhraseNuances";
import { vocabNuances } from "./vocabularyNuances";
import { grammarNuances } from "./grammarNuances";

const MAX_LENGTH = 140;

function expectSpeakable(label: string, note: string) {
  expect(note.trim(), label).toBe(note);
  expect(note.length, `${label}: ${note}`).toBeLessThanOrEqual(MAX_LENGTH);
  expect(note, label).toMatch(/[.!?]$/);
  expect(note, `${label} has brackets`).not.toMatch(/[()（）[\]"]/);
  expect(note, `${label} has digits`).not.toMatch(/[0-9０-９]/);
}

describe("lesson nuance notes", () => {
  const vocabIds = new Set(vocabulary.map((item) => item.id));
  const grammarIds = new Set(grammar.map((item) => item.id));

  it("only annotates existing items", () => {
    for (const id of [...Object.keys(phraseNuances), ...Object.keys(vocabNuances)]) {
      expect(vocabIds.has(Number(id)), `unknown vocab id ${id}`).toBe(true);
    }
    for (const id of Object.keys(grammarNuances)) {
      expect(grammarIds.has(Number(id)), `unknown grammar id ${id}`).toBe(true);
    }
  });

  it("keeps each note short, plain and speakable", () => {
    for (const [id, note] of Object.entries(phraseNuances)) {
      expectSpeakable(`phrase ${id}`, note);
    }
    for (const [id, entry] of Object.entries(vocabNuances)) {
      for (const [field, note] of Object.entries(entry)) {
        expectSpeakable(`vocab ${id}.${field}`, note as string);
      }
    }
    for (const [id, entry] of Object.entries(grammarNuances)) {
      for (const [field, note] of Object.entries(entry)) {
        expectSpeakable(`grammar ${id}.${field}`, note as string);
      }
    }
  });

  it("gives every vocabulary phrase a nuance note", () => {
    for (const item of vocabulary) {
      expect(item.phraseNuance, `phrase ${item.id}`).toBeTruthy();
    }
  });

  it("does not author a phrase note twice", () => {
    for (const [id, entry] of Object.entries(vocabNuances)) {
      if (entry.phrase) expect(phraseNuances[Number(id)], `phrase ${id}`).toBeUndefined();
    }
  });

  it("merges notes onto the items", () => {
    for (const item of vocabulary) {
      expect(item.wordNuance).toBe(vocabNuances[item.id]?.word);
      expect(item.sentenceNuance).toBe(vocabNuances[item.id]?.sentence);
    }
    for (const item of grammar) {
      expect(item.nuance).toBe(grammarNuances[item.id]?.pattern);
      expect(item.sentenceNuance).toBe(grammarNuances[item.id]?.sentence);
    }
  });
});
