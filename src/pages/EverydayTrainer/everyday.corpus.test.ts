import { describe, expect, it } from "vitest";
import { EVERYDAY_ART, resolveArt } from "./art/registry";
import {
  EVERYDAY_CATEGORIES,
  EVERYDAY_WORDS,
  plainJapanese,
  plainReading,
  wordById,
  wordRomaji,
  wordsInCategory,
} from "./everydayData";
import { OVERLAP_IDS } from "./everydayQuiz";
import { PHOTO_CREDITS } from "./data.generated";

const KANJI = "\\u4E00-\\u9FAF\\u3400-\\u4DBF\\u3005\\u3006\\u30F6";
const RUBY = new RegExp(`([${KANJI}]+)\\(([^()]+)\\)`, "g");
const BARE_KANJI = new RegExp(`[${KANJI}]`);
const KANA = /^[ぁ-ゖァ-ヺー ]+$/;
const LEVELS = new Set(["N5", "N4", "N3", "N2", "N1", "unclassified"]);

/** Emoji added in Unicode 14+ — Windows 10 can't draw these (same rule as the player's pictures). */
const NEW_EMOJI = [
  [0x1f6dd, 0x1f6df],
  [0x1f7f0, 0x1f7f0],
  [0x1fa75, 0x1fa77],
  [0x1fa7b, 0x1fa7c],
  [0x1fa87, 0x1fa88],
  [0x1faa9, 0x1faaf],
  [0x1fab7, 0x1fabf],
  [0x1fac3, 0x1facf],
  [0x1fad7, 0x1fadb],
  [0x1fae0, 0x1fae8],
  [0x1faf0, 0x1faf8],
] as const;

describe("Everyday Japanese corpus", () => {
  it("has the 18 starting locations, each with at least 20 words", () => {
    expect(EVERYDAY_CATEGORIES).toHaveLength(18);
    for (const c of EVERYDAY_CATEGORIES) {
      expect(wordsInCategory(c.id).length, c.id).toBeGreaterThanOrEqual(20);
    }
  });

  it("has unique ids and unique Japanese spellings (one canonical record per word)", () => {
    const ids = EVERYDAY_WORDS.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
    const spellings = EVERYDAY_WORDS.map(plainJapanese);
    expect(new Set(spellings).size).toBe(spellings.length);
  });

  it("references only real categories, with shared words listed once", () => {
    const known = new Set(EVERYDAY_CATEGORIES.map((c) => c.id));
    for (const w of EVERYDAY_WORDS) {
      expect(w.categoryIds.length, w.id).toBeGreaterThan(0);
      expect(new Set(w.categoryIds).size, w.id).toBe(w.categoryIds.length);
      for (const c of w.categoryIds) expect(known.has(c), `${w.id} → ${c}`).toBe(true);
    }
    // The example from the brief: one エレベーター record in several places.
    expect(wordById("elevator")?.categoryIds).toEqual(
      expect.arrayContaining(["apartment", "airport", "hospital", "mall"]),
    );
  });

  it("has furigana on every kanji, spelling out exactly the reading", () => {
    for (const w of EVERYDAY_WORDS) {
      const rest = w.japanese.replace(RUBY, "");
      expect(BARE_KANJI.test(rest), `${w.id}: bare kanji in ${w.japanese}`).toBe(false);
      expect(KANA.test(w.reading), `${w.id}: reading must be kana`).toBe(true);
      if (/[A-Za-z]/.test(plainJapanese(w))) {
        expect(w.romaji, `${w.id}: Latin letters need a romaji override`).toBeTruthy();
      } else {
        expect(w.japanese.replace(RUBY, "$2"), w.id).toBe(plainReading(w));
      }
    }
  });

  it("derives clean Hepburn romaji for every word", () => {
    for (const w of EVERYDAY_WORDS) {
      expect(wordRomaji(w), `${w.id}: ${w.reading}`).toMatch(/^[a-zāīūēō' -]+$/i);
    }
  });

  it("only uses listed JLPT levels or 'unclassified'", () => {
    for (const w of EVERYDAY_WORDS) expect(LEVELS.has(w.jlptLevel), w.id).toBe(true);
  });

  it("keeps cards short: English and an optional one-line nuance", () => {
    for (const w of EVERYDAY_WORDS) {
      expect(w.english.trim(), w.id).not.toBe("");
      if (w.nuance) expect(w.nuance.length, `${w.id} nuance`).toBeLessThanOrEqual(140);
    }
  });

  it("resolves every picture, uses each picture once, and avoids new emoji", () => {
    const seen = new Map<string, string>();
    for (const w of EVERYDAY_WORDS) {
      if (!w.picture) continue;
      expect(seen.has(w.picture), `${w.id} reuses ${w.picture} (${seen.get(w.picture)})`).toBe(false);
      seen.set(w.picture, w.id);
      if (w.picture.startsWith("svg:")) {
        expect(resolveArt(w.picture.slice(4)), `${w.id}: ${w.picture}`).toBeDefined();
      } else if (w.picture.startsWith("photo:")) {
        expect(PHOTO_CREDITS[w.picture.slice(6)], `${w.id}: photo needs credits`).toBeDefined();
      } else {
        for (const ch of w.picture) {
          const cp = ch.codePointAt(0)!;
          const tooNew = NEW_EMOJI.some(([a, b]) => cp >= a && cp <= b);
          expect(tooNew, `${w.id}: ${w.picture} is Unicode 14+`).toBe(false);
        }
      }
    }
  });

  it("uses every drawing made for this trainer", () => {
    const used = new Set(EVERYDAY_WORDS.map((w) => w.picture).filter((p) => p?.startsWith("svg:")));
    for (const id of Object.keys(EVERYDAY_ART)) expect(used.has(`svg:${id}`), `unused drawing ${id}`).toBe(true);
  });

  it("gives every location a pictured cover word that belongs to it", () => {
    for (const c of EVERYDAY_CATEGORIES) {
      const cover = wordById(c.coverWordId);
      expect(cover?.picture, c.id).toBeTruthy();
      expect(cover?.categoryIds, c.id).toContain(c.id);
    }
  });

  it("only names real words in the quiz overlap lists", () => {
    for (const id of OVERLAP_IDS) expect(wordById(id), `overlap list names unknown word ${id}`).toBeDefined();
  });

  it("includes the street, apartment and train words from the brief", () => {
    for (const jp of ["縁石", "ガードレール", "マンホール", "排水溝", "横断歩道", "歩道橋", "電柱"]) {
      expect(EVERYDAY_WORDS.some((w) => plainJapanese(w) === jp), jp).toBe(true);
    }
    for (const jp of ["玄関", "郵便受け", "宅配ボックス", "インターホン", "ベランダ", "網戸", "換気扇", "給湯器"]) {
      expect(EVERYDAY_WORDS.some((w) => plainJapanese(w) === jp), jp).toBe(true);
    }
    for (const jp of ["つり革", "手すり", "優先席", "改札口", "券売機", "ホーム", "車両", "網棚"]) {
      expect(EVERYDAY_WORDS.some((w) => plainJapanese(w) === jp), jp).toBe(true);
    }
  });
});
