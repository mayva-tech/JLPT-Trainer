import { describe, expect, it } from "vitest";
import {
  activeHighlightUnits,
  buildEnglishHighlightUnits,
  buildEnglishSpokenKaraokeSteps,
  buildJapaneseHighlightUnits,
  buildJapaneseSpokenKaraokeSteps,
  estimateUnitDurationMs,
  findUnitForBoundary,
} from "./speechHighlightUnits";

describe("buildEnglishHighlightUnits", () => {
  it("keeps punctuation with words and skips spaces as active units", () => {
    const units = buildEnglishHighlightUnits("Check the inventory.");
    const active = activeHighlightUnits(units);
    expect(active.map((u) => u.text)).toEqual([
      "Check",
      "the",
      "inventory.",
    ]);
    expect(units.some((u) => u.kind === "space")).toBe(true);
  });

  it("keeps contractions and hyphens as single words", () => {
    const active = activeHighlightUnits(
      buildEnglishHighlightUnits("It's out-of-stock.")
    );
    expect(active.map((u) => u.text)).toEqual(["It's", "out-of-stock."]);
  });

  it("handles abbreviations and numbers", () => {
    const active = activeHighlightUnits(
      buildEnglishHighlightUnits("Please review item No. 12.")
    );
    expect(active.map((u) => u.text)).toEqual([
      "Please",
      "review",
      "item",
      "No.",
      "12.",
    ]);
  });

  it("keeps sentence punctuation with the preceding word", () => {
    const active = activeHighlightUnits(
      buildEnglishHighlightUnits("Good question. Let me think.")
    );
    expect(active.map((u) => u.text)).toEqual([
      "Good",
      "question.",
      "Let",
      "me",
      "think.",
    ]);
  });

  it("normalizes char indices to complete display units", () => {
    const units = buildEnglishHighlightUnits("Check the inventory.");
    const mid = "Check ".length + 1; // inside "the"
    const h = findUnitForBoundary(units, mid);
    expect(h).toEqual({ start: 6, end: 9 });
  });
});

describe("buildEnglishSpokenKaraokeSteps", () => {
  it("skips parenthetical notes that TTS does not speak", () => {
    const steps = buildEnglishSpokenKaraokeSteps(
      "on the occasion of; at the time of (formal)"
    );
    expect(steps.map((s) => s.text)).toEqual([
      "on",
      "the",
      "occasion",
      "of;",
      "at",
      "the",
      "time",
      "of",
    ]);
    expect(steps.some((s) => s.text.includes("formal"))).toBe(false);
  });

  it("turns slot ~ into a pause on the previous word", () => {
    const steps = buildEnglishSpokenKaraokeSteps("not only ~ but also");
    expect(steps.map((s) => s.text)).toEqual([
      "not",
      "only",
      "but",
      "also",
    ]);
    const only = steps.find((s) => s.text === "only");
    expect(only?.spokenText).toMatch(/,$/);
  });
});

