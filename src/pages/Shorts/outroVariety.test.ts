import { describe, expect, it } from "vitest";
import { vocabulary } from "../../data/vocabulary";
import { vocabularyN3 } from "../../data/n3/vocabularyN3";
import { wordRelations } from "../../data/wordRelations";
import { isWordLevelAssumed } from "../../utils/wordLevel";
import { shortAngle } from "./shortAngle";
import { FOLLOW_LINES, followLineFor, nextLabelFor, outroChallengesFor } from "./outroVariety";

const all = [...vocabulary, ...vocabularyN3].sort((a, b) => a.id - b.id);
const find = (w: string) => all.find((v) => v.word === w)!;

describe("Shorts outro variety", () => {
  it("never ends two Shorts in a row with the same spoken line", () => {
    let prev = "";
    for (const v of all) {
      const spoken = shortAngle(v).baitSpoken;
      expect(spoken, `${v.id} ${v.word}`).not.toBe(prev);
      prev = spoken;
    }
  });

  it("uses many different challenges across the playlist", () => {
    const ids = new Set(all.map((v) => shortAngle(v).outroId));
    expect(ids.size).toBeGreaterThanOrEqual(18);
    const lines = new Set(all.map((v) => shortAngle(v).baitSpoken));
    expect(lines.size).toBeGreaterThan(60);
    // No single challenge dominates the classic Shorts.
    const counts = new Map<string, number>();
    for (const v of all) {
      const a = shortAngle(v);
      if (a.kind === "read") counts.set(a.outroId, (counts.get(a.outroId) ?? 0) + 1);
    }
    const reads = [...counts.values()].reduce((a, b) => a + b, 0);
    for (const [id, n] of counts) expect(n / reads, id).toBeLessThan(0.15);
  });

  it("keeps Andrew's spoken line English-only and emoji-free", () => {
    for (const v of all) {
      const s = shortAngle(v).baitSpoken;
      expect(s, `${v.id}`).not.toMatch(/[぀-ヿ一-龯「」]/u);
      expect(s, `${v.id}`).not.toMatch(/\p{Extended_Pictographic}/u);
    }
  });

  it("only offers a challenge when it fits the word", () => {
    const related = new Set(wordRelations.flatMap((r) => [r.word1.japanese, r.word2.japanese]));
    for (const v of all) {
      for (const c of outroChallengesFor(v)) {
        if (c.id === "past-tense" || c.id === "this-week") expect(v.wordType, v.word).toMatch(/^verb/);
        if (c.id === "negative") expect(v.wordType, v.word).toMatch(/i-adjective/);
        if (c.id === "romaji") expect(v.word, v.word).toMatch(/^[ぁ-ゖァ-ヺー]+$/);
        if (c.id === "opposite" || c.id === "synonym") expect(related.has(v.word), v.word).toBe(true);
        if (c.id === "level-guess") expect(isWordLevelAssumed(v.id), v.word).toBe(false);
        if (c.id === "write") expect(v.word, v.word).toMatch(/[一-龯々]/);
        if (c.id === "feeling") expect(v.wordType ?? "", v.word).not.toMatch(/^verb/);
      }
    }
  });

  it("gives feelings, opposites and verbs their own challenges", () => {
    expect(outroChallengesFor(find("うれしい")).map((c) => c.id)).toContain("feeling");
    expect(outroChallengesFor(find("食べる")).map((c) => c.id)).toEqual(
      expect.arrayContaining(["past-tense", "this-week"])
    );
    const opposite = outroChallengesFor(find("寒い")).find((c) => c.id === "opposite");
    if (opposite) expect(opposite.pinnedComment).toMatch(/starts with 「.」/);
  });

  it("varies the follow line and the Next label", () => {
    expect(new Set(all.map((v) => followLineFor(v))).size).toBe(FOLLOW_LINES.length);
    expect(new Set(all.map((v) => nextLabelFor(v))).size).toBeGreaterThan(3);
  });

  it("is stable per word, so a re-take matches its upload text", () => {
    const v = find("映画");
    expect(shortAngle(v).bait).toBe(shortAngle({ ...v }).bait);
  });
});
