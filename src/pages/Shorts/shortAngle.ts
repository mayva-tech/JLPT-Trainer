import type { VocabularyItem } from "../../types/vocabulary";
import { vocabulary } from "../../data/vocabulary";
import { vocabularyN3 } from "../../data/n3/vocabularyN3";
import { KANJI } from "../../data/kanji";

/**
 * The angle of a Short: what kind of hook it opens with, and everything that
 * follows from that — the opener line, the upload title, the first line of
 * the description, the comment bait in the outro and the pinned comment.
 *
 *   trap  the reading does not follow the kanji (土産 → みやげ, not どさん)
 *   twin  another word sounds the same (洗濯 / 選択 → せんたく)
 *   math  two kanji whose meanings add up to the word (家 + 賃 = rent)
 *   read  the classic "Can you read this?" opener
 *
 * Picked from the word's own data, strongest first, and stable per word so a
 * re-take matches its upload text. The angle name goes into the studio and
 * the description so YouTube analytics can be compared per hook type.
 */

export type ShortAngleKind = "trap" | "twin" | "math" | "read";

export interface HookLine {
  /** Spoken by Andrew and shown big. */
  en: string;
  /** Spoken by Nanami and shown small. */
  ja: string;
}

export const HOOK_LINES: readonly HookLine[] = [
  { en: "Can you read this?", ja: "読めますか？" },
  { en: "Do you know this word?", ja: "この言葉、知ってる？" },
  { en: "How do you read this?", ja: "どう読む？" },
  { en: "Read it before the timer ends!", ja: "時間内に読めるかな？" },
  { en: "What's the reading?", ja: "読み方は？" },
  { en: "Think you know this one?", ja: "わかるかな？" },
  { en: "Try reading this out loud!", ja: "声に出して読んでみて！" },
  { en: "Quick quiz — read this!", ja: "クイズ！これ、読める？" },
  { en: "Have you seen this word?", ja: "見たことある？" },
  { en: "Ready? Read this one!", ja: "準備はいい？" },
  { en: "Bet you can read this!", ja: "きっと読めるはず！" },
  { en: "Guess the reading!", ja: "読みを当ててみて！" },
];

/**
 * The classic opener for a word. Keyed by id, so consecutive words in a
 * lesson get different lines and a re-take of the same word keeps its line.
 */
export function hookLineFor(item: Pick<VocabularyItem, "id">): HookLine {
  const n = HOOK_LINES.length;
  return HOOK_LINES[((Math.trunc(item.id) % n) + n) % n]!;
}

export const ANGLE_LABELS: Readonly<Record<ShortAngleKind, string>> = {
  trap: "Reading trap",
  twin: "Sound-alike twin",
  math: "Kanji math",
  read: "Can you read this?",
};

export interface ShortAngle {
  kind: ShortAngleKind;
  /** Short name for the studio and the description. */
  label: string;
  hook: HookLine;
  /** Title before " | JLPT N5 #3 #shorts" (null: the classic title). */
  titleHead: string | null;
  /** Shorter title head when the long one does not fit. */
  titleHeadShort: string | null;
  /** Opening line of the description (null: none). */
  descLine: string | null;
  /** Outro question, shown big. */
  bait: string;
  /** The same question as Andrew says it (no emoji). */
  baitSpoken: string;
  /** Numbered answers shown under the question (twin quiz). */
  choices?: readonly string[];
  pinnedComment: string;
}

/* ── Readings ─────────────────────────────────────────────────── */

const KANJI_RE = /[一-龯]/;

function hira(s: string): string {
  return s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
}

const RENDAKU: Readonly<Record<string, string>> = {
  か: "が", き: "ぎ", く: "ぐ", け: "げ", こ: "ご",
  さ: "ざ", し: "じ", す: "ず", せ: "ぜ", そ: "ぞ",
  た: "だ", ち: "じ", つ: "づ", て: "で", と: "ど",
  は: "ば", ひ: "び", ふ: "ぶ", へ: "べ", ほ: "ぼ",
};
const HANDAKU: Readonly<Record<string, string>> = { は: "ぱ", ひ: "ぴ", ふ: "ぷ", へ: "ぺ", ほ: "ぽ" };