describe("buildJapaneseHighlightUnits", () => {
  it("produces word-like units for a simple sentence", () => {
    const units = buildJapaneseHighlightUnits("在庫を確認します。");
    const active = activeHighlightUnits(units);
    expect(active.length).toBeGreaterThan(1);
    expect(active.every((u) => u.end > u.start)).toBe(true);
    // Full surface coverage without gaps (allowing attached punct)
    const joined = units.map((u) => u.text).join("");
    expect(joined).toBe("在庫を確認します。");
  });

  it("covers 品切れ sentence", () => {
    const text = "この商品は品切れです。";
    const units = buildJapaneseHighlightUnits(text);
    expect(units.map((u) => u.text).join("")).toBe(text);
    expect(activeHighlightUnits(units).length).toBeGreaterThan(1);
  });

  it("handles comma pause without a huge punct-only active span", () => {
    const text = "明日、管理会社に連絡します。";
    const active = activeHighlightUnits(buildJapaneseHighlightUnits(text));
    const punctOnly = active.filter((u) => u.kind === "punctuation");
    // Punctuation should be attached to words when possible
    expect(punctOnly.length).toBeLessThanOrEqual(1);
    expect(active.some((u) => u.text.includes("明日"))).toBe(true);
  });

  it("handles mixed kana/kanji/katakana", () => {
    const text = "省エネの商品を選びました。";
    const units = buildJapaneseHighlightUnits(text);
    expect(units.map((u) => u.text).join("")).toBe(text);
  });

  it("keeps スマートフォン as one unit (not スマート|フォン)", () => {
    const text = "スマートフォンやタブレットといったデバイスが普及した。";
    const active = activeHighlightUnits(buildJapaneseHighlightUnits(text));
    expect(active.map((u) => u.text)).toContain("スマートフォン");
    expect(active.map((u) => u.text)).not.toContain("スマート");
    expect(active.map((u) => u.text)).not.toContain("フォン");
  });

  it("maps a char index inside a word to the whole word", () => {
    const text = "在庫を確認します。";
    const units = buildJapaneseHighlightUnits(text);
    const stock = activeHighlightUnits(units).find((u) =>
      u.text.includes("在庫")
    );
    expect(stock).toBeTruthy();
    const inside = stock!.start + 1;
    const h = findUnitForBoundary(units, inside);
    expect(h).toEqual({ start: stock!.start, end: stock!.end });
  });

  it("uses UTF-16 compatible ranges", () => {
    const text = "在庫を確認します。";
    const units = buildJapaneseHighlightUnits(text);
    for (const u of units) {
      expect(text.slice(u.start, u.end)).toBe(u.text);
    }
  });

  it("keeps はずだ as one unit so final だ is highlighted", () => {
    const text = "〜はずだ";
    const active = activeHighlightUnits(buildJapaneseHighlightUnits(text));
    expect(active.map((u) => u.text)).toEqual(["〜", "はずだ"]);
    expect(active.some((u) => u.text === "だ")).toBe(false);
  });

  it("keeps もと intact in grammar patterns (のもとで / をもとに)", () => {
    expect(
      activeHighlightUnits(buildJapaneseHighlightUnits("〜のもとで")).map(
        (u) => u.text
      )
    ).toEqual(["〜", "の", "もと", "で"]);
    expect(
      activeHighlightUnits(buildJapaneseHighlightUnits("〜をもとに")).map(
        (u) => u.text
      )
    ).toEqual(["〜", "を", "もと", "に"]);
  });

  it("keeps だから / こと / もの / かまわない from over-splitting", () => {
    expect(
      activeHighlightUnits(buildJapaneseHighlightUnits("〜ものだから")).map(
        (u) => u.text
      )
    ).toEqual(["〜", "もの", "だから"]);
    expect(
      activeHighlightUnits(buildJapaneseHighlightUnits("〜ないことには")).map(
        (u) => u.text
      )
    ).toEqual(["〜", "ないこと", "には"]);
    expect(
      activeHighlightUnits(buildJapaneseHighlightUnits("〜ものがある")).map(
        (u) => u.text
      )
    ).toEqual(["〜", "もの", "が", "ある"]);
    expect(
      activeHighlightUnits(buildJapaneseHighlightUnits("〜てもかまわない")).map(
        (u) => u.text
      )
    ).toEqual(["〜", "ても", "かまわない"]);
  });

  it("keeps きっと and だろう as whole units", () => {
    const active = activeHighlightUnits(
      buildJapaneseHighlightUnits("きっと約束を守るだろう。")
    );
    expect(active.map((u) => u.text)).toEqual([
      "きっと",
      "約束を",
      "守る",
      "だろう。",
    ]);
  });

  it("keeps もと as one unit (not も|と) and leaves quotation と", () => {
    const text = "焦りは失敗のもとだとよく言われる。";
    const active = activeHighlightUnits(buildJapaneseHighlightUnits(text));
    expect(active.map((u) => u.text)).toEqual([
      "焦りは",
      "失敗の",
      "もと",
      "だ",
      "と",
      "よく",
      "言われる。",
    ]);
  });

  it("keeps もと together in grammar-style phrases", () => {
    const under = activeHighlightUnits(
      buildJapaneseHighlightUnits("厳しい指導のもとで、技術を磨いた。")
    );
    expect(under.some((u) => u.text === "もと" || u.text.startsWith("もと"))).toBe(
      true
    );
    expect(under.some((u) => u.text === "も")).toBe(false);

    const based = activeHighlightUnits(
      buildJapaneseHighlightUnits("実話をもとに、この映画は作られた。")
    );
    expect(based.some((u) => u.text === "もと" || u.text.startsWith("もと"))).toBe(
      true
    );
  });

  it("keeps しまった as one unit so ま is not skipped", () => {
    const text = "失敗したあと少し落ち込んでしまった。";
    const active = activeHighlightUnits(buildJapaneseHighlightUnits(text));
    expect(active.map((u) => u.text)).toEqual([
      "失敗した",
      "あと",
      "少し",
      "落ち込んで",
      "しまった。",
    ]);
    const shimatta = active.find((u) => u.text.startsWith("しまった"));
    expect(shimatta).toBeTruthy();
    expect(text.slice(shimatta!.start, shimatta!.end)).toContain("ま");
  });

  it("keeps しましょう intact so final しょう is highlighted", () => {
    const text = "クイズで確認しましょう。";
    const active = activeHighlightUnits(buildJapaneseHighlightUnits(text));
    expect(active.map((u) => u.text)).toEqual([
      "クイズ",
      "で",
      "確認しましょう。",
    ]);
    const volitional = active.find((u) => u.text.includes("しましょう"));
    expect(volitional).toBeTruthy();
    expect(text.slice(volitional!.start, volitional!.end)).toContain("しょう");
  });

  it("splits embedded grammar-slot 〜 into its own unit", () => {
    const active = activeHighlightUnits(
      buildJapaneseHighlightUnits("〜ばかりか〜も")
    );
    expect(active.map((u) => u.text)).toEqual([
      "〜",
      "ばかり",
      "か",
      "〜",
      "も",
    ]);
  });
});

