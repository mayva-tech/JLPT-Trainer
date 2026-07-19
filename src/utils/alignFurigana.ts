export type FuriganaSegment = {
  text: string;
  /** Hiragana under kanji only; omit for kana / punctuation. */
  reading?: string;
};

function isKanji(ch: string): boolean {
  return /[\u4e00-\u9faf\u3400-\u4dbf]/.test(ch);
}

/** Ideographic iteration mark (々) — repeats the previous kanji's reading. */
function isIterationMark(ch: string): boolean {
  return ch === "々";
}

function isWaveDash(ch: string): boolean {
  return ch === "〜" || ch === "～";
}

function isHiragana(ch: string): boolean {
  return /[\u3040-\u309f]/.test(ch);
}

function isKatakana(ch: string): boolean {
  return /[\u30a0-\u30ff]/.test(ch) || ch === "ー";
}

function isKana(ch: string): boolean {
  return isHiragana(ch) || isKatakana(ch);
}

function isPunct(ch: string): boolean {
  return /[、。！？．，!?,]/.test(ch);
}

function toHiragana(text: string): string {
  return [...text]
    .map((ch) => {
      const code = ch.codePointAt(0)!;
      if (code >= 0x30a1 && code <= 0x30f6) {
        return String.fromCodePoint(code - 0x60);
      }
      return ch;
    })
    .join("");
}

function isKanaOnlyToken(token: string): boolean {
  const core = stripTrailingPunct(token).core;
  return core.length > 0 && [...core].every((ch) => isKana(ch) || ch === "ー");
}

function stripTrailingPunct(token: string): { core: string; punct: string } {
  let core = token;
  let punct = "";
  while (core.length > 0 && isPunct(core.at(-1)!)) {
    punct = core.at(-1)! + punct;
    core = core.slice(0, -1);
  }
  return { core, punct };
}

/**
 * Compounds whose reading cannot be derived from per-kanji on/kun readings.
 *
 * Two kinds live here:
 *  - 熟字訓 (jukujikun): the reading belongs to the whole word, so the ruby
 *    spans every kanji at once (明日 → あした, never 明[あ] 日[した]).
 *  - Okurigana-omitted compounds: 敷金 is 敷[しき] 金[きん], but 敷 alone is
 *    only listed as し・く, so the DP can never find しき on its own.
 *
 * Add a line here whenever a new word's furigana comes out wrong.
 */
const COMPOUND_READINGS: Record<string, FuriganaSegment[]> = {
  明日: [{ text: "明日", reading: "あした" }],
  今日: [{ text: "今日", reading: "きょう" }],
  昨日: [{ text: "昨日", reading: "きのう" }],
  今年: [{ text: "今年", reading: "ことし" }],
  部屋: [{ text: "部屋", reading: "へや" }],
  果物: [{ text: "果物", reading: "くだもの" }],
  大人: [{ text: "大人", reading: "おとな" }],
  下手: [{ text: "下手", reading: "へた" }],
  上手: [{ text: "上手", reading: "じょうず" }],
  日本: [
    { text: "日", reading: "に" },
    { text: "本", reading: "ほん" },
  ],
  敷金: [
    { text: "敷", reading: "しき" },
    { text: "金", reading: "きん" },
  ],
  受付: [
    { text: "受", reading: "うけ" },
    { text: "付", reading: "つけ" },
  ],
  彼女: [
    { text: "彼", reading: "かの" },
    { text: "女", reading: "じょ" },
  ],
  活躍: [
    { text: "活", reading: "かつ" },
    { text: "躍", reading: "やく" },
  ],
  一方: [
    { text: "一", reading: "いっ" },
    { text: "方", reading: "ぽう" },
  ],
  世界中: [
    { text: "世", reading: "せ" },
    { text: "界", reading: "かい" },
    { text: "中", reading: "じゅう" },
  ],
  // 古く / むかし — irregular (not ふるく)
  古く: [{ text: "古く", reading: "むかし" }],
  結果: [
    { text: "結", reading: "けっ" },
    { text: "果", reading: "か" },
  ],
  土産: [{ text: "土産", reading: "みやげ" }],
  お土産: [{ text: "お" }, { text: "土産", reading: "みやげ" }],
  今朝: [{ text: "今朝", reading: "けさ" }],
  省エネ: [{ text: "省", reading: "しょう" }, { text: "エネ" }],
  排気ガス: [
    { text: "排", reading: "はい" },
    { text: "気", reading: "き" },
    { text: "ガス" },
  ],
  風邪: [{ text: "風邪", reading: "かぜ" }],
  反応: [
    { text: "反", reading: "はん" },
    { text: "応", reading: "のう" },
  ],
  副反応: [
    { text: "副", reading: "ふく" },
    { text: "反", reading: "はん" },
    { text: "応", reading: "のう" },
  ],
  粗大ゴミ: [
    { text: "粗", reading: "そ" },
    { text: "大", reading: "だい" },
    { text: "ゴミ" },
  ],
  近所付き合い: [
    { text: "近", reading: "きん" },
    { text: "所", reading: "じょ" },
    { text: "付", reading: "づ" },
    { text: "き" },
    { text: "合", reading: "あ" },
    { text: "い" },
  ],
  最寄り: [{ text: "最寄り", reading: "もより" }],
  共有スペース: [
    { text: "共", reading: "きょう" },
    { text: "有", reading: "ゆう" },
    { text: "スペース" },
  ],
  // Readings include okurigana sound with no kana on the surface
  差出人: [
    { text: "差", reading: "さし" },
    { text: "出", reading: "だし" },
    { text: "人", reading: "にん" },
  ],
  受取人: [
    { text: "受", reading: "うけ" },
    { text: "取", reading: "とり" },
    { text: "人", reading: "にん" },
  ],
  引き受け: [
    { text: "引", reading: "ひ" },
    { text: "き" },
    { text: "受", reading: "う" },
    { text: "け" },
  ],
  隅々: [
    { text: "隅", reading: "すみ" },
    { text: "々", reading: "ずみ" },
  ],
  // 軽々しく / かるがるしく
  軽々しく: [
    { text: "軽", reading: "かる" },
    { text: "々", reading: "がる" },
    { text: "しく" },
  ],
  踏切: [
    { text: "踏", reading: "ふみ" },
    { text: "切", reading: "きり" },
  ],
  切符: [
    { text: "切", reading: "きっ" },
    { text: "符", reading: "ぷ" },
  ],
  披露宴: [
    { text: "披", reading: "ひ" },
    { text: "露", reading: "ろう" },
    { text: "宴", reading: "えん" },
  ],
  仲人: [{ text: "仲人", reading: "なこうど" }],
  音頭: [
    { text: "音", reading: "おん" },
    { text: "頭", reading: "ど" },
  ],
  売上: [
    { text: "売", reading: "うり" },
    { text: "上", reading: "あげ" },
  ],
};