/** Dictionary readings of one kanji, in hiragana (stems and full forms). */
function kanjiReadings(ch: string): string[] {
  const entry = KANJI[ch];
  if (!entry) return [];
  const out = new Set<string>();
  for (const r of [...(entry.onyomi ?? []), ...(entry.kunyomi ?? [])]) {
    const h = hira(r).replace(/[-.\s]/g, "");
    out.add(h.replace(/・/g, ""));
    out.add(h.split("・")[0]!);
  }
  out.delete("");
  return [...out];
}

/** A reading as it can sound inside a compound (rendaku, small っ). */
function soundChanges(r: string, first: boolean, last: boolean): string[] {
  const out = new Set([r]);
  const head = r[0]!;
  if (!first) {
    if (RENDAKU[head]) out.add(RENDAKU[head] + r.slice(1));
    if (HANDAKU[head]) out.add(HANDAKU[head] + r.slice(1));
  }
  if (!last && /[つくちき]$/.test(r)) {
    for (const v of [...out]) out.add(v.slice(0, -1) + "っ");
  }
  return [...out];
}

/** True when the word's reading can be built from its kanji's readings. */
function readsRegularly(word: string, reading: string): boolean {
  const chars = [...word];
  let partial = [""];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]!;
    let rs: string[];
    if (ch === "々" && i > 0) rs = kanjiReadings(chars[i - 1]!);
    else if (KANJI_RE.test(ch)) rs = kanjiReadings(ch);
    else rs = [hira(ch)];
    if (!rs.length) return true; // no data: never call it a trap
    const forms = rs.flatMap((r) => soundChanges(r, i === 0, i === chars.length - 1));
    const next: string[] = [];
    for (const p of partial) {
      for (const f of forms) {
        const s = p + f;
        if (reading.startsWith(s)) next.push(s);
      }
    }
    if (!next.length) return false;
    partial = next;
  }
  return partial.includes(reading);
}

/** How a learner would naively read it: each kanji's first on'yomi. */
export function naiveReading(word: string): string {
  return [...word]
    .map((ch) => {
      const e = KANJI[ch];
      const r = e?.onyomi?.[0] ?? e?.kunyomi?.[0] ?? ch;
      return hira(r).split("・")[0]!;
    })
    .join("");
}

const plainReading = (item: Pick<VocabularyItem, "reading">) => item.reading.replace(/\s/g, "");