describe("estimateUnitDurationMs karaoke breaks", () => {
  it("gives commas and particles more dwell than plain content of similar length", () => {
    const plain = estimateUnitDurationMs(
      { start: 0, end: 2, text: "映画", kind: "word" },
      "ja"
    );
    const withComma = estimateUnitDurationMs(
      { start: 0, end: 3, text: "映画、", kind: "word" },
      "ja"
    );
    const particle = estimateUnitDurationMs(
      { start: 0, end: 1, text: "は", kind: "word" },
      "ja"
    );
    const contentMora = estimateUnitDurationMs(
      { start: 0, end: 1, text: "あ", kind: "word" },
      "ja"
    );
    expect(withComma).toBeGreaterThan(plain);
    expect(particle).toBeGreaterThan(contentMora);
  });

  it("extends dwell after topic は and subject が before the next word", () => {
    const de = estimateUnitDurationMs(
      {
        start: 0,
        end: 1,
        text: "で",
        kind: "word",
        spokenText: "で",
        speakGapAfter: true,
      },
      "ja"
    );
    const ha = estimateUnitDurationMs(
      {
        start: 0,
        end: 1,
        text: "は",
        kind: "word",
        spokenText: "わ",
        speakGapAfter: true,
      },
      "ja",
      { start: 1, end: 2, text: "彼", kind: "word" }
    );
    // が + noun-like next still gets a pause; が + verb does not
    const gaBeforeNoun = estimateUnitDurationMs(
      {
        start: 0,
        end: 1,
        text: "が",
        kind: "word",
        spokenText: "が",
        speakGapAfter: true,
      },
      "ja",
      { start: 1, end: 2, text: "彼女", kind: "word" }
    );
    expect(ha).toBeGreaterThan(de);
    expect(gaBeforeNoun).toBeGreaterThan(de);
  });

  it("extends dwell when は is glued to the prior word (筆跡は)", () => {
    const noun = estimateUnitDurationMs(
      {
        start: 0,
        end: 2,
        text: "筆跡",
        kind: "word",
        spokenText: "ひっせき",
        speakGapAfter: true,
      },
      "ja"
    );
    const nounHa = estimateUnitDurationMs(
      {
        start: 0,
        end: 3,
        text: "筆跡は",
        kind: "word",
        spokenText: "ひっせき わ",
        speakGapAfter: true,
      },
      "ja"
    );
    // Extra dwell beyond the added わ mora (~150ms) — topic pause
    expect(nounHa - noun).toBeGreaterThan(250);
  });

  it("does not add a standalone は pause to compound では", () => {
    const compound = estimateUnitDurationMs(
      {
        start: 0,
        end: 2,
        text: "では",
        kind: "word",
        spokenText: "でわ",
        speakGapAfter: true,
      },
      "ja"
    );
    const sameMoraPlain = estimateUnitDurationMs(
      {
        start: 0,
        end: 2,
        text: "でわ",
        kind: "word",
        spokenText: "でわ",
        speakGapAfter: true,
      },
      "ja"
    );
    expect(compound - sameMoraPlain).toBeLessThan(100);
  });

  it("keeps 軍配が tight with split predicate 上がっ", () => {
    const subject = {
      start: 0,
      end: 3,
      text: "軍配が",
      kind: "word" as const,
      spokenText: "ぐんばい が",
      speakGapAfter: true,
    };
    const beforePredicate = estimateUnitDurationMs(subject, "ja", {
      start: 3,
      end: 5,
      text: "上が",
      kind: "word",
      spokenText: "あがっ",
    });
    const beforeNoun = estimateUnitDurationMs(subject, "ja", {
      start: 3,
      end: 5,
      text: "選手",
      kind: "word",
      spokenText: "せんしゅ",
    });
    expect(beforePredicate).toBeLessThan(beforeNoun);
  });

  it("dwells after subject が before い-adjective 長く", () => {
    const subject = {
      start: 0,
      end: 2,
      text: "日が",
      kind: "word" as const,
      spokenText: "ひ が",
      speakGapAfter: true,
    };
    const beforeAdj = estimateUnitDurationMs(subject, "ja", {
      start: 2,
      end: 4,
      text: "長く",
      kind: "word",
      spokenText: "ながく",
    });
    const beforeVerb = estimateUnitDurationMs(subject, "ja", {
      start: 2,
      end: 5,
      text: "降らない",
      kind: "word",
      spokenText: "ふらない",
    });
    expect(beforeAdj).toBeGreaterThan(beforeVerb);
  });

  it("does not dwell after 証拠を before split 見れば", () => {
    const object = {
      start: 0,
      end: 3,
      text: "証拠を",
      kind: "word" as const,
      spokenText: "しょうこ を",
      speakGapAfter: true,
    };
    const beforeMireba = estimateUnitDurationMs(object, "ja", {
      start: 3,
      end: 4,
      text: "見",
      kind: "word",
      spokenText: "みれ",
    });
    const beforeNoun = estimateUnitDurationMs(object, "ja", {
      start: 3,
      end: 5,
      text: "証言",
      kind: "word",
      spokenText: "しょうげん",
    });
    expect(beforeMireba).toBeLessThan(beforeNoun);
  });

  it("extends dwell after object を and adverbial に (日本語を / 本格的に)", () => {
    const de = estimateUnitDurationMs(
      {
        start: 0,
        end: 1,
        text: "で",
        kind: "word",
        spokenText: "で",
        speakGapAfter: true,
      },
      "ja"
    );
    const wo = estimateUnitDurationMs(
      {
        start: 0,
        end: 1,
        text: "を",
        kind: "word",
        spokenText: "を",
        speakGapAfter: true,
      },
      "ja",
      { start: 1, end: 4, text: "勉強", kind: "word" }
    );
    const ni = estimateUnitDurationMs(
      {
        start: 0,
        end: 1,
        text: "に",
        kind: "word",
        spokenText: "に",
        speakGapAfter: true,
      },
      "ja"
    );
    const nihongoWo = estimateUnitDurationMs(
      {
        start: 0,
        end: 4,
        text: "日本語を",
        kind: "word",
        spokenText: "にほんご を",
        speakGapAfter: true,
      },
      "ja",
      { start: 4, end: 8, text: "本格的に", kind: "word" }
    );
    const noun = estimateUnitDurationMs(
      {
        start: 0,
        end: 3,
        text: "日本語",
        kind: "word",
        spokenText: "にほんご",
        speakGapAfter: true,
      },
      "ja"
    );
    expect(wo).toBeGreaterThan(de);
    expect(ni).toBeGreaterThan(de);
    expect(nihongoWo - noun).toBeGreaterThan(250);
  });

  it("does not add long pause after を before きっかけに", () => {
    const beforeKikkake = estimateUnitDurationMs(
      {
        start: 0,
        end: 3,
        text: "留学を",
        kind: "word",
        spokenText: "りゅうがく を",
        speakGapAfter: true,
      },
      "ja",
      { start: 3, end: 7, text: "きっかけ", kind: "word" }
    );
    const beforeHonkaku = estimateUnitDurationMs(
      {
        start: 0,
        end: 4,
        text: "日本語を",
        kind: "word",
        spokenText: "にほんご を",
        speakGapAfter: true,
      },
      "ja",
      { start: 4, end: 8, text: "本格的に", kind: "word" }
    );
    expect(beforeHonkaku).toBeGreaterThan(beforeKikkake);
  });

  it("does not add long pause after を before governing verb (聞いて)", () => {
    const beforeVerb = estimateUnitDurationMs(
      {
        start: 0,
        end: 4,
        text: "知らせを",
        kind: "word",
        spokenText: "しらせ を",
        speakGapAfter: true,
      },
      "ja",
      { start: 4, end: 7, text: "聞いて、", kind: "word" }
    );
    const beforeAdverb = estimateUnitDurationMs(
      {
        start: 0,
        end: 4,
        text: "日本語を",
        kind: "word",
        spokenText: "にほんご を",
        speakGapAfter: true,
      },
      "ja",
      { start: 4, end: 8, text: "本格的に", kind: "word" }
    );
    expect(beforeAdverb).toBeGreaterThan(beforeVerb);
  });

  it("does not add long pause after が before predicate (あれば)", () => {
    const beforeAreba = estimateUnitDurationMs(
      {
        start: 0,
        end: 3,
        text: "お金が",
        kind: "word",
        spokenText: "おかね が",
        speakGapAfter: true,
      },
      "ja",
      { start: 3, end: 6, text: "あれば", kind: "word" }
    );
    const beforeNoun = estimateUnitDurationMs(
      {
        start: 0,
        end: 3,
        text: "お金が",
        kind: "word",
        spokenText: "おかね が",
        speakGapAfter: true,
      },
      "ja",
      { start: 3, end: 5, text: "彼女", kind: "word" }
    );
    expect(beforeNoun).toBeGreaterThan(beforeAreba);
  });

  it("does not add long pause after に before 限り", () => {
    const beforeKagiri = estimateUnitDurationMs(
      {
        start: 0,
        end: 3,
        text: "本日に",
        kind: "word",
        spokenText: "ほんじつ に",
        speakGapAfter: true,
      },
      "ja",
      { start: 3, end: 5, text: "限り、", kind: "word" }
    );
    const beforeBenkyou = estimateUnitDurationMs(
      {
        start: 0,
        end: 4,
        text: "本格的に",
        kind: "word",
        spokenText: "ほんかくてき に",
        speakGapAfter: true,
      },
      "ja",
      { start: 4, end: 6, text: "勉強", kind: "word" }
    );
    expect(beforeBenkyou).toBeGreaterThan(beforeKagiri);
  });

  it("times Japanese units from spoken kana, not kanji glyph weight", () => {
    const byKanji = estimateUnitDurationMs(
      { start: 0, end: 2, text: "妊娠", kind: "word" },
      "ja"
    );
    const byReading = estimateUnitDurationMs(
      {
        start: 0,
        end: 2,
        text: "妊娠",
        kind: "word",
        spokenText: "にんしん",
      },
      "ja"
    );
    // にんしん = 4 mora > 2×1.6 kanji heuristic
    expect(byReading).toBeGreaterThan(byKanji);
  });

  it("adds dwell for speakGapAfter (TTS token spaces)", () => {
    const plain = estimateUnitDurationMs(
      { start: 0, end: 3, text: "友人", kind: "word", spokenText: "ゆうじん" },
      "ja"
    );
    const withGap = estimateUnitDurationMs(
      {
        start: 0,
        end: 3,
        text: "友人",
        kind: "word",
        spokenText: "ゆうじん",
        speakGapAfter: true,
      },
      "ja"
    );
    expect(withGap).toBeGreaterThan(plain);
  });
});

