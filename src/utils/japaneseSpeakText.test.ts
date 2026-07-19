import { describe, expect, it } from "vitest";
import { buildJapaneseSpeakText } from "./japaneseSpeakText";
import { vocabulary } from "../data/vocabulary";
import { grammar } from "../data/grammar";

describe("buildJapaneseSpeakText", () => {
  it("reads 間に as まに (not あいだに)", () => {
    const surface = "終電に間に合いませんでした。";
    const reading = "しゅうでん に ま に あいません でした。";
    const spoken = buildJapaneseSpeakText(surface, reading);
    expect(spoken).toContain("ま に");
    expect(spoken).not.toContain("あいだ");
    expect(spoken.startsWith("しゅうでん に ま に")).toBe(true);
  });

  it("returns surface when reading is missing", () => {
    expect(buildJapaneseSpeakText("終電", null)).toBe("終電");
    expect(buildJapaneseSpeakText("終電", "  ")).toBe("終電");
  });

  it("reads topic particle は as わ with a token break before the next word", () => {
    const spoken = buildJapaneseSpeakText(
      "その記事は来月号に掲載される予定だ。",
      "その きじ は らいげつごう に けいさい される よてい だ。"
    );
    expect(spoken).toContain("きじ わ らいげつごう");
    expect(spoken).not.toContain("わらいげつ");
    expect(spoken).not.toContain("はらいげつ");
  });

  it("reads 焦りは with particle わ and keeps もと", () => {
    const spoken = buildJapaneseSpeakText(
      "焦りは失敗のもとだとよく言われる。",
      "あせり は しっぱい の もと だ と よく いわれる。"
    );
    expect(spoken.startsWith("あせり わ")).toBe(true);
    expect(spoken).toContain("もと");
  });

  it("does not rewrite は inside words like はる / はず / はじめ / はん", () => {
    expect(
      buildJapaneseSpeakText(
        "春とはいえ、まだ朝は寒い。",
        "はる とはいえ、まだ あさ は さむい。"
      )
    ).toMatch(/^はる とわいえ/);
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

  it("expands ー so ストーリー / すとーりー keeps long vowels in TTS", () => {
    expect(
      buildJapaneseSpeakText(
        "この映画、子供っぽいストーリーだけど面白い。",
        "この えいが、こどもっぽい すとーりー だけど おもしろい。"
      )
    ).toContain("すとおりい");
    expect(buildJapaneseSpeakText("ストーリー", "すとーりー")).toBe(
      "すとおりい"
    );
    expect(buildJapaneseSpeakText("スマートフォン", "すまーとふぉん")).toBe(
      "すまあとふぉん"
    );
  });

  it("keeps content は (はくさん / りはーさる / はなし), not particle rewrite", () => {
    expect(
      buildJapaneseSpeakText(
        "富士山が白い雪で覆われることから、白山とも呼ばれていた。",
        "ふじさん が しろい ゆき で おおわれる こと から、はくさん とも よばれて いた。"
      )
    ).toContain("はくさん");
    expect(
      buildJapaneseSpeakText(
        "開会式に先立って、リハーサルが行われた。",
        "かいかいしき に さきだって、りはーさる が おこなわれた。"
      )
    ).toContain("りはあさる");
    expect(
      buildJapaneseSpeakText(
        "彼の話を聞いて、笑わないではいられなかった。",
        "かれ の はなし を きいて、わらわない では いられなかった。"
      )
    ).toContain("はなし");
  });

  it("keeps token spaces around every particle so TTS does not blend", () => {
    const spoken = buildJapaneseSpeakText(
      "その記事は来月号に掲載される予定だ。",
      "その きじ は らいげつごう に けいさい される よてい だ。"
    );
    expect(spoken.split(/\s+/)).toEqual([
      "その",
      "きじ",
      "わ",
      "らいげつごう",
      "に",
      "けいさい",
      "される",
      "よてい",
      "だ。",
    ]);
  });

  it("keeps へや but reads directional へ as え", () => {
    expect(buildJapaneseSpeakText("部屋", "へや")).toBe("へや");
    expect(
      buildJapaneseSpeakText("学校へ行く", "がっこう へ いく")
    ).toContain("がっこう え いく");
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
        .join(" ");
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
    ).toContain("じしん わ まだ");
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

  it("never glues standalone particle は into the next token", () => {
    const failures: string[] = [];
    for (const c of cases) {
      const tokens = c.reading.trim().split(/\s+/).filter(Boolean);
      const hasLoneHa = tokens.some(
        (t) => t.replace(/[、。！？．，!?,]+/g, "") === "は"
      );
      if (!hasLoneHa) continue;
      const spoken = buildJapaneseSpeakText(c.surface, c.reading);
      const spokenToks = spoken.split(/\s+/);
      const waIdx = spokenToks.findIndex(
        (t) => t.replace(/[、。！？．，!?,]+/g, "") === "わ"
      );
      if (waIdx < 0) {
        failures.push(`no わ token: ${c.kind}#${c.id} ${spoken}`);
        continue;
      }
      // Particle must be its own token (not わらいげつ…)
      const waTok = spokenToks[waIdx]!.replace(/[、。！？．，!?,]+/g, "");
      if (waTok !== "わ") {
        failures.push(`glued わ: ${c.kind}#${c.id} ${spokenToks[waIdx]}`);
      }
    }
    expect(failures).toEqual([]);
  });

  it("does not rewrite content-word は (はく / はー / はな)", () => {
    const failures: string[] = [];
    for (const c of cases) {
      const spoken = buildJapaneseSpeakText(c.surface, c.reading);
      for (const bad of ["わくさん", "りわーさる", "わなし"]) {
        if (spoken.includes(bad)) {
          failures.push(`${c.kind}#${c.id}: ${bad} in ${spoken}`);
        }
      }
    }
    expect(failures).toEqual([]);
  });
});
