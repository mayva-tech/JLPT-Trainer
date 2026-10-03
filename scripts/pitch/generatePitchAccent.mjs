#!/usr/bin/env node
/**
 * Generate src/data/pitchAccent.ts — pitch-accent positions for every
 * vocabulary word and onomatopoeia in the corpus.
 *
 * Source: Kanjium accents.txt by Uros O. (CC BY-SA 4.0)
 *   https://github.com/mifunetoshiro/kanjium
 * Downloaded once into scripts/pitch/.cache/ (git-ignored).
 * Manual entries in scripts/pitch/overrides.tsv win over Kanjium.
 *
 * Lookup order per (word, reading):
 *   1. overrides.tsv
 *   2. Kanjium exact word + reading (katakana/hiragana-insensitive)
 *   3. kana-only word: Kanjium entry for the same kana
 *   4. kana-only word: Kanjium entries whose READING is this kana (e.g.
 *      苛々 for いらいら), accepted only when they all agree on the accent
 *   5. 〜する verb: the noun's accent (heiban stays heiban, otherwise same mora)
 * Anything else is left out (the UI then shows no pitch line) and listed in
 * scripts/pitch/_pitch_report.txt.
 *
 * Usage:  node scripts/pitch/generatePitchAccent.mjs
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const CACHE = join(here, ".cache", "accents.txt");
const SOURCE_URL =
  "https://raw.githubusercontent.com/mifunetoshiro/kanjium/master/data/source_files/raw/accents.txt";

const toHira = (s) =>
  s.replace(/[\u30a1-\u30f6]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
const clean = (s) => s.replace(/[〜~]/g, "").trim();
const isKana = (s) => /^[\u3041-\u309f\u30a0-\u30ffー]+$/.test(s);

/**
 * Parse a Kanjium accent field: "2", "0,2", or with part-of-speech labels such
 * as "(副)1,(名)0" — mimetic words often change accent with usage. Unlabelled
 * numbers after a label inherit it. Returns numbers, or { n, pos } entries.
 */
function parseAccents(field) {
  const out = [];
  let pos = null;
  for (const token of field.split(",")) {
    const m = /^(?:\(([^)]+)\))?(\d+)$/.exec(token.trim());
    if (!m) continue;
    if (m[1]) pos = m[1];
    const n = Number(m[2]);
    out.push(pos ? { n, pos } : n);
  }
  return out;
}

const sameAccents = (a, b) => JSON.stringify(a) === JSON.stringify(b);

async function loadKanjium() {
  if (!existsSync(CACHE)) {
    console.log(`Downloading Kanjium accents.txt …`);
    const res = await fetch(SOURCE_URL);
    if (!res.ok) throw new Error(`download failed: ${res.status}`);
    mkdirSync(dirname(CACHE), { recursive: true });
    writeFileSync(CACHE, await res.text(), "utf8");
  }
  /** word → [{ reading (hiragana, '' when kana-only), accents }] */
  const byWord = new Map();
  /** reading (hiragana) → [accents] — for kana-only corpus words */
  const byReading = new Map();
  /** reading (hiragana) → [{ word, accents }] — for words inside phrases */
  const entriesByReading = new Map();
  for (const line of readFileSync(CACHE, "utf8").split(/\r?\n/)) {
    const [word, reading = "", acc] = line.split("\t");
    if (!word || !acc) continue;
    const accents = parseAccents(acc);
    if (!accents.length) continue;
    const list = byWord.get(word) ?? [];
    list.push({ reading: toHira(reading), accents });
    byWord.set(word, list);
    const r = toHira(reading || word);
    const byR = byReading.get(r) ?? [];
    byR.push(accents);
    byReading.set(r, byR);
    const er = entriesByReading.get(r) ?? [];
    er.push({ word, accents });
    entriesByReading.set(r, er);
  }
  return { byWord, byReading, entriesByReading };
}

function loadOverrides() {
  const map = new Map();
  for (const line of readFileSync(join(here, "overrides.tsv"), "utf8").split(/\r?\n/)) {
    if (!line.trim() || line.startsWith("#")) continue;
    const [word, reading, acc] = line.split("\t");
    map.set(`${word}|${toHira(reading)}`, parseAccents(acc));
  }
  return map;
}