/** Longest first, so 日本語 tries 日本 before any shorter entry. */
const COMPOUND_ENTRIES: [string, FuriganaSegment[]][] = Object.entries(
  COMPOUND_READINGS
).sort((a, b) => b[0].length - a[0].length);

/** Split reading into tokens on spaces and after Japanese punctuation. */
export function tokenizeReading(spacedReading: string): string[] {
  const raw = spacedReading.split(/\s+/).filter(Boolean);
  const tokens: string[] = [];
  for (const part of raw) {
    let buf = "";
    for (const ch of part) {
      buf += ch;
      if (isPunct(ch)) {
        tokens.push(buf);
        buf = "";
      }
    }
    if (buf) tokens.push(buf);
  }
  return tokens;
}

export function splitMorae(reading: string): string[] {
  const chars = [...reading];
  const morae: string[] = [];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]!;
    const next = chars[i + 1];
    if (next && /[ゃゅょぁぃぅぇぉャュョァィゥェォ]/.test(next)) {
      morae.push(ch + next);
      i++;
    } else if (!isPunct(ch)) {
      morae.push(ch);
    }
  }
  return morae;
}

export function distributePerKanji(
  kanji: string,
  reading: string
): FuriganaSegment[] {
  const chars = [...kanji];
  if (chars.length === 0) return [];
  if (chars.length === 1) return [{ text: chars[0]!, reading }];

  const morae = splitMorae(reading);
  if (morae.length === 0) return chars.map((c) => ({ text: c }));

  const known = distributeByKnownReadings(chars, morae);
  if (known) return known;

  return distributeEvenFront(chars, morae);
}

/**
 * Prefer dictionary on/kun readings so compounds like 在庫 → ざい/こ
 * and 品切れ → しな/ぎれ (not し/なぎれ).
 */
function distributeByKnownReadings(
  chars: string[],
  morae: string[]
): FuriganaSegment[] | null {
  return (
    runReadingDp(chars, morae, /*strict*/ true) ??
    runReadingDp(chars, morae, /*strict*/ false)
  );
}

function runReadingDp(
  chars: string[],
  morae: string[],
  strict: boolean
): FuriganaSegment[] | null {
  const n = chars.length;
  const total = morae.length;
  const prev: Array<Array<number | null>> = Array.from({ length: n + 1 }, () =>
    Array.from({ length: total + 1 }, () => null)
  );
  const score: number[][] = Array.from({ length: n + 1 }, () =>
    Array.from({ length: total + 1 }, () => -Infinity)
  );
  score[0]![0] = 0;

  const consider = (
    i: number,
    m: number,
    next: number,
    gain: number
  ): void => {
    const nextScore = score[i]![m]! + gain;
    const cur = score[i + 1]![next]!;
    // On ties, prefer the cut that does not orphan a long vowel (already
    // filtered) and prefer keeping mora counts closer to equal — NOT
    // blindly front-loading (that breaks 野菜→や/さい and 二階→に/かい).
    if (nextScore > cur) {
      score[i + 1]![next] = nextScore;
      prev[i + 1]![next] = m;
    }
  };

  for (let i = 0; i < n; i++) {
    const candidates = [...getReadingCandidates(chars[i]!)].sort(
      (a, b) => splitMorae(b).length - splitMorae(a).length
    );
    const isLast = i === n - 1;

    for (let m = 0; m <= total; m++) {
      if (score[i]![m]! === -Infinity) continue;

      for (const cand of candidates) {
        const cm = splitMorae(cand);
        if (cm.length === 0 || m + cm.length > total) continue;
        if (morae.slice(m, m + cm.length).join("") !== cand) continue;

        // Exact dictionary match
        consider(i, m, m + cm.length, 200 + cm.length * 10);

        // Last kanji: dictionary reading may be a prefix of okurigana-inclusive
        // remainder (切 + ぎ + れ → ぎれ).
        if (isLast && m + cm.length < total) {
          consider(i, m, total, 180 + (total - m) * 10);
        }
      }

      // Length fallback when no dictionary entry, or in soft mode
      if (!strict || candidates.length === 0) {
        for (let len = 1; len <= 3 && m + len <= total; len++) {
          const cut = m + len;
          // Never split ゃゅょ from following long-vowel う/ー (ひょ|う → ひょう)
          if (splitsYouonFromLongVowel(morae, cut)) continue;
          consider(i, m, cut, 10 + len);
        }
        // Last kanji can take all remaining morae in soft mode
        if (isLast && m < total) {
          const remain = total - m;
          if (remain > 0 && remain <= 4) {
            consider(i, m, total, 10 + remain);
          }
        }
      }
    }
  }

  if (score[n]![total]! === -Infinity) return null;

  const ends: number[] = Array(n + 1).fill(0);
  ends[n] = total;
  for (let i = n; i > 0; i--) {
    const m = ends[i]!;
    const p = prev[i]![m];
    if (p === null) return null;
    ends[i - 1] = p;
  }

  const out: FuriganaSegment[] = [];
  for (let i = 0; i < n; i++) {
    const a = ends[i]!;
    const b = ends[i + 1]!;
    out.push({
      text: chars[i]!,
      reading: morae.slice(a, b).join("") || undefined,
    });
  }
  return out;
}

