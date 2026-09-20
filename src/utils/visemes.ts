/**
 * Viseme (mouth-shape) generation for the talking heads.
 *
 * WHY THIS IS TIMING-DRIVEN, NOT PHONEME-DRIVEN
 * The Web Speech API exposes no phoneme or viseme stream — only coarse word
 * `boundary` events, and neural voices often omit even those. True phoneme
 * lip-sync is therefore not obtainable from the browser.
 *
 * What this app *does* have is a carefully tuned karaoke model: per-unit
 * spoken-duration estimates (mora-weighted for JA, letter-weighted for EN)
 * that already keep the highlight aligned with Nanami and Andrew. The mouth is
 * driven from that same model, so the head stays in step with the highlight
 * and with the voice, and inherits every timing fix made to the karaoke path.
 *
 * JAPANESE is the strong case: the language is mora-timed and every mora
 * resolves to one of five vowel shapes. Japanese animation has used exactly
 * this five-shape あいうえお system for decades, so a mora-driven mouth is not
 * an approximation of the right technique — it *is* the right technique.
 *
 * ENGLISH is genuinely approximate. Letters are mapped to a reduced
 * Preston-Blair-style set. It reads as plausible speech rather than accurate
 * articulation, which is the honest ceiling without phoneme timing.
 */

/** Reduced mouth-shape set shared by both heads. */
export type Viseme =
  | "rest" // closed, neutral
  | "A" // open wide — あ / "father"
  | "I" // spread narrow — い / "meet"
  | "U" // rounded small — う / "boot"
  | "E" // mid spread — え / "bed"
  | "O" // rounded open — お / "boat"
  | "MBP" // lips pressed shut — m b p, ん
  | "FV" // lower lip to teeth — f v
  | "TH"; // tongue to teeth — th, l, r, s cluster

export interface VisemeFrame {
  viseme: Viseme;
  /** Offset from the start of the unit, in ms. */
  atMs: number;
  /** How long to hold this shape, in ms. */
  durationMs: number;
}

/* ── Japanese ─────────────────────────────────────────────────────── */

/** Kana → vowel shape. Youon (きゃ) resolve on their trailing small kana. */
const KANA_VOWEL: Record<string, Viseme> = {};

function registerKana(rows: Array<[string, Viseme]>): void {
  for (const [chars, viseme] of rows) {
    for (const ch of chars) KANA_VOWEL[ch] = viseme;
  }
}

registerKana([
  ["あかさたなはまやらわがざだばぱぁゃゎアカサタナハマヤラワガザダバパァャヮ", "A"],
  ["いきしちにひみりゐぎじぢびぴぃイキシチニヒミリヰギジヂビピィ", "I"],
  ["うくすつぬふむゆるぐずづぶぷぅゅっウクスツヌフムユルグズヅブプゥュッ", "U"],
  ["えけせてねへめれゑげぜでべぺぇェエケセテネヘメレヱゲゼデベペ", "E"],
  ["おこそとのほもよろをごぞどぼぽぉょオコソトノホモヨロヲゴゾドボポォョ", "O"],
]);

/** Kana whose shape is lips-closed rather than a vowel. */
const KANA_CLOSED = new Set(["ん", "ン"]);
/** Long-vowel mark and sokuon hold the previous shape. */
const KANA_HOLD = new Set(["ー", "〜", "ｰ"]);

/**
 * Splits kana into mora, keeping youon (きゃ) and long marks attached to the
 * mora they modify — mora, not characters, is the unit Japanese mouths move on.
 */
export function splitKanaMora(kana: string): string[] {
  const SMALL = "ぁぃぅぇぉゃゅょゎァィゥェォャュョヮ";
  const mora: string[] = [];
  for (const ch of kana) {
    if (!/\S/.test(ch)) continue;
    const isSmall = SMALL.includes(ch);
    const isHold = KANA_HOLD.has(ch);
    if ((isSmall || isHold) && mora.length > 0) {
      mora[mora.length - 1] += ch;
      continue;
    }
    mora.push(ch);
  }
  return mora;
}

/** Resolves one mora to its mouth shape. */
export function visemeForMora(mora: string): Viseme {
  // A youon's shape comes from its small kana (きゃ → ゃ → A).
  for (let i = mora.length - 1; i >= 0; i--) {
    const ch = mora[i]!;
    if (KANA_HOLD.has(ch)) continue;
    if (KANA_CLOSED.has(ch)) return "MBP";
    const vowel = KANA_VOWEL[ch];
    if (vowel) return vowel;
  }
  return "A";
}

