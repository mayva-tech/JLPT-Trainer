import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

const vocabPath = path.join(root, "src/data/vocabulary.ts");
const candPath = path.join(
  root,
  "RESEARCH-Study-reference/chatgpt claude reply/2000 word list/JLPT_Trainer_Core_2000_Words.txt"
);

const src = fs.readFileSync(vocabPath, "utf8");
const seedStart = src.indexOf("const seeds: VocabularySeed[]");
if (seedStart < 0) throw new Error("seeds array not found");
const seedSlice = src.slice(seedStart);

const items = [];
const re =
  /id:\s*(\d+),\s*[\s\S]*?word:\s*"([^"]+)",\s*reading:\s*"([^"]+)",\s*meaning:\s*"([^"]+)",/g;
let m;
while ((m = re.exec(seedSlice))) {
  items.push({
    id: Number(m[1]),
    word: m[2].normalize("NFC"),
    reading: m[3],
    meaning: m[4],
  });
}

const byWord = new Map();
for (const it of items) {
  if (!byWord.has(it.word)) byWord.set(it.word, []);
  byWord.get(it.word).push(it);
}

const candText = fs.readFileSync(candPath, "utf8");
const cands = [];
for (const line of candText.split(/\r?\n/)) {
  const mm = /^(\d{4})\t(.+)$/.exec(line);
  if (mm) {
    cands.push({ rank: Number(mm[1]), word: mm[2].normalize("NFC") });
  }
}

const matched = [];
const missing = [];
const matchedExistingIds = new Set();

for (const c of cands) {
  const hits = byWord.get(c.word);
  if (hits?.length) {
    matched.push({
      ...c,
      existing: hits.map((h) => ({
        id: h.id,
        reading: h.reading,
        meaning: h.meaning,
      })),
    });
    for (const h of hits) matchedExistingIds.add(h.id);
  } else {
    missing.push(c);
  }
}

const orphanExisting = items.filter((i) => !matchedExistingIds.has(i.id));

const seen = new Map();
const dupCands = [];
for (const c of cands) {
  if (seen.has(c.word)) dupCands.push([seen.get(c.word), c.rank, c.word]);
  else seen.set(c.word, c.rank);
}

const finalIfKeepAll = items.length + missing.length;
const displaceNeeded = Math.max(0, finalIfKeepAll - 2000);

const report = {
  existingCount: items.length,
  uniqueExistingWords: byWord.size,
  candidateCount: cands.length,
  uniqueCandidateWords: seen.size,
  matchedCandidates: matched.length,
  missingCandidates: missing.length,
  orphanExisting: orphanExisting.length,
  duplicateCandidateSpellings: dupCands.length,
  finalIfKeepAllExistingAndFill: finalIfKeepAll,
  displaceNeeded,
  orphanSample: orphanExisting.slice(0, 40).map((o) => `${o.id}:${o.word}`),
  missingSample: missing.slice(0, 40).map((o) => `${o.rank}:${o.word}`),
  matched,
  missing,
  orphanExisting,
  dupCands,
};

fs.writeFileSync(
  path.join(__dirname, "merge-audit.json"),
  JSON.stringify(report, null, 2),
  "utf8"
);

fs.writeFileSync(
  path.join(__dirname, "missing-candidates.txt"),
  missing.map((c) => `${String(c.rank).padStart(4, "0")}\t${c.word}`).join("\n") +
    "\n",
  "utf8"
);

fs.writeFileSync(
  path.join(__dirname, "orphan-existing.txt"),
  orphanExisting.map((o) => `${o.id}\t${o.word}\t${o.reading}\t${o.meaning}`).join("\n") +
    "\n",
  "utf8"
);

console.log(
  JSON.stringify(
    {
      existingCount: report.existingCount,
      uniqueExistingWords: report.uniqueExistingWords,
      candidateCount: report.candidateCount,
      uniqueCandidateWords: report.uniqueCandidateWords,
      matchedCandidates: report.matchedCandidates,
      missingCandidates: report.missingCandidates,
      orphanExisting: report.orphanExisting,
      duplicateCandidateSpellings: report.duplicateCandidateSpellings,
      finalIfKeepAllExistingAndFill: report.finalIfKeepAllExistingAndFill,
      displaceNeeded: report.displaceNeeded,
    },
    null,
    2
  )
);
