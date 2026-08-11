/**
 * Integrate Core 2000 seeds + lessons + missing kanji audit.
 * 1) Build src/data/vocabularyCore2000Seeds.ts from validated JSON batches
 * 2) Build src/data/lessonsCore2000.ts from new-lessons-plan.json
 * 3) Write scripts/core2000/missing-kanji.txt
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const seedsDir = path.join(__dirname, "seeds");

const batchFiles = fs
  .readdirSync(seedsDir)
  .filter((f) => /^batch-\d+-\d+\.json$/.test(f))
  .sort((a, b) => {
    const na = Number(a.match(/batch-(\d+)/)[1]);
    const nb = Number(b.match(/batch-(\d+)/)[1]);
    return na - nb;
  });

const allSeeds = [];
for (const f of batchFiles) {
  const arr = JSON.parse(fs.readFileSync(path.join(seedsDir, f), "utf8"));
  allSeeds.push(...arr);
}
allSeeds.sort((a, b) => a.id - b.id);

if (allSeeds.length !== 1250) throw new Error(`Expected 1250 seeds, got ${allSeeds.length}`);
if (allSeeds[0].id !== 4751 || allSeeds[1249].id !== 6000) {
  throw new Error(`ID range mismatch: ${allSeeds[0].id}-${allSeeds[1249].id}`);
}

function esc(s) {
  return String(s)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, "\\n");
}

function seedToTs(s) {
  return `  {
    id: ${s.id},
    subcategory: "${esc(s.subcategory)}",
    folder: "${esc(s.folder)}",
    word: "${esc(s.word)}",
    reading: "${esc(s.reading)}",
    meaning: "${esc(s.meaning)}",
    phrase: "${esc(s.phrase)}",
    phraseReading: "${esc(s.phraseReading)}",
    phraseMeaning: "${esc(s.phraseMeaning)}",
    sentence: "${esc(s.sentence)}",
    sentenceReading: "${esc(s.sentenceReading)}",
    sentenceMeaning: "${esc(s.sentenceMeaning)}",
    wordType: "${esc(s.wordType)}",
  }`;
}

const seedsTs = `/** Auto-generated Core 2000 vocabulary seeds (IDs 4751–6000). */
import type { VocabularyItem } from "../types/vocabulary";

export type Core2000Seed = Omit<
  VocabularyItem,
  "jlpt" | "category" | "kanjiDetails" | "audioWord" | "audioPhrase" | "audioSentence"
> & {
  folder: string;
};

export const core2000Seeds: Core2000Seed[] = [
${allSeeds.map(seedToTs).join(",\n")},
];
`;

fs.writeFileSync(
  path.join(root, "src/data/vocabularyCore2000Seeds.ts"),
  seedsTs,
  "utf8"
);

// Lessons 76–200
const plan = JSON.parse(
  fs.readFileSync(path.join(__dirname, "new-lessons-plan.json"), "utf8")
);

function lessonToTs(lesson, index) {
  const startId = 4751 + index * 10;
  const n = lesson.lessonNumber;
  const pad = String(n).padStart(2, "0");
  const titleTheme = String(lesson.title).replace(/\s+\d+$/, "");
  const title = `JLPT N2 Vocabulary #${n} | ${titleTheme}`;
  const subtitle = `${lesson.subcategory}`;
  const youtubeTitle = `JLPT N2 Vocabulary #${n} | ${titleTheme}`;
  return `  {
    id: "lesson-${pad}",
    title: "${esc(title)}",
    subtitle: "${esc(subtitle)}",
    youtubeTitle: "${esc(youtubeTitle)}",
    category: "${esc(lesson.category)}",
    subcategories: ["${esc(lesson.subcategory)}"],
    vocabularyIds: idRange(${startId}),
  }`;
}

const lessonsTs = `/** Auto-generated Core 2000 lessons 76–200. */
import type { Lesson } from "../types/lesson";

/** Vocabulary ids for one lesson: start .. start+9 */
function idRange(start: number): number[] {
  return Array.from({ length: 10 }, (_, i) => start + i);
}

export const core2000Lessons: Lesson[] = [
${plan.map((l, i) => lessonToTs(l, i)).join(",\n")},
];
`;

fs.writeFileSync(path.join(root, "src/data/lessonsCore2000.ts"), lessonsTs, "utf8");

// Missing kanji audit
const vocabSrc = fs.readFileSync(path.join(root, "src/data/vocabulary.ts"), "utf8");
const kanjiBlockMatch = vocabSrc.match(/const KANJI: Record<string, Omit<KanjiDetail, "character">> = \{([\s\S]*?)\n\};/);
if (!kanjiBlockMatch) throw new Error("KANJI map not found");
const existingKanji = new Set(
  [...kanjiBlockMatch[1].matchAll(/^\s*([\u4e00-\u9fff])\s*:/gm)].map((x) => x[1])
);

const needed = new Set();
for (const s of allSeeds) {
  for (const text of [s.word, s.phrase, s.sentence]) {
    for (const ch of text) {
      if (/[\u4e00-\u9fff]/.test(ch)) needed.add(ch);
    }
  }
}
const missing = [...needed].filter((k) => !existingKanji.has(k)).sort();
fs.writeFileSync(
  path.join(__dirname, "missing-kanji.txt"),
  missing.join("\n") + (missing.length ? "\n" : ""),
  "utf8"
);

console.log(
  JSON.stringify(
    {
      seedsWritten: allSeeds.length,
      lessonsWritten: plan.length,
      existingKanji: existingKanji.size,
      neededKanji: needed.size,
      missingKanji: missing.length,
      missingSample: missing.slice(0, 40),
    },
    null,
    2
  )
);
