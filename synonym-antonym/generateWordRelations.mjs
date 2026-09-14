/**
 * Builds src/data/wordRelations.ts from scripts/word-relations/*.tsv
 *
 *   node scripts/generateWordRelations.mjs
 *
 * Source format (pipe-delimited, one relation per line):
 *   level|type|w1|reading1|meaning1|pos1|w2|reading2|meaning2|pos2|nuance
 *
 * `pos` codes: n, v, ia, na, adv, exp
 * `nuance` may be empty for antonym pairs that need no explanation.
 */

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SOURCE_DIR = join(here, "word-relations");
const OUT = join(here, "..", "src", "data", "wordRelations.ts");

const POS = {
  n: "noun",
  v: "verb",
  ia: "i-adjective",
  na: "na-adjective",
  adv: "adverb",
  exp: "expression",
};

const LEVEL_ORDER = ["N5", "N4", "N3", "N2"];

const rows = [];
for (const file of readdirSync(SOURCE_DIR).sort()) {
  if (!file.endsWith(".tsv")) continue;
  const text = readFileSync(join(SOURCE_DIR, file), "utf8");
  for (const [i, line] of text.split("\n").entries()) {
    if (!line.trim()) continue;
    const parts = line.split("|");
    if (parts.length !== 11) {
      throw new Error(`${file}:${i + 1} expected 11 fields, got ${parts.length}`);
    }
    const [level, type, w1, r1, m1, p1, w2, r2, m2, p2, nuance] = parts.map((s) =>
      s.trim()
    );
    if (!LEVEL_ORDER.includes(level)) {
      throw new Error(`${file}:${i + 1} bad level "${level}"`);
    }
    if (type !== "synonym" && type !== "antonym") {
      throw new Error(`${file}:${i + 1} bad type "${type}"`);
    }
    if (!POS[p1] || !POS[p2]) {
      throw new Error(`${file}:${i + 1} bad part of speech`);
    }
    rows.push({
      level,
      type,
      word1: { japanese: w1, reading: r1, meaning: m1, partOfSpeech: POS[p1] },
      word2: { japanese: w2, reading: r2, meaning: m2, partOfSpeech: POS[p2] },
      nuance,
    });
  }
}

rows.sort((a, b) => {
  const byLevel = LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level);
  if (byLevel !== 0) return byLevel;
  if (a.type !== b.type) return a.type === "synonym" ? -1 : 1;
  return a.word1.reading.localeCompare(b.word1.reading, "ja");
});

const counters = {};
const items = rows.map((row) => {
  const key = row.level.toLowerCase();
  counters[key] = (counters[key] ?? 0) + 1;
  const id = `rel-${key}-${String(counters[key]).padStart(3, "0")}`;
  const tags = [
    row.level,
    row.type,
    row.word1.partOfSpeech,
    row.word2.partOfSpeech,
  ];
  return { id, ...row, tags: [...new Set(tags)] };
});

const esc = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

const word = (w) =>
  [
    `      japanese: "${esc(w.japanese)}",`,
    `      reading: "${esc(w.reading)}",`,
    `      meaning: "${esc(w.meaning)}",`,
    `      partOfSpeech: "${w.partOfSpeech}",`,
  ].join("\n");

const body = items
  .map((item) =>
    [
      "  {",
      `    id: "${item.id}",`,
      `    jlptLevel: "${item.level}",`,
      `    type: "${item.type}",`,
      "    word1: {",
      word(item.word1),
      "    },",
      "    word2: {",
      word(item.word2),
      "    },",
      item.nuance ? `    nuance: "${esc(item.nuance)}",` : null,
      `    tags: [${item.tags.map((t) => `"${t}"`).join(", ")}],`,
      "  },",
    ]
      .filter(Boolean)
      .join("\n")
  )
  .join("\n");

const header = `import type {
  WordRelation,
  WordRelationLevel,
  WordRelationType,
} from "../types/wordRelation";

/**
 * Synonyms & Antonyms (類義語・反対語) corpus — N5 through N2.
 *
 * GENERATED FILE — edit scripts/word-relations/*.tsv and re-run
 * \`node scripts/generateWordRelations.mjs\` instead of editing this by hand.
 *
 * Pairs are stored in one direction only: if 安全 ↔ 危険 exists, 危険 ↔ 安全
 * is not added separately. A pair whose two words sit at different JLPT levels
 * is filed under the harder of the two.
 */

export const WORD_RELATION_LEVELS: readonly WordRelationLevel[] = [
  "N5",
  "N4",
  "N3",
  "N2",
] as const;

export const WORD_RELATION_TYPES: readonly WordRelationType[] = [
  "synonym",
  "antonym",
] as const;

/** Japanese labels for the relationship filter, per the accessibility rule. */
export const WORD_RELATION_TYPE_LABELS: Readonly<
  Record<WordRelationType, { japanese: string; english: string; symbol: string }>
> = {
  synonym: { japanese: "類義語", english: "Synonym", symbol: "≈" },
  antonym: { japanese: "反対語", english: "Antonym", symbol: "↔" },
};

export const wordRelations: readonly WordRelation[] = [
`;

const footer = `];
`;

writeFileSync(OUT, header + body + "\n" + footer, "utf8");

const byLevel = {};
const byType = {};
for (const item of items) {
  byLevel[item.level] = (byLevel[item.level] ?? 0) + 1;
  byType[item.type] = (byType[item.type] ?? 0) + 1;
}
console.log(`wrote ${items.length} relations to ${OUT}`);
console.log("by level:", byLevel);
console.log("by type:", byType);