describe("buildJapaneseSpokenKaraokeSteps", () => {
  function expectAllVisibleWordUnitsCovered(
    surface: string,
    reading: string
  ) {
    const units = activeHighlightUnits(
      buildJapaneseHighlightUnits(surface)
    ).filter((unit) => unit.kind === "word");
    const steps = buildJapaneseSpokenKaraokeSteps(surface, reading);

    for (const unit of units) {
      expect(
        steps.some(
          (step) => step.start === unit.start && step.end === unit.end
        ),
        `missing highlight for 「${unit.text}」 in 「${surface}」`
      ).toBe(true);
    }

    for (let i = 1; i < steps.length; i++) {
      expect(steps[i]!.start).toBeGreaterThanOrEqual(steps[i - 1]!.start);
    }
  }

  it("maps reading tokens onto surface highlight spans", async () => {
    const { seedKanjiReadingsFromDetails } = await import("./alignFurigana");
    const { vocabulary } = await import("../data/vocabulary");
    for (const item of vocabulary) {
      seedKanjiReadingsFromDetails(item.kanjiDetails);
    }

    const surface = "友人は先月、妊娠が分かったそうだ。";
    const reading =
      "ゆうじん は せんげつ、にんしん が わかった そう だ。";
    const steps = buildJapaneseSpokenKaraokeSteps(surface, reading);
    expect(steps.length).toBeGreaterThan(3);
    expect(steps.some((s) => s.spokenText.includes("にんしん"))).toBe(true);
    // Topic particle becomes わ in TTS (own step or glued onto prior unit)
    expect(steps.some((s) => s.spokenText.includes("わ"))).toBe(true);
    expectAllVisibleWordUnitsCovered(surface, reading);
  });

  it("covers every visible unit when one reading token spans multiple kana units", () => {
    const surface = "ということだ";
    const reading = "ということだ";
    const units = activeHighlightUnits(buildJapaneseHighlightUnits(surface));
    const steps = buildJapaneseSpokenKaraokeSteps(surface, reading);
    expect(units.length).toBeGreaterThan(1);
    expectAllVisibleWordUnitsCovered(surface, reading);
    const reconstructed = steps
      .map((s) => s.spokenText)
      .join("")
      .replace(/\s+/g, "");
    expect(reconstructed).toBe("ということだ");
  });

  it("covers grammar expression with kanji (〜を余儀なくされる)", async () => {
    const { seedKanjiReadingsFromDetails } = await import("./alignFurigana");
    const { vocabulary } = await import("../data/vocabulary");
    for (const item of vocabulary) {
      seedKanjiReadingsFromDetails(item.kanjiDetails);
    }
    // Seed 余 / 儀 if present in grammar-related vocab; also register manually via align
    seedKanjiReadingsFromDetails([
      { character: "余", onyomi: ["ヨ"], kunyomi: ["あま・る"] },
      { character: "儀", onyomi: ["ギ"] },
    ]);

    const surface = "〜を余儀なくされる";
    const reading = "〜を よぎなく される";
    expectAllVisibleWordUnitsCovered(surface, reading);
    const steps = buildJapaneseSpokenKaraokeSteps(surface, reading);
    expect(steps.some((s) => s.spokenText.includes("よぎ"))).toBe(true);
    expect(steps.some((s) => s.spokenText.includes("される"))).toBe(true);
  });

  it("covers connected grammar phrase (〜わけにはいかない)", () => {
    const surface = "〜わけにはいかない";
    const reading = "〜わけには いかない";
    expectAllVisibleWordUnitsCovered(surface, reading);
  });

  it("covers formal grammar expression (〜のいかんによらず)", () => {
    const surface = "〜のいかんによらず";
    const reading = "〜の いかん に よらず";
    expectAllVisibleWordUnitsCovered(surface, reading);
  });

  it("covers sentence word units without punctuation replacing words", async () => {
    const { seedKanjiReadingsFromDetails } = await import("./alignFurigana");
    const { vocabulary } = await import("../data/vocabulary");
    for (const item of vocabulary) {
      seedKanjiReadingsFromDetails(item.kanjiDetails);
    }

    const surface = "お金があれば幸せというわけではない。";
    const reading =
      "おかね が あれば しあわせ という わけでは ない。";
    expectAllVisibleWordUnitsCovered(surface, reading);
    const steps = buildJapaneseSpokenKaraokeSteps(surface, reading);
    expect(steps.every((s, i) => i === 0 || s.start >= steps[i - 1]!.start)).toBe(
      true
    );
  });

  it("covers している / ている units in grammar-style sentences", () => {
    const cases: Array<[string, string]> = [
      [
        "知っているくせに、知らないふりをしている。",
        "しって いる くせに、しらない ふり を して いる。",
      ],
      [
        "この学校では、制服を着ることになっている。",
        "この がっこう では、せいふく を きる こと に なって いる。",
      ],
      ["〜ことになっている", "〜ことになっている"],
      ["準備している。", "じゅんび して いる。"],
    ];
    for (const [surface, reading] of cases) {
      expectAllVisibleWordUnitsCovered(surface, reading);
      const steps = buildJapaneseSpokenKaraokeSteps(surface, reading);
      expect(
        steps.some((s) => /いる/.test(s.text) && /いる/.test(s.spokenText)),
        `いる missing spoken timing in 「${surface}」`
      ).toBe(true);
    }
  });
});
