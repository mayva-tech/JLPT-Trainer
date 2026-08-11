/** Merge missing-kanji-data.json into vocabulary.ts KANJI map; clear missing-kanji.txt if done. */
import fs from "fs";

const vocabPath = "src/data/vocabulary.ts";
const dataPath = "scripts/core2000/missing-kanji-data.json";
const missingListPath = "scripts/core2000/missing-kanji.txt";

const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const keys = Object.keys(data);
console.log("merging", keys.length, "kanji");

let src = fs.readFileSync(vocabPath, "utf8");
const marker = "const KANJI: Record<string, Omit<KanjiDetail, \"character\">> = {";
const start = src.indexOf(marker);
if (start < 0) throw new Error("KANJI map start not found");
const openBrace = src.indexOf("{", start);
// find matching close of KANJI object — first `\n};` after start that closes the map
// Use the known pattern: map ends before `\n\nfunction kanjiDetailsFor` or similar
const endMarker = "\r\n};\r\n\r\nconst KANJI_RE";
let end = src.indexOf(endMarker, openBrace);
if (end < 0) {
  end = src.indexOf("\n};\n\nconst KANJI_RE", openBrace);
}
if (end < 0) throw new Error("KANJI map end not found");
const insertAt = end;

function esc(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

const lines = keys
  .sort((a, b) => a.localeCompare(b, "ja"))
  .map((k) => {
    const e = data[k];
    const on = (e.onyomi || []).map((x) => `"${esc(x)}"`).join(", ");
    const kun = (e.kunyomi || []).map((x) => `"${esc(x)}"`).join(", ");
    return `  ${k}: { meaning: "${esc(e.meaning)}", onyomi: [${on}], kunyomi: [${kun}] },`;
  })
  .join("\n");

src = src.slice(0, insertAt) + "\n  // --- Core 2000 additions ---\n" + lines + src.slice(insertAt);
fs.writeFileSync(vocabPath, src, "utf8");

// verify
const list = fs
  .readFileSync(missingListPath, "utf8")
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter(Boolean);
const _stillMissing = list.filter((k) => !src.includes(`\n  ${k}: {`) && !src.includes(`\n  ${k}: {`));
// simpler check
const still = [];
for (const k of list) {
  const re = new RegExp(`(?:^|\\n)\\s*${k}\\s*:`);
  if (!re.test(src.slice(src.indexOf(marker)))) still.push(k);
}
fs.writeFileSync(
  missingListPath,
  still.length ? still.join("\n") + "\n" : "",
  "utf8"
);
console.log(JSON.stringify({ merged: keys.length, stillMissing: still.length, still }, null, 2));