/** True if cutting here separates ゃ/ゅ/ょ from a following long-vowel mora. */
function splitsYouonFromLongVowel(morae: string[], cut: number): boolean {
  if (cut <= 0 || cut >= morae.length) return false;
  const left = morae[cut - 1]!;
  const right = morae[cut]!;
  return /[ゃゅょ]/.test(left) && /^[うー]/.test(right);
}

/** Even split with leftover morae on earlier kanji (ざい/こ, not ざ/いこ). */
function distributeEvenFront(
  chars: string[],
  morae: string[]
): FuriganaSegment[] {
  const n = chars.length;
  const base = Math.floor(morae.length / n);
  const extra = morae.length % n;
  const out: FuriganaSegment[] = [];
  let mi = 0;
  for (let i = 0; i < n; i++) {
    const actual = i < extra ? base + 1 : base;
    const slice = morae.slice(mi, mi + actual);
    mi += actual;
    out.push({
      text: chars[i]!,
      reading: slice.join("") || undefined,
    });
  }
  if (mi < morae.length && out.length > 0) {
    const last = out[out.length - 1]!;
    last.reading = (last.reading ?? "") + morae.slice(mi).join("");
  }
  return out;
}

/** Hiragana reading candidates for a kanji (filled from lesson vocabulary). */
const readingCandidateCache = new Map<string, string[]>();

export function registerKanjiReadingCandidates(
  character: string,
  readings: string[]
): void {
  const existing = readingCandidateCache.get(character) ?? [];
  const merged = new Set([...existing, ...readings.filter(Boolean)]);
  readingCandidateCache.set(character, [...merged]);
}

function getReadingCandidates(character: string): string[] {
  return readingCandidateCache.get(character) ?? [];
}

/**
 * Sound-change variants for a reading.
 *
 * 連濁 (rendaku): first mora may voice   ひん → びん / ぴん
 * 促音便 (gemination): a final く/つ/ち/き may become っ in compounds
 *                     はつ+ひょう → はっぴょう, がく+こう → がっこう
 */
function withRendakuVariants(hira: string): string[] {
  if (!hira) return [];
  const out = new Set<string>([hira]);
  const first = hira[0]!;
  const rest = hira.slice(1);
  const map: Record<string, string[]> = {
    か: ["が"],
    き: ["ぎ"],
    く: ["ぐ"],
    け: ["げ"],
    こ: ["ご"],
    さ: ["ざ"],
    し: ["じ"],
    す: ["ず"],
    せ: ["ぜ"],
    そ: ["ぞ"],
    た: ["だ"],
    ち: ["ぢ"],
    つ: ["づ"],
    て: ["で"],
    と: ["ど"],
    は: ["ば", "ぱ"],
    ひ: ["び", "ぴ"],
    ふ: ["ぶ", "ぷ"],
    へ: ["べ", "ぺ"],
    ほ: ["ぼ", "ぽ"],
  };
  for (const alt of map[first] ?? []) {
    out.add(alt + rest);
  }

  // 促音便: final く/つ/ち/き → っ (発 はつ → はっ, 学 がく → がっ, 一 いち → いっ)
  for (const variant of [...out]) {
    if (variant.length > 1 && /[くつちき]$/.test(variant)) {
      out.add(`${variant.slice(0, -1)}っ`);
    }
  }
  return [...out];
}

function normalizeOnyomi(raw: string): string {
  return toHiragana(raw.replace(/[^ァ-ヶー]/g, ""));
}

function normalizeKunyomi(raw: string): string[] {
  // Stem only (before ・). Do NOT register the full okurigana-inclusive form
  // (かならず / おきる) as a bare-kanji reading — that lets「起」absorb「おきる」
  // and leave a stray「きる」when the next token is「き」.
  const stem = raw.split("・")[0] ?? raw;
  return [...new Set([toHiragana(stem)].filter(Boolean))];
}

/** Seed per-kanji reading candidates from vocabulary kanjiDetails. */
export function seedKanjiReadingsFromDetails(
  details: {
    character: string;
    onyomi?: string[];
    kunyomi?: string[];
  }[]
): void {
  for (const detail of details) {
    const base = [
      ...(detail.onyomi ?? []).map(normalizeOnyomi),
      ...(detail.kunyomi ?? []).flatMap(normalizeKunyomi),
    ];
    const readings = base.flatMap(withRendakuVariants);
    registerKanjiReadingCandidates(detail.character, readings);
  }
}

type Candidate = {
  segments: FuriganaSegment[];
  end: number;
  kanjiCount: number;
  moraCount: number;
  okuriLength: number;
};

function matchQuality(c: Candidate): number {
  const ratio = c.moraCount / Math.max(c.kanjiCount, 1);
  let score = c.kanjiCount * 10;
  score -= Math.abs(ratio - 2) * 5;
  if (c.okuriLength > 0) score += 25;
  // Light penalty for multi-kanji + okurigana (prefer 結ぶ over 週結ぶ),
  // but keep it mild so compounds like 品切れ still win.
  if (c.okuriLength > 0 && c.kanjiCount > 1) score -= 10;
  // Penalize sparse 1 mora/kanji on long runs (天気予 / てんき)
  if (c.okuriLength === 0 && ratio <= 1 && c.kanjiCount >= 3) score -= 30;
  // Prefer consuming okurigana rather than leaving trailing kana unmatched
  score += c.end * 0.05;
  return score;
}

