/**
 * Post-process Core 2000 seed JSON for corpus/TTS compliance.
 * - Strip spaces from headword readings
 * - Fix known particle/karaoke issues
 * - Normalize trailing punctuation spacing in readings
 */
import fs from "fs";
import path from "path";

const dir = "scripts/core2000/seeds";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));

const SPECIFIC = {
  5101: {
    sentenceReading:
      "きょう の じゅぎょう で は かんきょう もんだい に ついて はなしあった。",
  },
  5276: {
    sentenceReading:
      "こども の きょういく に ついて かぞく で はなしあった。",
  },
  5444: {
    sentence: "ところで、この機械は誰が発明したの？",
    sentenceReading: "ところで、この きかい は だれ が はつめい した の？",
    sentenceMeaning: "By the way, who invented this machine?",
  },
  5809: {
    // 日々 — ensure reading works with 々
    reading: "ひび",
    phraseReading: "いそがしい ひび",
    sentenceReading: "ひび の ちいさな へんか を にっき に かいて いる。",
  },
};

let changed = 0;
for (const f of files) {
  const p = path.join(dir, f);
  const arr = JSON.parse(fs.readFileSync(p, "utf8"));
  for (const s of arr) {
    const before = JSON.stringify(s);
    if (typeof s.reading === "string") {
      s.reading = s.reading.replace(/\s+/g, "");
    }
    // Fix spaced onyomi-style splits like じっ こう inside phrase/sentence readings
    // Keep normal particle spaces; only collapse within known bad patterns later if needed.

    if (SPECIFIC[s.id]) Object.assign(s, SPECIFIC[s.id]);

    // No space before punctuation
    for (const k of ["phraseReading", "sentenceReading"]) {
      if (typeof s[k] === "string") {
        s[k] = s[k].replace(/ ([、。！？．，!?])/g, "$1");
      }
    }

    if (JSON.stringify(s) !== before) changed++;
  }
  fs.writeFileSync(p, JSON.stringify(arr, null, 2) + "\n", "utf8");
}

console.log({ files: files.length, seedsTouched: changed });
