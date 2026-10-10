/**
 * Builds src/pages/EverydayTrainer/data.generated.ts from scripts/everyday/*.tsv
 *
 *   node scripts/generateEveryday.mjs
 *
 * Sources (pipe-delimited, `#` lines are comments; column notes are at the top
 * of each file):
 *   scripts/everyday/categories.tsv   location categories (grid order)
 *   scripts/everyday/words.tsv        one canonical record per word
 *   scripts/everyday/credits.tsv      attribution for photo:<file> pictures
 *
 * The generator refuses to write anything when the data is inconsistent, so a
 * broken row can never reach the app:
 *   - ids unique, categories known, every category has at least MIN_PER_CATEGORY words
 *   - furigana covers every kanji and spells out exactly the given reading
 *   - readings are kana only; Latin-letter words (ATM) must give romaji
 *   - a picture belongs to one word only; photos need a credits row
 *
 * JLPT level is looked up in scripts/levels/jlptWordLevels.tsv (the same list
 * the vocabulary course uses). Words not on it get "unclassified" — never a
 * guessed level.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SOURCE_DIR = join(here, "everyday");
const LEVELS_TSV = join(here, "levels", "jlptWordLevels.tsv");
const OUT = join(here, "..", "src", "pages", "EverydayTrainer", "data.generated.ts");

export const MIN_PER_CATEGORY = 20;

const KANJI = "\\u4E00-\\u9FAF\\u3400-\\u4DBF\\u3005\\u3006\\u30F6";
const RUBY_RE = new RegExp(`([${KANJI}]+)\\(([^()]+)\\)`, "g");
const BARE_KANJI = new RegExp(`[${KANJI}]`);
/** Hiragana, katakana, prolonged sound mark, middle dot. */
const KANA_ONLY = /^[ぁ-ゖァ-ヺー・ ]+$/;
const LATIN = /[A-Za-z]/;
const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const LEVELS = ["N5", "N4", "N3", "N2", "N1"];
const BACKDROPS = new Set([
  "home",
  "office",
  "clinic",
  "restaurant",
  "hotel",
  "station",
  "konbini",
  "street",
  "cafe",
  "counter",
]);

function rows(file) {
  const path = join(SOURCE_DIR, file);
  if (!existsSync(path)) return [];
  const out = [];
  for (const [i, raw] of readFileSync(path, "utf8").split("\n").entries()) {
    const line = raw.replace(/\r$/, "");
    if (!line.trim() || line.startsWith("#")) continue;
    out.push({ where: `${file}:${i + 1}`, parts: line.split("|").map((s) => s.trim()) });
  }
  return out;
}

function fail(where, message) {
  throw new Error(`${where}: ${message}`);
}