function isBetterCandidate(a: Candidate, b: Candidate): boolean {
  const qa = matchQuality(a);
  const qb = matchQuality(b);
  if (Math.abs(qa - qb) > 0.01) return qa > qb;
  return a.end > b.end;
}

function matchKanjiToken(
  surface: string,
  pos: number,
  token: string,
  limit: number
): Candidate | null {
  const { core: tokenCore, punct: tokenPunct } = stripTrailingPunct(token);
  let best: Candidate | null = null;

  for (let end = pos + 1; end <= Math.min(limit, surface.length); end++) {
    const chunk = surface.slice(pos, end);
    let i = 0;
    let kanji = "";
    while (i < chunk.length && isKanji(chunk[i]!)) {
      kanji += chunk[i];
      i++;
    }
    if (!kanji) continue;

    let okuri = "";
    while (i < chunk.length && isHiragana(chunk[i]!)) {
      okuri += chunk[i];
      i++;
    }
    let punct = "";
    while (i < chunk.length && isPunct(chunk[i]!)) {
      punct += chunk[i];
      i++;
    }
    if (i !== chunk.length) continue;
    if (okuri && !tokenCore.endsWith(okuri)) continue;
    if (punct !== tokenPunct) continue;

    const kanjiReading = okuri
      ? tokenCore.slice(0, tokenCore.length - okuri.length)
      : tokenCore;
    if (!kanjiReading) continue;

    const moraCount = splitMorae(kanjiReading).length;
    if (moraCount < kanji.length) continue; // at least 1 mora per kanji

    // Reject impossible readings (e.g. 買/かいもの, 物/れしーと)
    if (!readingFitsKanji(kanji, kanjiReading)) continue;

    const segments: FuriganaSegment[] = [
      ...distributePerKanji(kanji, kanjiReading),
    ];
    if (okuri) segments.push({ text: okuri });
    if (punct) segments.push({ text: punct });

    const candidate: Candidate = {
      segments,
      end,
      kanjiCount: kanji.length,
      moraCount,
      okuriLength: okuri.length,
    };
    if (!best || isBetterCandidate(candidate, best)) {
      best = candidate;
    }
  }
  return best;
}

/**
 * True when `reading` is a plausible furigana for `kanji` given known on/kun.
 * Prevents dumping a whole word reading onto one kanji.
 * When dictionary entries exist, only STRICT matches are allowed (no soft length guess).
 */
function readingFitsKanji(kanji: string, reading: string): boolean {
  const chars = [...kanji];
  const morae = splitMorae(reading);
  if (chars.length === 0 || morae.length < chars.length) return false;
  if (morae.length > chars.length * 4) return false;

  const known = chars.map((ch) => getReadingCandidates(ch));
  const anyKnown = known.some((list) => list.length > 0);
  if (!anyKnown) {
    // No dictionary: only allow modest length (avoid 物/れしーと-style dumps)
    return morae.length <= chars.length * 3;
  }

  if (chars.length === 1) {
    return known[0]!.includes(reading);
  }

  // Multi-kanji with dictionary: strict on/kun path only
  return runReadingDp(chars, morae, /*strict*/ true) !== null;
}

/**
 * kanji + okurigana + kanji (+ trailing okurigana).
 *   買い物   / かいもの    → 買[か] い 物[もの]
 *   引っ越し / ひっこし    → 引[ひ] っ 越[こ] し
 *   乗り換え / のりかえ    → 乗[の] り 換[か] え
 *   蒸し暑い / むしあつい  → 蒸[む] し 暑[あつ] い
 */
function matchKanjiOkuriKanji(
  surface: string,
  pos: number,
  token: string,
  limit: number
): { segments: FuriganaSegment[]; end: number } | null {
  if (!isKanji(surface[pos]!)) return null;

  const { core, punct } = stripTrailingPunct(token);
  let i = pos;

  let kanji1 = "";
  while (i < limit && i < surface.length && isKanji(surface[i]!)) {
    kanji1 += surface[i];
    i++;
  }
  if (!kanji1) return null;

  let okuri = "";
  while (i < limit && i < surface.length && isHiragana(surface[i]!)) {
    okuri += surface[i];
    i++;
  }
  if (!okuri) return null;

  let kanji2 = "";
  while (i < limit && i < surface.length && isKanji(surface[i]!)) {
    kanji2 += surface[i];
    i++;
  }
  if (!kanji2) return null;

  // Optional trailing okurigana (越し / 換え / 暑い)
  let okuri2 = "";
  while (i < limit && i < surface.length && isHiragana(surface[i]!)) {
    okuri2 += surface[i];
    i++;
  }

  // Reading must be: pre + okuri + post + okuri2
  const okuriAt = core.indexOf(okuri);
  if (okuriAt <= 0) return null;
  if (okuri2 && !core.endsWith(okuri2)) return null;

  const pre = core.slice(0, okuriAt);
  const post = core.slice(
    okuriAt + okuri.length,
    okuri2 ? core.length - okuri2.length : core.length
  );
  if (!pre || !post) return null;
  if (!readingFitsKanji(kanji1, pre)) return null;
  if (!readingFitsKanji(kanji2, post)) return null;

  let end = i;
  const segments: FuriganaSegment[] = [
    ...distributePerKanji(kanji1, pre),
    { text: okuri },
    ...distributePerKanji(kanji2, post),
  ];
  if (okuri2) segments.push({ text: okuri2 });

  if (punct) {
    if (
      end < surface.length &&
      end < limit &&
      surface.startsWith(punct, end)
    ) {
      segments.push({ text: punct });
      end += punct.length;
    } else {
      return null;
    }
  }

  return { segments, end };
}