/** (word, reading) pairs from the corpus source files. */
function corpusPairs() {
  const pairs = [];
  const grab = (file, re) => {
    const text = readFileSync(join(root, file), "utf8");
    for (const m of text.matchAll(re)) pairs.push({ word: m[1], reading: m[2], file });
  };
  const vocabRe = /\bword:\s*"([^"]+)",\s*\r?\n\s*reading:\s*"([^"]+)"/g;
  grab("src/data/vocabulary.ts", vocabRe);
  grab("src/data/vocabularyCore2000Seeds.ts", vocabRe);
  grab("src/data/onomatopoeia.ts", /\bjapanese:\s*'([^']+)',\s*\r?\n\s*reading:\s*'([^']+)'/g);
  return pairs;
}

function lookup(kanjium, overrides, word, reading) {
  const w = clean(word);
  const r = toHira(clean(reading)).replace(/\s+/g, "");
  const o = overrides.get(`${w}|${r}`);
  if (o) return { accents: o, how: "override" };

  const exact = kanjium.byWord.get(w)?.find((e) => e.reading === r || (e.reading === "" && toHira(w) === r));
  if (exact) return { accents: exact.accents, how: "kanjium" };

  if (isKana(w)) {
    for (const variant of [w, toHira(w), w.replace(/[\u3041-\u3096]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60))]) {
      const hit = kanjium.byWord.get(variant)?.find((e) => e.reading === "" || e.reading === r);
      if (hit) return { accents: hit.accents, how: "kanjium-kana" };
    }
    const same = kanjium.byReading.get(toHira(w));
    if (same?.length && same.every((a) => sameAccents(a, same[0]))) {
      return { accents: same[0], how: "kanjium-reading" };
    }
  }

  if (w.endsWith("する") && r.endsWith("する") && w.length > 2) {
    const stem = lookup(kanjium, overrides, w.slice(0, -2), r.slice(0, -2));
    if (stem) return { accents: stem.accents, how: "suru" };
  }
  return null;
}

const kanjium = await loadKanjium();
const overrides = loadOverrides();
const out = new Map();
const missing = [];
const stats = {};
for (const { word, reading, file } of corpusPairs()) {
  const key = `${clean(word)}|${toHira(clean(reading)).replace(/\s+/g, "")}`;
  if (out.has(key)) continue;
  const hit = lookup(kanjium, overrides, word, reading);
  if (hit) {
    out.set(key, hit.accents);
    stats[hit.how] = (stats[hit.how] ?? 0) + 1;
  } else if (!missing.some((m) => m.key === key)) {
    missing.push({ key, file });
  }
}

const entries = [...out.entries()].sort(([a], [b]) => a.localeCompare(b, "ja"));
const ts = `/**
 * Pitch-accent positions (mora after which the pitch drops; 0 = heiban),
 * keyed by "word|reading". An entry is a number, or { n, pos } when the
 * accent depends on usage (副 adverb, 名 noun, 形動 na-adjective, …). GENERATED by scripts/pitch/generatePitchAccent.mjs —
 * do not edit by hand; add fixes to scripts/pitch/overrides.tsv and re-run.
 *
 * The pitch accent notation is provided by Uros O. through his free database
 * Kanjium (https://github.com/mifunetoshiro/kanjium), licensed CC BY-SA 4.0.
 */
export type PitchAccentEntry = number | { readonly n: number; readonly pos: string };

export const PITCH_ACCENT: Readonly<Record<string, readonly PitchAccentEntry[]>> = {
${entries.map(([k, v]) => `  ${JSON.stringify(k)}: [${v.map((e) => (typeof e === "number" ? e : `{ n: ${e.n}, pos: ${JSON.stringify(e.pos)} }`)).join(", ")}],`).join("\n")}
};
`;
writeFileSync(join(root, "src/data/pitchAccent.ts"), ts, "utf8");

/* ── Sample phrases ────────────────────────────────────────────────
 * Each word of a phrase keeps its own dictionary accent and the particles
 * after it follow it (high after heiban, low otherwise). A phrase reading is
 * only split at spaces and particles, never inside a word — compounds
 * (青信号, 十人) must be found whole. Every word must be a Kanjium entry whose spelling appears in
 * the written phrase, so conjugated forms (受けた) and unclear splits leave
 * the phrase without a line instead of guessing.
 */
const PARTICLES = ["から", "まで", "より", "する", "の", "を", "が", "に", "で", "と", "は", "も", "へ", "や", "な"];
const firstN = (accents) => (typeof accents[0] === "number" ? accents[0] : accents[0].n);
const moraCount = (kana) => kana.replace(/[ゃゅょぁぃぅぇぉゎャュョァィゥェォヮ]/g, "").length;