/* ── English ──────────────────────────────────────────────────────── */

const EN_VOWEL: Record<string, Viseme> = {
  a: "A",
  e: "E",
  i: "I",
  o: "O",
  u: "U",
  y: "I",
};

const EN_CONSONANT: Record<string, Viseme> = {
  m: "MBP",
  b: "MBP",
  p: "MBP",
  f: "FV",
  v: "FV",
  t: "TH",
  d: "TH",
  th: "TH",
  s: "TH",
  z: "TH",
  l: "TH",
  n: "TH",
  r: "U",
  w: "U",
  q: "U",
};

/**
 * Reduces an English word to the shapes a mouth visibly makes.
 *
 * Only the shapes that read at a glance are kept: vowels, the bilabials that
 * close the lips, and f/v. Everything else collapses to a neutral consonant,
 * because animating every letter reads as chattering rather than speech.
 */
export function visemesForEnglishWord(word: string): Viseme[] {
  const letters = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!letters) return [];

  const out: Viseme[] = [];
  for (let i = 0; i < letters.length; i++) {
    const ch = letters[i]!;
    const pair = letters.slice(i, i + 2);

    if (pair === "th") {
      out.push("TH");
      i++;
      continue;
    }
    // Silent trailing e ("time", "make") does not open the mouth again.
    if (ch === "e" && i === letters.length - 1 && letters.length > 2) continue;

    const vowel = EN_VOWEL[ch];
    if (vowel) {
      // Vowel clusters ("ea", "oo") are one sustained shape, not two.
      if (out.length > 0 && out[out.length - 1] === vowel) continue;
      out.push(vowel);
      continue;
    }
    const consonant = EN_CONSONANT[ch];
    if (consonant) {
      if (out.length > 0 && out[out.length - 1] === consonant) continue;
      out.push(consonant);
    }
  }
  return out;
}

/* ── Timeline ─────────────────────────────────────────────────────── */

/** Shortest shape worth rendering; below this the mouth just flickers. */
const MIN_FRAME_MS = 55;

/**
 * Builds the mouth-shape timeline for one spoken unit.
 *
 * @param displayText  the visible text of the unit (kanji for JA)
 * @param spokenText   kana reading when available — required for JA vowels
 * @param lang         which mapping to use
 * @param durationMs   the unit's estimated spoken length, from the karaoke model
 */
export function visemesForUnit(
  displayText: string,
  spokenText: string | null | undefined,
  lang: "ja" | "en",
  durationMs: number
): VisemeFrame[] {
  const shapes = shapesFor(displayText, spokenText, lang);
  if (shapes.length === 0 || durationMs <= 0) return [];

  // Spread the shapes across the unit, but never below the flicker floor —
  // a long word with many letters holds fewer, longer shapes instead.
  const maxFrames = Math.max(1, Math.floor(durationMs / MIN_FRAME_MS));
  const used =
    shapes.length <= maxFrames ? shapes : resample(shapes, maxFrames);
  const each = durationMs / used.length;

  return used.map((viseme, i) => ({
    viseme,
    atMs: Math.round(i * each),
    durationMs: Math.round(each),
  }));
}

function shapesFor(
  displayText: string,
  spokenText: string | null | undefined,
  lang: "ja" | "en"
): Viseme[] {
  if (lang === "ja") {
    // Prefer the kana reading; kanji carries no vowel information.
    const kana = pickKana(spokenText, displayText);
    if (kana) return splitKanaMora(kana).map(visemeForMora);
    // No reading available (bare kanji): fall back to one open shape per
    // character so the mouth still moves at roughly the right rate.
    const count = [...displayText].filter((c) => /\S/.test(c)).length;
    return Array.from({ length: count }, (_, i) => (i % 2 === 0 ? "A" : "E"));
  }
  return visemesForEnglishWord(displayText);
}

/** Returns whichever of the candidates actually contains kana. */
function pickKana(...candidates: Array<string | null | undefined>): string | null {
  for (const c of candidates) {
    if (c && /[\u3040-\u309f\u30a0-\u30ff]/.test(c)) {
      return c.replace(/[、。！？・「」\s]/g, "");
    }
  }
  return null;
}

/** Evenly samples `count` shapes from a longer list, keeping first and last. */
function resample(shapes: Viseme[], count: number): Viseme[] {
  if (count >= shapes.length) return shapes;
  if (count === 1) return [shapes[0]!];
  const out: Viseme[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.round((i * (shapes.length - 1)) / (count - 1));
    out.push(shapes[idx]!);
  }
  return out;
}
