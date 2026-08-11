/**
 * Validate a core2000 seed batch JSON file.
 * Expected: array of VocabularySeed-like objects.
 * Usage: node scripts/core2000/validateBatch.mjs scripts/core2000/seeds/batch-4751-4850.json
 */
import fs from "fs";
import path from "path";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node validateBatch.mjs <seeds.json> [startId] [endId]");
  process.exit(2);
}

const startId = Number(process.argv[3] || 0);
const endId = Number(process.argv[4] || 0);
const seeds = JSON.parse(fs.readFileSync(file, "utf8"));

const REQUIRED = [
  "id",
  "word",
  "reading",
  "meaning",
  "phrase",
  "phraseReading",
  "phraseMeaning",
  "sentence",
  "sentenceReading",
  "sentenceMeaning",
  "wordType",
  "subcategory",
  "folder",
];

const VALID_WORD_TYPES = new Set([
  "noun",
  "noun / suru-verb",
  "noun / na-adjective",
  "verb",
  "verb (godan)",
  "verb (ichidan)",
  "verb (irregular)",
  "i-adjective",
  "na-adjective",
  "adverb",
  "pronoun",
  "conjunction",
  "counter",
  "prefix",
  "suffix",
  "expression",
  "interjection",
  "numeral",
]);

const errors = [];
const warnings = [];

if (!Array.isArray(seeds)) errors.push("Root must be an array");

const ids = new Set();
const words = new Set();

for (const [i, s] of seeds.entries()) {
  for (const k of REQUIRED) {
    if (s[k] === undefined || s[k] === null || String(s[k]).trim() === "") {
      errors.push(`[${i}] id=${s.id ?? "?"} missing ${k}`);
    }
  }
  if (s.id != null) {
    if (ids.has(s.id)) errors.push(`Duplicate id ${s.id}`);
    ids.add(s.id);
  }
  if (s.word) {
    const w = String(s.word).normalize("NFC");
    if (words.has(w)) errors.push(`Duplicate word ${w}`);
    words.add(w);
  }
  if (s.wordType && ![...VALID_WORD_TYPES].some((t) => s.wordType === t || s.wordType.startsWith(t))) {
    // allow known set membership loosely
    if (!VALID_WORD_TYPES.has(s.wordType)) {
      warnings.push(`Unusual wordType "${s.wordType}" for id ${s.id}`);
    }
  }
  // reading should be kana-ish
  if (s.reading && /[一-龯]/.test(s.reading)) {
    errors.push(`id ${s.id}: reading contains kanji: ${s.reading}`);
  }
  if (s.phraseReading && /[一-龯]/.test(s.phraseReading)) {
    errors.push(`id ${s.id}: phraseReading contains kanji`);
  }
  if (s.sentenceReading && /[一-龯]/.test(s.sentenceReading)) {
    errors.push(`id ${s.id}: sentenceReading contains kanji`);
  }
}

if (startId && endId) {
  const expected = endId - startId + 1;
  if (seeds.length !== expected) {
    errors.push(`Expected ${expected} seeds (${startId}-${endId}), got ${seeds.length}`);
  }
  for (let id = startId; id <= endId; id++) {
    if (!ids.has(id)) errors.push(`Missing id ${id}`);
  }
}

const result = {
  file: path.basename(file),
  count: seeds.length,
  errors: errors.length,
  warnings: warnings.length,
  errorList: errors.slice(0, 40),
  warningList: warnings.slice(0, 20),
};

console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exit(1);
