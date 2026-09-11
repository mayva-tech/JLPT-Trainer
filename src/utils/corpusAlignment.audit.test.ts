/**
 * Corpus audit: structural reading / furigana / TTS alignment.
 */
import { describe, it, expect } from "vitest";
import { alignFurigana } from "./alignFurigana";
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

/** Full-corpus alignment walks are CPU-heavy under parallel suite load. */
const CORPUS_ALIGN_TIMEOUT_MS = 15_000;

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
  const all = cases();

  // One alignFurigana pass: surface round-trip + ruby on every kanji / 々.
  // Alignment seeds readings via ensureKanjiReadingsSeeded() (KANJI dictionary).
  it(
    "alignFurigana reconstructs surface and assigns ruby to every kanji / 々",
    () => {
      const badRebuild: string[] = [];
      const missingRuby: string[] = [];
      for (const c of all) {
        if (!c.reading.trim()) continue;
        const segs = alignFurigana(c.surface, c.reading);
        const rebuilt = segs.map((s) => s.text).join("");
        if (rebuilt !== c.surface) {
          badRebuild.push(
            `${c.kind}#${c.id}: surface="${c.surface}" rebuilt="${rebuilt}"`
          );
        }
        for (const seg of segs) {
          if (![...seg.text].some((ch) => KANJI_OR_ITER.test(ch))) continue;
          if (!seg.reading) {
            missingRuby.push(
              `${c.kind}#${c.id}: 「${seg.text}」 in 「${c.surface}」 / ${c.reading}`
            );
          }
        }
      }
      if (badRebuild.length) console.log(badRebuild.slice(0, 40).join("\n"));
      if (missingRuby.length) {
        console.log(`kanji without ruby: ${missingRuby.length}`);
        console.log(missingRuby.join("\n"));
      }
      expect(badRebuild).toEqual([]);
      expect(missingRuby).toEqual([]);
    },
    CORPUS_ALIGN_TIMEOUT_MS
  );

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
});