function toHiragana(text) {
  return text.replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

/** 改札口(かいさつぐち) → 改札口 */
function stripFurigana(text) {
  return text.replace(RUBY_RE, "$1");
}

/** 改札口(かいさつぐち) → かいさつぐち */
function furiganaToKana(text) {
  return text.replace(RUBY_RE, "$2");
}

/* ---- JLPT reference list ---- */

function normalizeListForm(text) {
  return text
    .replace(/\([^()]*\)|（[^（）]*）/g, "")
    .replace(/[〜～~]/g, "")
    .trim();
}

function loadLevels() {
  const byKey = new Map();
  for (const raw of readFileSync(LEVELS_TSV, "utf8").split("\n")) {
    const line = raw.replace(/\r$/, "");
    if (!line.trim() || line.startsWith("#")) continue;
    const [wordField, readingField, level] = line.split("|");
    if (!LEVELS.includes(level)) continue;
    const words = wordField.split(/[,、]/).map(normalizeListForm).filter(Boolean);
    const readings = readingField.split(/[,、]/).map(normalizeListForm).filter(Boolean);
    for (const w of words) {
      for (const r of readings) {
        const key = `${w}|${toHiragana(r)}`;
        const prev = byKey.get(key);
        // A word on several lists keeps its easiest level (same rule as the course).
        if (!prev || LEVELS.indexOf(level) < LEVELS.indexOf(prev)) byKey.set(key, level);
      }
    }
  }
  return byKey;
}

/* ---- categories ---- */

const categories = rows("categories.tsv").map(({ where, parts }) => {
  if (parts.length !== 6) fail(where, `expected 6 fields, got ${parts.length}`);
  const [id, english, japanese, cover, backdrop, ambience] = parts;
  if (!ID_RE.test(id)) fail(where, `bad id "${id}"`);
  if (!english || !japanese) fail(where, "missing name");
  if (BARE_KANJI.test(japanese.replace(RUBY_RE, ""))) fail(where, `missing furigana in ${japanese}`);
  if (!BACKDROPS.has(backdrop)) fail(where, `unknown backdrop "${backdrop}"`);
  // The theme id itself is checked against AMBIENCE_THEMES by everyday.corpus.test.ts.
  if (!/^[a-zA-Z]+$/.test(ambience ?? "")) fail(where, `bad ambience "${ambience}"`);
  return { where, id, english, japanese, cover, backdrop, ambience };
});
const categoryIds = new Set();
for (const c of categories) {
  if (categoryIds.has(c.id)) fail(c.where, `duplicate category ${c.id}`);
  categoryIds.add(c.id);
}

/* ---- photo credits ---- */

const credits = new Map();
for (const { where, parts } of rows("credits.tsv")) {
  if (parts.length !== 4) fail(where, `expected 4 fields, got ${parts.length}`);
  const [file, author, license, source] = parts;
  if (!file || !author || !license || !source) fail(where, "every credit field is required");
  credits.set(file, { author, license, source });
}

/* ---- words ---- */

const levels = loadLevels();
const seenIds = new Set();
const seenPictures = new Map();
const words = rows("words.tsv").map(({ where, parts }) => {
  if (parts.length !== 9) fail(where, `expected 9 fields, got ${parts.length}`);
  const [id, japanese, reading, english, pos, picture, cats, nuance, romaji] = parts;
  if (!ID_RE.test(id)) fail(where, `bad id "${id}"`);
  if (seenIds.has(id)) fail(where, `duplicate id ${id}`);
  seenIds.add(id);
  if (!japanese || !reading || !english || !pos) fail(where, "japanese, reading, english and pos are required");

  const remainder = japanese.replace(RUBY_RE, "");
  if (BARE_KANJI.test(remainder)) fail(where, `missing furigana in ${japanese}`);
  if (/[()]/.test(remainder)) fail(where, `stray parenthesis in ${japanese}`);
  if (!KANA_ONLY.test(reading)) fail(where, `reading must be kana only: "${reading}"`);
  if (/ {2}|^ | $/.test(reading)) fail(where, `reading has stray spaces: "${reading}"`);

  const surface = stripFurigana(japanese);
  if (LATIN.test(surface)) {
    if (!romaji) fail(where, `${surface} contains Latin letters, so it needs a romaji override`);
  } else if (furiganaToKana(japanese) !== reading.replace(/ /g, "")) {
    fail(where, `reading "${reading}" does not match furigana ${japanese} (${furiganaToKana(japanese)})`);
  }

  if (picture) {
    if (seenPictures.has(picture)) fail(where, `picture ${picture} is already used by ${seenPictures.get(picture)}`);
    seenPictures.set(picture, id);
    if (picture.startsWith("photo:")) {
      const file = picture.slice(6);
      if (!credits.has(file)) fail(where, `photo ${file} has no row in credits.tsv`);
      if (!existsSync(join(here, "..", "public", "everyday", file))) fail(where, `photo ${file} is missing from public/everyday/`);
    } else if (picture.startsWith("svg:")) {
      if (!ID_RE.test(picture.slice(4))) fail(where, `bad svg id "${picture}"`);
    } else if (/[ -~]/.test(picture) || [...picture.replace(/\uFE0F/g, "")].length > 2) {
      fail(where, `picture must be one emoji, svg:<id> or photo:<file>: "${picture}"`);
    }
  }

  if (nuance) {
    const rest = nuance.replace(RUBY_RE, "");
    if (BARE_KANJI.test(rest)) fail(where, `nuance has kanji without furigana: ${nuance}`);
    if (nuance.length > 140) fail(where, "nuance is longer than one short line (140 chars)");
  }

  const categoryList = cats.split(",").map((s) => s.trim()).filter(Boolean);
  if (categoryList.length === 0) fail(where, "at least one category is required");
  for (const c of categoryList) if (!categoryIds.has(c)) fail(where, `unknown category "${c}"`);
  if (new Set(categoryList).size !== categoryList.length) fail(where, "category listed twice");

  const level = levels.get(`${surface}|${toHiragana(reading.replace(/ /g, ""))}`) ?? "unclassified";

  return {
    id,
    japanese,
    reading,
    english,
    partOfSpeech: pos,
    picture: picture || null,
    categoryIds: categoryList,
    nuance: nuance || null,
    romaji: romaji || null,
    jlptLevel: level,
  };
});

/* ---- cross checks ---- */

const byId = new Map(words.map((w) => [w.id, w]));
for (const c of categories) {
  const count = words.filter((w) => w.categoryIds.includes(c.id)).length;
  if (count < MIN_PER_CATEGORY) fail(c.where, `${c.id} has ${count} words; at least ${MIN_PER_CATEGORY} are required`);
  const cover = byId.get(c.cover);
  if (!cover) fail(c.where, `cover word "${c.cover}" does not exist`);
  if (!cover.picture) fail(c.where, `cover word "${c.cover}" has no picture`);
  if (!cover.categoryIds.includes(c.id)) fail(c.where, `cover word "${c.cover}" is not in ${c.id}`);
}

/* ---- write ---- */

const json = (value) => JSON.stringify(value);
const categoryLines = categories.map(
  (c) =>
    `  { id: ${json(c.id)}, english: ${json(c.english)}, japanese: ${json(c.japanese)}, coverWordId: ${json(c.cover)}, backdrop: ${json(c.backdrop)}, ambience: ${json(c.ambience)} },`,
);
const wordLines = words.map(
  (w) =>
    `  { id: ${json(w.id)}, japanese: ${json(w.japanese)}, reading: ${json(w.reading)}, english: ${json(w.english)}, partOfSpeech: ${json(w.partOfSpeech)}, picture: ${json(w.picture)}, categoryIds: ${json(w.categoryIds)}, nuance: ${json(w.nuance)}, romaji: ${json(w.romaji)}, jlptLevel: ${json(w.jlptLevel)} },`,
);
const creditLines = [...credits].map(
  ([file, c]) => `  ${json(file)}: { author: ${json(c.author)}, license: ${json(c.license)}, source: ${json(c.source)} },`,
);

const out = `// GENERATED by scripts/generateEveryday.mjs — edit scripts/everyday/*.tsv and re-run.
import type { EverydayCategory, EverydayWord, PhotoCredit } from "./types";

export const EVERYDAY_CATEGORIES: readonly EverydayCategory[] = [
${categoryLines.join("\n")}
];

export const EVERYDAY_WORDS: readonly EverydayWord[] = [
${wordLines.join("\n")}
];

/** Attribution for photo:<file> pictures (public/everyday/<file>). */
export const PHOTO_CREDITS: Readonly<Record<string, PhotoCredit>> = {
${creditLines.join("\n")}
};
`;

writeFileSync(OUT, out, "utf8");

const pictured = words.filter((w) => w.picture).length;
const leveled = words.filter((w) => w.jlptLevel !== "unclassified").length;
console.log(
  `Everyday: ${categories.length} categories, ${words.length} words ` +
    `(${pictured} with pictures, ${leveled} with a listed JLPT level) → ${OUT}`,
);
for (const c of categories) {
  const inCat = words.filter((w) => w.categoryIds.includes(c.id));
  console.log(`  ${c.id.padEnd(12)} ${String(inCat.length).padStart(3)} words, ${inCat.filter((w) => w.picture).length} pictured`);
}