function editDistance(a: string, b: string): number {
  const x = [...a];
  const y = [...b];
  let prev = Array.from({ length: y.length + 1 }, (_, j) => j);
  for (let i = 1; i <= x.length; i++) {
    const cur = [i];
    for (let j = 1; j <= y.length; j++) {
      cur[j] = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + (x[i - 1] === y[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[y.length]!;
}

/**
 * Reading trap: an all-kanji word that does not read the way its kanji do,
 * and whose naive reading is clearly different (2+ kana), so a gap in the
 * kanji table (披露宴 ひろうえん vs ひろえん) is not sold as a trap.
 */
export function isReadingTrap(item: Pick<VocabularyItem, "word" | "reading">): boolean {
  const chars = [...item.word];
  if (chars.length < 2 || !chars.every((c) => KANJI_RE.test(c) || c === "々")) return false;
  if (!chars.every((c) => c === "々" || KANJI[c])) return false;
  const reading = plainReading(item);
  return !readsRegularly(item.word, reading) && editDistance(naiveReading(item.word), reading) >= 2;
}

/* ── Sound-alike twins ────────────────────────────────────────── */

let twinIndex: Map<string, VocabularyItem[]> | null = null;

function twinsOf(item: VocabularyItem): VocabularyItem[] {
  if (!twinIndex) {
    twinIndex = new Map();
    const seen = new Set<string>();
    for (const v of [...vocabulary, ...vocabularyN3]) {
      if (!KANJI_RE.test(v.word) || seen.has(v.word)) continue;
      seen.add(v.word);
      const key = plainReading(v);
      const list = twinIndex.get(key) ?? [];
      list.push(v);
      twinIndex.set(key, list);
    }
  }
  if (!KANJI_RE.test(item.word)) return [];
  return (twinIndex.get(plainReading(item)) ?? []).filter((v) => v.word !== item.word);
}

/* ── Kanji math ───────────────────────────────────────────────── */

/** First meaning of a kanji: "house; home; family" → "house". */
function kanjiSense(ch: string): string | null {
  const m = KANJI[ch]?.meaning;
  if (!m) return null;
  return m.split(/[;,；]/)[0]!.trim() || null;
}

function firstSense(meaning: string): string {
  const first = meaning.split(/[;；]/)[0] ?? meaning;
  return first.replace(/\s*\([^)]*\)\s*$/, "").trim() || meaning.trim();
}

/** Two kanji whose meanings add up to something new (家 + 賃 = rent). */
function kanjiMath(item: VocabularyItem): [string, string] | null {
  const chars = [...item.word];
  if (chars.length !== 2 || !chars.every((c) => KANJI_RE.test(c))) return null;
  const a = kanjiSense(chars[0]!);
  const b = kanjiSense(chars[1]!);
  if (!a || !b || a === b) return null;
  const sense = firstSense(item.meaning).toLowerCase();
  if (sense.includes(a.toLowerCase()) || sense.includes(b.toLowerCase())) return null;
  if (a.length + b.length > 26) return null;
  return [a, b];
}

/** Share of eligible words that open with kanji math (the rest stay classic, for comparison). */
const MATH_SHARE = 3; // out of 5

/* ── Angle ────────────────────────────────────────────────────── */

export function shortAngle(item: VocabularyItem): ShortAngle {
  const reading = plainReading(item);
  const sense = firstSense(item.meaning);

  if (isReadingTrap(item)) {
    const naive = naiveReading(item.word);
    return {
      kind: "trap",
      label: ANGLE_LABELS.trap,
      hook: { en: "Most learners misread this!", ja: "読み間違えやすい言葉！" },
      titleHead: `Most learners misread this! ${item.word} (${reading}) = "${sense}"`,
      titleHeadShort: `Most misread this! ${item.word} = "${sense}"`,
      descLine: `⚠️ Reading trap: ${item.word} is read ${reading} — not ${naive}!`,
      bait: "Did you read it right? Comment ✅ or ❌!",
      baitSpoken: "Did you read it right? Tell me in the comments!",
      pinnedComment: `Be honest — did you read 「${item.word}」 as ${reading} on the first try? ✅ / ❌ 👇`,
    };
  }

  const twin = twinsOf(item)[0];
  if (twin) {
    const pair = Math.trunc(item.id) % 2 === 0 ? [item.word, twin.word] : [twin.word, item.word];
    // Ask for the twin's meaning: the Short just taught this word, so the
    // viewer has to work out the other one.
    const twinSense = firstSense(twin.meaning);
    return {
      kind: "twin",
      label: ANGLE_LABELS.twin,
      hook: { en: "This word has a sound-alike twin!", ja: "同じ読み方の言葉がある！" },
      titleHead: `${item.word} vs ${twin.word}: same sound (${reading}), different meaning!`,
      titleHeadShort: `${item.word} vs ${twin.word}: same sound!`,
      descLine: `👯 Sound-alike: ${item.word} and ${twin.word} are both read ${reading} — but only one means "${sense}".`,
      bait: `Which one means "${twinSense}"? Comment 1 or 2!`,
      baitSpoken: `Which one means ${twinSense}? Comment one or two!`,
      choices: pair,
      pinnedComment: `Quiz: which one means "${twinSense}"? 1️⃣ ${pair[0]}  2️⃣ ${pair[1]} — answer below 👇`,
    };
  }

  const math = kanjiMath(item);
  if (math && ((Math.trunc(item.id) % 5) + 5) % 5 < MATH_SHARE) {
    const [a, b] = math;
    const [c1, c2] = [...item.word];
    return {
      kind: "math",
      label: ANGLE_LABELS.math,
      hook: { en: `"${a}" + "${b}" = ?`, ja: "漢字の足し算！" },
      titleHead: `"${a}" + "${b}" = ${item.word} (${reading}) "${sense}"`,
      titleHeadShort: `"${a}" + "${b}" = ${item.word} "${sense}"`,
      descLine: `🧮 Kanji math: ${c1} (${a}) + ${c2} (${b}) = ${item.word} (${sense})`,
      bait: `Name another word with 「${c1}」 in the comments!`,
      baitSpoken: "Name another word with this kanji in the comments!",
      pinnedComment: `${c1} + ${c2} = ${item.word} (${sense}). What other word uses 「${c1}」? 👇`,
    };
  }

  return {
    kind: "read",
    label: ANGLE_LABELS.read,
    hook: hookLineFor(item),
    titleHead: null,
    titleHeadShort: null,
    descLine: null,
    bait: `Make a sentence with 「${item.word}」 in the comments!`,
    baitSpoken: "Make your own sentence in the comments!",
    pinnedComment: `✍️ Your turn: write a sentence with 「${item.word}」 below 👇`,
  };
}