function isDigit(ch: string): boolean {
  return /^\d$/.test(ch);
}

/** Japanese kunyomi-style readings for Arabic numerals (0–999). */
export function arabicToJapaneseReading(digits: string): string | null {
  if (!/^\d+$/.test(digits)) return null;
  const n = Number(digits);
  if (!Number.isFinite(n) || digits.length > 3) return null;

  const ones = [
    "",
    "いち",
    "に",
    "さん",
    "よん",
    "ご",
    "ろく",
    "なな",
    "はち",
    "きゅう",
  ];
  if (n === 0) return "ゼロ";
  if (n < 10) return ones[n]!;

  if (n < 100) {
    const t = Math.floor(n / 10);
    const o = n % 10;
    const tens =
      t === 1 ? "じゅう" : `${ones[t]}じゅう`;
    return o === 0 ? tens : `${tens}${ones[o]}`;
  }

  const h = Math.floor(n / 100);
  const rest = n % 100;
  const hundreds =
    h === 1 ? "ひゃく" : h === 3 ? "さんびゃく" : h === 6 ? "ろっぴゃく" : h === 8 ? "はっぴゃく" : `${ones[h]}ひゃく`;
  if (rest === 0) return hundreds;
  return `${hundreds}${arabicToJapaneseReading(String(rest))}`;
}

/**
 * Minute counter after a number: 3分→さんぷん, 10分→じゅっぷん, 30分→さんじゅっぷん.
 * Returns the reading under 分, or null if this token is not a digit+分 reading.
 */
function matchDigitMinuteCounter(
  digitReading: string,
  tokenHira: string
): string | null {
  for (const counter of ["ふん", "ぷん", "ぶん"] as const) {
    if (tokenHira === digitReading + counter) return counter;
  }
  // 促音便 before 分: じゅう→じゅっ (10分 / 30分 / 60分…)
  if (digitReading.endsWith("じゅう")) {
    const sokuon = `${digitReading.slice(0, -1)}っ`;
    for (const counter of ["ふん", "ぷん", "ぶん"] as const) {
      if (tokenHira === sokuon + counter) return counter;
    }
  }
  // 1分 → いっぷん
  if (digitReading === "いち" && tokenHira === "いっぷん") return "ぷん";
  // 6分 → ろっぷん, 8分 → はっぷん
  if (digitReading === "ろく" && tokenHira === "ろっぷん") return "ぷん";
  if (digitReading === "はち" && tokenHira === "はっぷん") return "ぷん";
  return null;
}

function matchDigitToken(
  surface: string,
  pos: number,
  token: string,
  limit: number
): { segments: FuriganaSegment[]; end: number } | null {
  if (!isDigit(surface[pos]!)) return null;

  let digitEnd = pos;
  while (digitEnd < limit && digitEnd < surface.length && isDigit(surface[digitEnd]!)) {
    digitEnd++;
  }
  const digits = surface.slice(pos, digitEnd);
  const digitReading = arabicToJapaneseReading(digits);
  if (!digitReading) return null;

  const { core, punct } = stripTrailingPunct(token);
  const tokenHira = toHiragana(core);

  const segments: FuriganaSegment[] = [
    { text: digits, reading: digitReading },
  ];
  let end = digitEnd;
  let restReading: string | null = null;

  if (tokenHira.startsWith(digitReading)) {
    restReading = tokenHira.slice(digitReading.length);
  } else {
    // 分 counter 促音便: 10分→じゅっぷん, 30分→さんじゅっぷん (じゅう→じゅっ)
    const minuteRest = matchDigitMinuteCounter(digitReading, tokenHira);
    if (minuteRest && end < limit && surface[end] === "分") {
      segments.push({ text: "分", reading: minuteRest });
      end++;
      restReading = "";
    } else {
      return null;
    }
  }

  // Following katakana in the same reading token (e.g. にじゅうパーセント)
  if (restReading && end < limit && isKatakana(surface[end]!)) {
    let kataEnd = end;
    while (
      kataEnd < limit &&
      kataEnd < surface.length &&
      isKatakana(surface[kataEnd]!)
    ) {
      kataEnd++;
    }
    const kataRun = surface.slice(end, kataEnd);
    const kataHira = toHiragana(kataRun);
    if (!restReading.startsWith(kataHira)) return null;
    segments.push({ text: kataRun });
    end = kataEnd;
    restReading = restReading.slice(kataHira.length);
  }

  // Following kanji in the same reading token
  if (restReading && end < limit && isKanji(surface[end]!)) {
    const rest = matchKanjiToken(surface, end, restReading + punct, limit);
    if (!rest) return null;
    segments.push(...rest.segments);
    return { segments, end: rest.end };
  }

  if (restReading) return null;

  if (punct) {
    if (end < surface.length && surface.startsWith(punct, end) && end + punct.length <= limit) {
      segments.push({ text: punct });
      end += punct.length;
    } else {
      return null;
    }
  }

  return { segments, end };
}

/**
 * 明日 / あした, 日本語 / にほんご — irregular compounds from COMPOUND_READINGS.
 * A leftover reading (にほん + ご) continues into the kanji that follow.
 */
