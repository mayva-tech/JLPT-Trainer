/**
 * Corpus audit: structural reading / furigana / TTS alignment.
 */
import { describe, it, expect, beforeAll } from "vitest";
import {
  alignFurigana,
  seedKanjiReadingsFromDetails,
} from "./alignFurigana";
import { buildJapaneseSpeakText } from "./japaneseSpeakText";
import { vocabulary } from "../data/vocabulary";
import { grammar } from "../data/grammar";

type Case = {
  id: number;
  kind: string;
  surface: string;
  reading: string;
};

const KANJI_OR_ITER = /[\u4e00-\u9faf\u3400-\u4dbf々]/;

function cases(): Case[] {
  const out: Case[] = [];
  for (const v of vocabulary) {
    out.push({
      id: v.id,
      kind: "vocab.word",
      surface: v.word,
      reading: v.reading,
    });
    out.push({
      id: v.id,
      kind: "vocab.phrase",
      surface: v.phrase,
      reading: v.phraseReading,
    });
    out.push({
      id: v.id,
      kind: "vocab.sentence",
      surface: v.sentence,
      reading: v.sentenceReading,
    });
  }
  for (const g of grammar) {
    out.push({
      id: g.id,
      kind: "grammar.pattern",
      surface: g.pattern,
      reading: g.patternReading,
    });
    out.push({
      id: g.id,
      kind: "grammar.sentence",
      surface: g.sentence,
      reading: g.sentenceReading,
    });
  }
  return out;
}

describe("corpus alignment audit", () => {
  beforeAll(() => {
    for (const item of vocabulary) {
      seedKanjiReadingsFromDetails(item.kanjiDetails);
    }
  });

  const all = cases();

  it("reconstructs surface from alignFurigana segments", () => {
    const bad: string[] = [];
    for (const c of all) {
      if (!c.reading.trim()) continue;
      const segs = alignFurigana(c.surface, c.reading);
      const rebuilt = segs.map((s) => s.text).join("");
      if (rebuilt !== c.surface) {
        bad.push(
          `${c.kind}#${c.id}: surface="${c.surface}" rebuilt="${rebuilt}"`
        );
      }
    }
    if (bad.length) console.log(bad.slice(0, 40).join("\n"));
    expect(bad).toEqual([]);
  });

  it("has no space before sentence punctuation in readings", () => {
    const bad: string[] = [];
    for (const c of all) {
      if (/ [、。！？．，!?]/.test(c.reading)) {
        bad.push(`${c.kind}#${c.id}: ${c.reading}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("vocab headword readings are single tokens (no spaces)", () => {
    const bad: string[] = [];
    for (const c of all) {
      if (c.kind !== "vocab.word") continue;
      if (/\s/.test(c.reading.trim())) {
        bad.push(`#${c.id} ${c.surface} → ${c.reading}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("spoken token count matches reading token count", () => {
    const bad: string[] = [];
    for (const c of all) {
      const rToks = c.reading.trim().split(/\s+/).filter(Boolean);
      if (!rToks.length) continue;
      const spoken = buildJapaneseSpeakText(c.surface, c.reading);
      const sToks = spoken.trim().split(/\s+/).filter(Boolean);
      if (sToks.length !== rToks.length) {
        bad.push(
          `${c.kind}#${c.id}: reading=${rToks.length} spoken=${sToks.length} | ${c.reading} → ${spoken}`
        );
      }
    }
    if (bad.length) console.log(bad.slice(0, 30).join("\n"));
    expect(bad).toEqual([]);
  });

  it("assigns furigana to every kanji / 々 segment", () => {
    const missing: string[] = [];
    for (const c of all) {
      if (!c.reading.trim()) continue;
      const segs = alignFurigana(c.surface, c.reading);
      for (const seg of segs) {
        if (![...seg.text].some((ch) => KANJI_OR_ITER.test(ch))) continue;
        if (!seg.reading) {
          missing.push(
            `${c.kind}#${c.id}: 「${seg.text}」 in 「${c.surface}」 / ${c.reading}`
          );
        }
      }
    }
    if (missing.length) {
      console.log(`kanji without ruby: ${missing.length}`);
      console.log(missing.join("\n"));
    }
    expect(missing).toEqual([]);
  });
});
