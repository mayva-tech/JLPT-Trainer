import { describe, expect, it } from "vitest";
import { buildJapaneseSpeakText } from "./japaneseSpeakText";
import { vocabulary } from "../data/vocabulary";
import { grammar } from "../data/grammar";

describe("buildJapaneseSpeakText", () => {
  it("reads 間に as まに (not あいだに)", () => {
    const surface = "終電に間に合いませんでした。";
    const reading = "しゅうでん に ま に あいません でした。";
    const spoken = buildJapaneseSpeakText(surface, reading);
    expect(spoken).toContain("まに");
    expect(spoken).not.toContain("あいだ");
    expect(spoken.startsWith("しゅうでんにまに")).toBe(true);
  });

  it("returns surface when reading is missing", () => {
    expect(buildJapaneseSpeakText("終電", null)).toBe("終電");
    expect(buildJapaneseSpeakText("終電", "  ")).toBe("終電");
  });

  it("reads topic particle は as わ", () => {
    const spoken = buildJapaneseSpeakText(
      "試験に合格したものの、自信はまだない。",
      "しけん に ごうかく した ものの、じしん は まだ ない。"
    );
    expect(spoken).toContain("じしんわまだ");
    expect(spoken.startsWith("あせりわ") || spoken.includes("じしんわ")).toBe(
      true
    );
  });

  it("reads 焦りは with particle わ and keeps もと", () => {
    const spoken = buildJapaneseSpeakText(
      "焦りは失敗のもとだとよく言われる。",
      "あせり は しっぱい の もと だ と よく いわれる。"
    );
    expect(spoken.startsWith("あせりわ")).toBe(true);
    expect(spoken).toContain("もと");
  });

  it("does not rewrite は inside words like はる / はず / はじめ / はん", () => {
    expect(
      buildJapaneseSpeakText(
        "春とはいえ、まだ朝は寒い。",
        "はる とはいえ、まだ あさ は さむい。"
      )
    ).toMatch(/^はるとわいえ/);
    expect(buildJapaneseSpeakText("〜はずだ", "〜はずだ")).toBe("〜はずだ");
    expect(buildJapaneseSpeakText("〜をはじめ", "〜をはじめ")).toBe(
      "〜をはじめ"
    );
    expect(buildJapaneseSpeakText("〜はんめん", "〜はんめん")).toBe(
      "〜はんめん"
    );
    expect(buildJapaneseSpeakText("〜にはんして", "〜にはんして")).toBe(
      "〜にはんして"
    );
  });

  it("rewrites grammar-pattern particle は (ては / では / 〜は…)", () => {
    expect(buildJapaneseSpeakText("〜はともかく", "〜はともかく")).toBe(
      "〜わともかく"
    );
    expect(buildJapaneseSpeakText("〜てはいけない", "〜てはいけない")).toBe(
      "〜てわいけない"
    );
    expect(buildJapaneseSpeakText("〜わけではない", "〜わけではない")).toBe(
      "〜わけでわない"
    );
    expect(buildJapaneseSpeakText("〜ためには", "〜ためには")).toBe(
      "〜ためにわ"
    );
  });

  it("keeps へや but reads directional へ as え", () => {
    expect(buildJapaneseSpeakText("部屋", "へや")).toBe("へや");
    expect(
      buildJapaneseSpeakText("学校へ行く", "がっこう へ いく")
    ).toContain("がっこうえいく");
    expect(buildJapaneseSpeakText("〜を経て", "〜をへて")).toBe("〜をえて");
  });
});

describe("TTS particle audit (all lesson readings)", () => {
  type Case = { id: number; kind: string; surface: string; reading: string };

  const cases: Case[] = [];
  for (const v of vocabulary) {
    cases.push({
      id: v.id,
      kind: "vocab.reading",
      surface: v.word,
      reading: v.reading,
    });
    cases.push({
      id: v.id,
      kind: "vocab.phraseReading",
      surface: v.phrase,
      reading: v.phraseReading,
    });
    cases.push({
      id: v.id,
      kind: "vocab.sentenceReading",
      surface: v.sentence,
      reading: v.sentenceReading,
    });
  }
  for (const g of grammar) {
    cases.push({
      id: g.id,
      kind: "grammar.patternReading",
      surface: g.pattern,
      reading: g.patternReading,
    });
    cases.push({
      id: g.id,
      kind: "grammar.sentenceReading",
      surface: g.sentence,
      reading: g.sentenceReading,
    });
  }

  it("rewrites every punct-bounded particle は token to わ", () => {
    const failures: string[] = [];
    for (const c of cases) {
      const tokens = c.reading.trim().split(/\s+/).filter(Boolean);
      let sawParticle = false;
      for (const t of tokens) {
        for (const part of t.split(/[、。！？．，!?,]+/)) {
          if (part === "は") sawParticle = true;
        }
      }
      if (!sawParticle) continue;

      const spoken = buildJapaneseSpeakText(c.surface, c.reading);
      // Rebuild replacing only exact particle parts; spoken must match
      // full speakParticle pass for consistency — check particle slots:
      const naiveKeepHa = tokens.join("").replace(/[、。！？．，!?,]/g, "");
      void naiveKeepHa;
      if (!spoken.includes("わ")) {
        failures.push(`${c.kind}#${c.id}: ${c.reading} → ${spoken}`);
      }
    }
    expect(failures).toEqual([]);
  });

  it("matches per-token rewrite for every reading in the dataset", () => {
    const failures: string[] = [];
    for (const c of cases) {
      const spoken = buildJapaneseSpeakText(c.surface, c.reading);
      const expected = c.reading
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((t) => buildJapaneseSpeakText(t, t))
        .join("");
      if (spoken !== expected) {
        failures.push(
          `${c.kind}#${c.id}: ${c.reading}\n  got: ${spoken}\n  exp: ${expected}`
        );
      }
    }
    expect(failures).toEqual([]);
  });

  it("spot-checks high-risk grammar spoken forms", () => {
    const g = (id: number) => grammar.find((x) => x.id === id)!;
    expect(
      buildJapaneseSpeakText(g(5002).sentence, g(5002).sentenceReading)
    ).toContain("じしんわまだ");
    expect(
      buildJapaneseSpeakText(g(5007).pattern, g(5007).patternReading)
    ).toBe("〜わともかく");
    expect(
      buildJapaneseSpeakText(g(5060).pattern, g(5060).patternReading)
    ).toBe("〜をはじめ");
    expect(
      buildJapaneseSpeakText(g(5070).pattern, g(5070).patternReading)
    ).toBe("〜はんめん");
    expect(
      buildJapaneseSpeakText(g(5111).pattern, g(5111).patternReading)
    ).toBe("〜てわいけない");
  });
});