function matchCompoundToken(
  surface: string,
  pos: number,
  token: string,
  limit: number
): { segments: FuriganaSegment[]; end: number } | null {
  const { core, punct } = stripTrailingPunct(token);
  const hira = toHiragana(core);
  if (!hira) return null;

  for (const [compound, compoundSegments] of COMPOUND_ENTRIES) {
    if (!surface.startsWith(compound, pos)) continue;
    if (pos + compound.length > limit) continue;

    // Plain segments may be katakana (省エネ) — normalize for comparison.
    const compoundReading = toHiragana(
      compoundSegments.map((seg) => seg.reading ?? seg.text).join("")
    );
    if (!hira.startsWith(compoundReading)) continue;

    const segments: FuriganaSegment[] = compoundSegments.map((seg) => ({
      ...seg,
    }));
    let end = pos + compound.length;

    // 日本 + 語 — the rest of the token keeps going into the next kanji
    // 古く + から — or into following hiragana (particle glued in same token)
    const restReading = hira.slice(compoundReading.length);
    if (restReading) {
      if (end < limit && isKanji(surface[end]!)) {
        const rest = matchKanjiToken(surface, end, restReading + punct, limit);
        if (!rest) continue;
        segments.push(...rest.segments);
        return { segments, end: rest.end };
      }
      if (end < limit && isHiragana(surface[end]!)) {
        let kanaEnd = end;
        while (
          kanaEnd < limit &&
          kanaEnd < surface.length &&
          isHiragana(surface[kanaEnd]!)
        ) {
          kanaEnd++;
        }
        const kanaRun = surface.slice(end, kanaEnd);
        if (toHiragana(kanaRun) !== restReading) continue;
        segments.push({ text: kanaRun });
        end = kanaEnd;
        if (punct) {
          if (!surface.startsWith(punct, end) || end + punct.length > limit) {
            continue;
          }
          segments.push({ text: punct });
          end += punct.length;
        }
        return { segments, end };
      }
      continue;
    }

    if (punct) {
      if (!surface.startsWith(punct, end) || end + punct.length > limit) {
        continue;
      }
      segments.push({ text: punct });
      end += punct.length;
    }
    return { segments, end };
  }
  return null;
}

function matchToken(
  surface: string,
  pos: number,
  token: string,
  limit: number
): { segments: FuriganaSegment[]; end: number } | null {
  if (pos >= surface.length || pos >= limit) return null;

  // Grammar-pattern placeholder 〜 / ～ (〜に反して / 〜にはんして)
  if (isWaveDash(surface[pos]!) && isWaveDash(token[0] ?? "")) {
    const wave = surface[pos]!;
    const rest = matchToken(surface, pos + 1, token.slice(1), limit);
    if (!rest) return null;
    return { segments: [{ text: wave }, ...rest.segments], end: rest.end };
  }

  const { core, punct } = stripTrailingPunct(token);

  // Irregular compounds (明日 / あした) before any per-kanji strategy
  const compound = matchCompoundToken(surface, pos, token, limit);
  if (compound) return compound;

  // Arabic numerals (20 / にじゅう) optionally + katakana/kanji in same token
  const digitMatch = matchDigitToken(surface, pos, token, limit);
  if (digitMatch) return digitMatch;

  // Exact kana match
  if (surface.startsWith(token, pos) && pos + token.length <= limit) {
    return { segments: [{ text: token }], end: pos + token.length };
  }
  if (surface.startsWith(core, pos) && pos + core.length <= limit) {
    let end = pos + core.length;
    const segments: FuriganaSegment[] = [{ text: core }];
    if (punct && surface.startsWith(punct, end) && end + punct.length <= limit) {
      segments.push({ text: punct });
      end += punct.length;
    } else if (punct) {
      return null;
    }
    return { segments, end };
  }

  // Katakana surface vs hiragana reading (アパート / あぱーと)
  // Also mixed: レジ袋 / れじぶくろ
  if (isKatakana(surface[pos]!)) {
    let kataEnd = pos;
    while (
      kataEnd < limit &&
      kataEnd < surface.length &&
      isKatakana(surface[kataEnd]!)
    ) {
      kataEnd++;
    }
    const kataRun = surface.slice(pos, kataEnd);
    const kataHira = toHiragana(kataRun);

    if (kataHira === toHiragana(core)) {
      const segments: FuriganaSegment[] = [{ text: kataRun }];
      let end = kataEnd;
      if (
        punct &&
        end < surface.length &&
        surface.startsWith(punct, end) &&
        end + punct.length <= limit
      ) {
        segments.push({ text: punct });
        end += punct.length;
      } else if (punct) {
        return null;
      }
      return { segments, end };
    }

    if (toHiragana(core).startsWith(kataHira) && kataEnd < limit) {
      const restReading = toHiragana(core).slice(kataHira.length);
      if (restReading && isKanji(surface[kataEnd]!)) {
        const rest = matchKanjiToken(
          surface,
          kataEnd,
          restReading + punct,
          limit
        );
        if (rest) {
          return {
            segments: [{ text: kataRun }, ...rest.segments],
            end: rest.end,
          };
        }
      }
    }
  }

  // Hiragana prefix + kanji (まとめ買い / まとめがい)
  const kanaKanji = matchHiraganaThenKanji(surface, pos, token, limit);
  if (kanaKanji) return kanaKanji;

  // 買い物 / かいもの (kanji + okurigana + kanji)
  const okuriKanji = matchKanjiOkuriKanji(surface, pos, token, limit);
  if (okuriKanji) return okuriKanji;

  // 隅々 / すみずみ (kanji + iteration mark)
  const iteration = matchKanjiIteration(surface, pos, token, limit);
  if (iteration) return iteration;

  const kanjiMatch = matchKanjiToken(surface, pos, token, limit);
  if (kanjiMatch) {
    return { segments: kanjiMatch.segments, end: kanjiMatch.end };
  }
  return null;
}

/**
 * 隅々 / すみずみ — 々 repeats the previous kanji reading (with optional 連濁).
 */