function corpusPhrases() {
  const list = [];
  const re =
    /\bword:\s*"([^"]+)",\s*\r?\n\s*reading:\s*"([^"]+)"[\s\S]*?\bphrase:\s*"([^"]+)",\s*\r?\n\s*phraseReading:\s*"([^"]+)"/g;
  for (const file of ["src/data/vocabulary.ts", "src/data/vocabularyCore2000Seeds.ts"]) {
    const text = readFileSync(join(root, file), "utf8");
    for (const m of text.matchAll(re)) {
      list.push({ word: m[1], reading: m[2], phrase: m[3], phraseReading: m[4], file });
    }
  }
  return list;
}

function phraseSegments({ word, reading, phrase, phraseReading }) {
  const surface = clean(phrase);
  const surfaceHira = toHira(surface);
  const itemKana = toHira(clean(reading)).replace(/\s+/g, "");
  const itemAccents = out.get(`${clean(word)}|${itemKana}`);

  const contentAccent = (kana) => {
    if (kana === itemKana && itemAccents) return firstN(itemAccents);
    const seen = (entriesByReading.get(kana) ?? []).filter((e) =>
      isKana(e.word) ? kana.length >= 2 && surfaceHira.includes(toHira(e.word)) : surface.includes(e.word),
    );
    if (!seen.length) return null;
    const n = firstN(seen[0].accents);
    return seen.every((e) => firstN(e.accents) === n) && n <= moraCount(kana) ? n : null;
  };

  /** Split a chunk into [word, accent, particles] segments, particles first at each step. */
  const parse = (orig, hira) => {
    if (!hira) return [];
    for (let k = hira.length; k >= 1; k--) {
      const n = contentAccent(hira.slice(0, k));
      if (n == null) continue;
      const withParticles = (at, parts) => {
        for (const p of PARTICLES) {
          if (hira.startsWith(p, at)) {
            const r = withParticles(at + p.length, parts + p);
            if (r) return r;
          }
        }
        if (!parts && at < hira.length) return null;
        const tail = parse(orig.slice(at), hira.slice(at));
        return tail ? [[orig.slice(0, k), n, parts], ...tail] : null;
      };
      const hit = withParticles(k, "");
      if (hit) return hit;
    }
    return null;
  };

  const onlyParticles = (s) => !s || PARTICLES.some((p) => s.startsWith(p) && onlyParticles(s.slice(p.length)));
  const segments = [];
  for (const chunk of clean(phraseReading).split(/\s+/)) {
    if (!isKana(chunk)) return null;
    const hira = toHira(chunk);
    if (segments.length && onlyParticles(hira)) {
      segments[segments.length - 1][2] += chunk;
      continue;
    }
    const segs = parse(chunk, hira);
    if (!segs) return null;
    segments.push(...segs);
  }
  return segments.length ? segments : null;
}

const { entriesByReading } = kanjium;
const phraseOut = new Map();
const phraseMissing = [];
for (const p of corpusPhrases()) {
  const key = `${clean(p.phrase)}|${toHira(clean(p.phraseReading)).replace(/\s+/g, "")}`;
  if (phraseOut.has(key)) continue;
  const segs = phraseSegments(p);
  if (segs) phraseOut.set(key, segs);
  else if (!phraseMissing.includes(key)) phraseMissing.push(key);
}

const phraseEntries = [...phraseOut.entries()].sort(([a], [b]) => a.localeCompare(b, "ja"));
writeFileSync(
  join(root, "src/data/pitchAccentPhrases.ts"),
  `/**
 * Pitch accent of the vocabulary sample phrases, keyed by "phrase|reading":
 * [word kana, accent, following particles] per word. GENERATED by
 * scripts/pitch/generatePitchAccent.mjs — do not edit by hand.
 *
 * The pitch accent notation is provided by Uros O. through his free database
 * Kanjium (https://github.com/mifunetoshiro/kanjium), licensed CC BY-SA 4.0.
 */
export type PhrasePitchSegment = readonly [kana: string, accent: number, particles: string];

export const PHRASE_PITCH: Readonly<Record<string, readonly PhrasePitchSegment[]>> = {
${phraseEntries.map(([k, v]) => `  ${JSON.stringify(k)}: [${v.map((s) => JSON.stringify(s)).join(", ")}],`).join("\n")}
};
`,
  "utf8",
);

const total = out.size + missing.length;
const phraseTotal = phraseOut.size + phraseMissing.length;
const report = [
  `Pitch accent coverage: ${out.size}/${total} (${((out.size / total) * 100).toFixed(1)}%)`,
  `By source: ${Object.entries(stats).map(([k, v]) => `${k} ${v}`).join(", ")}`,
  `Sample phrases: ${phraseOut.size}/${phraseTotal} (${((phraseOut.size / phraseTotal) * 100).toFixed(1)}%)`,
  "",
  `Missing (${missing.length}) — add to overrides.tsv if you can verify them:`,
  ...missing.map((m) => `  ${m.key}\t(${m.file})`),
  "",
  `Phrases without a line (${phraseMissing.length}):`,
  ...phraseMissing.map((k) => `  ${k}`),
  "",
].join("\n");
writeFileSync(join(here, "_pitch_report.txt"), report, "utf8");
console.log(report.split("\n").slice(0, 3).join("\n"));
