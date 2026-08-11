import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const report = JSON.parse(
  fs.readFileSync(path.join(__dirname, "merge-audit.json"), "utf8")
);

const NEED_NEW = 2000 - report.existingCount; // 1250
const selected = report.missing
  .slice()
  .sort((a, b) => a.rank - b.rank)
  .slice(0, NEED_NEW);
const displaced = report.missing
  .slice()
  .sort((a, b) => a.rank - b.rank)
  .slice(NEED_NEW);

const plan = {
  keepExisting: report.existingCount,
  addNew: selected.length,
  displacedCandidates: displaced.length,
  newIdStart: 4751,
  newIdEnd: 4751 + selected.length - 1,
  selected: selected.map((c, i) => ({
    rank: c.rank,
    word: c.word,
    newId: 4751 + i,
  })),
  displaced: displaced.map((c) => ({ rank: c.rank, word: c.word })),
};

fs.writeFileSync(
  path.join(__dirname, "selection-plan.json"),
  JSON.stringify(plan, null, 2),
  "utf8"
);
fs.writeFileSync(
  path.join(__dirname, "to-add.txt"),
  plan.selected
    .map((c) => `${c.newId}\t${String(c.rank).padStart(4, "0")}\t${c.word}`)
    .join("\n") + "\n",
  "utf8"
);
fs.writeFileSync(
  path.join(__dirname, "displaced.txt"),
  plan.displaced
    .map((c) => `${String(c.rank).padStart(4, "0")}\t${c.word}`)
    .join("\n") + "\n",
  "utf8"
);

console.log(
  JSON.stringify(
    {
      keepExisting: plan.keepExisting,
      addNew: plan.addNew,
      displacedCandidates: plan.displacedCandidates,
      newIdRange: `${plan.newIdStart}-${plan.newIdEnd}`,
      firstAdd: plan.selected.slice(0, 5),
      lastAdd: plan.selected.slice(-5),
      firstDisplaced: plan.displaced.slice(0, 5),
      lastDisplaced: plan.displaced.slice(-5),
    },
    null,
    2
  )
);