function matchKanjiIteration(
  surface: string,
  pos: number,
  token: string,
  limit: number
): { segments: FuriganaSegment[]; end: number } | null {
  if (!isKanji(surface[pos]!)) return null;
  if (pos + 1 >= limit || !isIterationMark(surface[pos + 1]!)) return null;

  const { core, punct } = stripTrailingPunct(token);
  const kanji = surface[pos]!;
  let end = pos + 2;

  let okuri = "";
  while (end < limit && end < surface.length && isHiragana(surface[end]!)) {
    okuri += surface[end];
    end++;
  }
  if (okuri && !core.endsWith(okuri)) return null;

  const kanjiReading = okuri ? core.slice(0, core.length - okuri.length) : core;
  if (!kanjiReading) return null;

  const candidates = getReadingCandidates(kanji);
  const tryStems =
    candidates.length > 0
      ? candidates
      : splitMorae(kanjiReading).length >= 2
        ? [
            // No dictionary: only even mora split (すみ|ずみ)
            splitMorae(kanjiReading)
              .slice(0, Math.floor(splitMorae(kanjiReading).length / 2))
              .join(""),
          ].filter(Boolean)
        : [];

  for (const stem of tryStems) {
    if (!kanjiReading.startsWith(stem)) continue;
    const rest = kanjiReading.slice(stem.length);
    if (!rest) continue;
    const allowed = new Set([stem, ...withRendakuVariants(stem)]);
    if (!allowed.has(rest)) continue;

    const segments: FuriganaSegment[] = [
      { text: kanji, reading: stem },
      { text: "々", reading: rest },
    ];
    if (okuri) segments.push({ text: okuri });

    if (punct) {
      if (
        end < surface.length &&
        end < limit &&
        surface.startsWith(punct, end)
      ) {
        segments.push({ text: punct });
        end += punct.length;
      } else {
        return null;
      }
    }

    return { segments, end };
  }

  return null;
}

/** まとめ買い ← まとめがい (okurigana/kanji compounds with leading kana). */
function matchHiraganaThenKanji(
  surface: string,
  pos: number,
  token: string,
  limit: number
): { segments: FuriganaSegment[]; end: number } | null {
  if (!isHiragana(surface[pos]!)) return null;

  const { core, punct } = stripTrailingPunct(token);
  const tokenHira = toHiragana(core);
  if (!tokenHira) return null;

  let kanaEnd = pos;
  let ti = 0;
  while (
    kanaEnd < limit &&
    kanaEnd < surface.length &&
    isHiragana(surface[kanaEnd]!) &&
    ti < tokenHira.length &&
    surface[kanaEnd] === tokenHira[ti]
  ) {
    kanaEnd++;
    ti++;
  }
  if (kanaEnd === pos || ti === 0) return null;
  if (kanaEnd >= limit || !isKanji(surface[kanaEnd]!)) return null;

  const restReading = tokenHira.slice(ti);
  if (!restReading) return null;

  const compoundRest = matchCompoundToken(
    surface,
    kanaEnd,
    restReading + punct,
    limit
  );
  if (compoundRest) {
    return {
      segments: [
        { text: surface.slice(pos, kanaEnd) },
        ...compoundRest.segments,
      ],
      end: compoundRest.end,
    };
  }

  const okuriRest = matchKanjiOkuriKanji(
    surface,
    kanaEnd,
    restReading + punct,
    limit
  );
  if (okuriRest) {
    return {
      segments: [
        { text: surface.slice(pos, kanaEnd) },
        ...okuriRest.segments,
      ],
      end: okuriRest.end,
    };
  }

  const rest = matchKanjiToken(surface, kanaEnd, restReading + punct, limit);
  if (!rest) return null;

  return {
    segments: [{ text: surface.slice(pos, kanaEnd) }, ...rest.segments],
    end: rest.end,
  };
}

/** Find where the next reading token likely starts in the surface. */
function findNextStart(
  surface: string,
  pos: number,
  nextToken: string
): number | null {
  const { core } = stripTrailingPunct(nextToken);

  // Kana that actually appears in the surface (particles, okurigana-only words)
  if (isKanaOnlyToken(nextToken)) {
    for (let i = pos + 1; i < surface.length; i++) {
      if (surface.startsWith(core, i)) return i;
      if (
        isKatakana(surface[i]!) &&
        toHiragana(surface.slice(i, i + core.length)) === toHiragana(core)
      ) {
        return i;
      }
    }
  }

  // Irregular compounds (明日 / あした)
  for (let i = pos + 1; i < surface.length; i++) {
    if (!isKanji(surface[i]!)) continue;
    if (matchCompoundToken(surface, i, nextToken, surface.length)) return i;
  }

  // Kanji + okurigana + kanji (売り場 / うりば, 買い物 / かいもの)
  for (let i = pos + 1; i < surface.length; i++) {
    if (!isKanji(surface[i]!)) continue;
    const okuriCompound = matchKanjiOkuriKanji(
      surface,
      i,
      nextToken,
      surface.length
    );
    if (okuriCompound) return i;
  }

  // Kanji + 々 (隅々 / すみずみ)
  for (let i = pos + 1; i < surface.length; i++) {
    if (!isKanji(surface[i]!)) continue;
    if (matchKanjiIteration(surface, i, nextToken, surface.length)) return i;
  }

  // Grammar 〜… tokens: start at the wave dash
  if (isWaveDash(nextToken[0] ?? "")) {
    for (let i = pos + 1; i < surface.length; i++) {
      if (isWaveDash(surface[i]!)) return i;
    }
  }

  // Pick the best-scoring start for the next content word
  let bestPos: number | null = null;
  let bestQ = -Infinity;
  for (let i = pos + 1; i < surface.length; i++) {
    if (!isKanji(surface[i]!) && !isKatakana(surface[i]!)) continue;
    const m = matchKanjiToken(surface, i, nextToken, surface.length);
    if (!m) continue;
    const q = matchQuality(m);
    if (q > bestQ || (bestPos !== null && q === bestQ && i > bestPos)) {
      bestQ = q;
      bestPos = i;
    }
  }
  return bestPos;
}

