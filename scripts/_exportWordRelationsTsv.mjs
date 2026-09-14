/**
 * One-time helper: reverse-engineer scripts/word-relations/*.tsv from the
 * bundled wordRelations.ts when the TSV sources were not shipped in the zip.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, "..", "synonym-antonym", "wordRelations.ts");
const OUT_DIR = join(here, "word-relations");

const POS = {
  noun: "n",
  verb: "v",
  "i-adjective": "ia",
  "na-adjective": "na",
  adverb: "adv",
  expression: "exp",
};

const unesc = (s) => s.replace(/\\"/g, '"').replace(/\\\\/g, "\\");

function parseWord(section) {
  return {
    japanese: unesc(section.match(/japanese: "((?:\\.|[^"\\])*)"/)?.[1] ?? ""),
    reading: unesc(section.match(/reading: "((?:\\.|[^"\\])*)"/)?.[1] ?? ""),
    meaning: unesc(section.match(/meaning: "((?:\\.|[^"\\])*)"/)?.[1] ?? ""),
    pos: POS[section.match(/partOfSpeech: "([^"]+)"/)?.[1] ?? ""] ?? "",
  };
}

const text = readFileSync(SRC, "utf8");
const marker = "export const wordRelations: readonly WordRelation[] = [";
const bodyStart = text.indexOf(marker);
if (bodyStart < 0) throw new Error("wordRelations array not found");
const body = text
  .slice(bodyStart + marker.length, text.lastIndexOf("\n];"))
  .trim();
const blocks = body
  .split(/\n  \},(?:\n|$)/)
  .map((chunk) => chunk.trim())
  .filter(Boolean);

const rows = [];
for (const raw of blocks) {
  const block = raw.trim();
  if (!block.startsWith("{")) continue;

  const level = block.match(/jlptLevel: "(N[2345])"/)?.[1];
  const type = block.match(/type: "(synonym|antonym)"/)?.[1];
  const w1sec = block.match(/word1: \{([\s\S]*?)\n    \},/)?.[1];
  const w2sec = block.match(/word2: \{([\s\S]*?)\n    \},/)?.[1];
  if (!level || !type || !w1sec || !w2sec) continue;

  const word1 = parseWord(w1sec);
  const word2 = parseWord(w2sec);
  const nuance = block.match(/nuance: "((?:\\.|[^"\\])*)"/)?.[1];

  rows.push({
    level,
    type,
    w1: word1.japanese,
    r1: word1.reading,
    m1: word1.meaning,
    p1: word1.pos,
    w2: word2.japanese,
    r2: word2.reading,
    m2: word2.meaning,
    p2: word2.pos,
    nuance: nuance ? unesc(nuance) : "",
  });
}

mkdirSync(OUT_DIR, { recursive: true });
for (const level of ["N5", "N4", "N3", "N2"]) {
  const lines = rows
    .filter((row) => row.level === level)
    .map(
      (row) =>
        `${row.level}|${row.type}|${row.w1}|${row.r1}|${row.m1}|${row.p1}|${row.w2}|${row.r2}|${row.m2}|${row.p2}|${row.nuance}`
    );
  writeFileSync(join(OUT_DIR, `${level.toLowerCase()}.tsv`), `${lines.join("\n")}\n`, "utf8");
  console.log(`${level}: ${lines.length} rows`);
}
console.log(`total: ${rows.length}`);