/**
 * Align surface Japanese with a space-separated reading.
 * Produces per-kanji furigana; kana and punctuation have no reading.
 */
export function alignFurigana(
  surface: string,
  spacedReading: string
): FuriganaSegment[] {
  return alignFuriganaWithTokenSpans(surface, spacedReading).segments;
}

/** One reading token mapped onto a UTF-16 surface span. */
export type ReadingTokenSpan = {
  token: string;
  start: number;
  end: number;
};

/**
 * Same alignment as `alignFurigana`, plus each reading token's surface range.
 * Used by karaoke timing so duration follows spoken kana, not kanji glyphs.
 */
export function alignFuriganaWithTokenSpans(
  surface: string,
  spacedReading: string
): { segments: FuriganaSegment[]; tokenSpans: ReadingTokenSpan[] } {
  const tokens = tokenizeReading(spacedReading);
  const segments: FuriganaSegment[] = [];
  const tokenSpans: ReadingTokenSpan[] = [];
  let pos = 0;

  for (let ti = 0; ti < tokens.length; ti++) {
    const token = tokens[ti]!;
    // Keep surface spaces so 「〜くらい / ぐらい」 round-trips.
    while (pos < surface.length && /\s/.test(surface[pos]!)) {
      segments.push({ text: surface[pos]! });
      pos++;
    }

    const next = tokens[ti + 1];
    let limit = surface.length;
    if (next) {
      const nextStart = findNextStart(surface, pos, next);
      if (nextStart !== null && nextStart > pos) {
        limit = nextStart;
      }
    }

    const tokenStart = pos;
    const matched = matchToken(surface, pos, token, limit);
    if (matched) {
      segments.push(...matched.segments);
      pos = matched.end;
      tokenSpans.push({ token, start: tokenStart, end: pos });
      continue;
    }

    // Unbounded retry (lookahead may have been too tight)
    const retry = matchToken(surface, pos, token, surface.length);
    if (retry) {
      segments.push(...retry.segments);
      pos = retry.end;
      tokenSpans.push({ token, start: tokenStart, end: pos });
      continue;
    }

    // Slash / middot between alternate forms (くらい / ぐらい)
    if (pos < surface.length && (surface[pos] === "/" || surface[pos] === "・")) {
      segments.push({ text: surface[pos]! });
      pos++;
      ti--; // retry same token
      continue;
    }

    if (pos < surface.length && isPunct(surface[pos]!)) {
      segments.push({ text: surface[pos]! });
      pos++;
      ti--; // retry same token
      continue;
    }

    if (pos < surface.length) {
      const start = pos;
      if (isKanji(surface[pos]!)) {
        while (
          pos < surface.length &&
          (isKanji(surface[pos]!) || isIterationMark(surface[pos]!))
        ) {
          pos++;
        }
      } else if (isKatakana(surface[pos]!)) {
        while (pos < surface.length && isKatakana(surface[pos]!)) pos++;
      } else {
        pos++;
      }
      segments.push({ text: surface.slice(start, pos) });
      // Still record a span so karaoke can advance past unaligned leftovers.
      tokenSpans.push({ token, start, end: pos });
    }
  }

  while (pos < surface.length) {
    segments.push({ text: surface[pos]! });
    pos++;
  }

  return { segments: mergePlain(segments), tokenSpans };
}

function mergePlain(segments: FuriganaSegment[]): FuriganaSegment[] {
  const out: FuriganaSegment[] = [];
  for (const seg of segments) {
    const prev = out[out.length - 1];
    if (!seg.reading && prev && !prev.reading) {
      prev.text += seg.text;
    } else {
      out.push({ ...seg });
    }
  }
  return out;
}

/**
 * Group furigana segments into wrap units using word-boundary splits of the surface.
 */
export function groupSegmentsByWords(
  segments: FuriganaSegment[],
  words: string[]
): FuriganaSegment[][] {
  const flat = segments.map((s) => s.text).join("");
  const groups: FuriganaSegment[][] = [];
  let cursor = 0;

  for (const word of words) {
    const wordStart = flat.indexOf(word, cursor);
    const start = wordStart >= 0 ? wordStart : cursor;
    const end = start + word.length;
    const group: FuriganaSegment[] = [];

    let pos = 0;
    let segIndex = 0;
    let segOffset = 0;
    while (
      segIndex < segments.length &&
      pos + segments[segIndex]!.text.length <= start
    ) {
      pos += segments[segIndex]!.text.length;
      segIndex++;
    }
    if (segIndex < segments.length && pos < start) {
      segOffset = start - pos;
    }

    let covered = start;
    while (covered < end && segIndex < segments.length) {
      const seg = segments[segIndex]!;
      const from = segOffset;
      const take = Math.min(seg.text.length - from, end - covered);
      const piece = seg.text.slice(from, from + take);
      group.push({
        text: piece,
        reading:
          from === 0 && take === seg.text.length
            ? seg.reading
            : from === 0 && isKanji(piece)
              ? seg.reading
              : undefined,
      });
      covered += take;
      if (from + take >= seg.text.length) {
        segIndex++;
        segOffset = 0;
      } else {
        segOffset = from + take;
      }
    }

    if (group.length > 0) groups.push(group);
    cursor = end;
  }

  return groups.length > 0 ? groups : [segments];
}
