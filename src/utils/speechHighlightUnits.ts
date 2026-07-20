import { groupWrapUnits, splitIntoWords } from "./wrapWords";
import {
  alignFurigana,
  alignFuriganaWithTokenSpans,
} from "./alignFurigana";
import { buildJapaneseSpeakToken } from "./japaneseSpeakText";

const DEBUG_KARAOKE_ALIGN = false;

function debugKaraoke(...args: unknown[]) {
  if (DEBUG_KARAOKE_ALIGN) console.log("[karaoke-align]", ...args);
}

export type HighlightUnit = {
  start: number;
  end: number;
  text: string;
  kind: "word" | "punctuation" | "space";
  /**
   * Kana (or English) actually sent to TTS for this unit.
   * When set, fallback karaoke duration uses this instead of surface kanji weight.
   */
  spokenText?: string;
  /** Extra pause after this unit for the space Nanami hears between reading tokens. */
  speakGapAfter?: boolean;
};

/**
 * One fallback karaoke step: highlight a surface span while speaking `spokenText`.
 * Built from spaced reading tokens so timing follows TTS, not kanji glyph count.
 */
export type SpokenKaraokeStep = {
  start: number;
  end: number;
  text: string;
  kind: HighlightUnit["kind"];
  spokenText: string;
  speakGapAfter: boolean;
};

export type SpeechHighlightRange = {
  start: number;
  end: number;
};

const PUNCT_ONLY =
  /^[、。！？．，,.!?;:…・「」『』（）()[\]{}'"“”‘’\-–—/\\|]+$/u;

/** Trailing punctuation stripped for kana/particle checks. */
const TRAILING_PUNCT_RE =
  /[、。！？．，,.!?;:…・「」『』（）()[\]{}'"“”‘’\-–—/\\|]+$/u;

/**
 * Single-mora particles / copula that should stay alone after a content word.
 * Prevents `の+も` → `のも` so `もと` can still merge as a real word.
 */
const STANDALONE_KANA = new Set([
  "は",
  "が",
  "を",
  "に",
  "で",
  "へ",
  "と",
  "も",
  "の",
  "や",
  "か",
  "ね",
  "よ",
  "わ",
  "さ",
  "ぞ",
  "な",
  "だ",
  "ば",
  "て",
  "じ",
]);

/** Kana that may glue onto a preceding kanji stem (particles / okurigana / auxiliaries). */
const ATTACHABLE_KANA = new Set([
  ...STANDALONE_KANA,
  "ます",
  "です",
  "でした",
  "ました",
  "ません",
  "させる",
  "られる",
  "れる",
  "せる",
  "たい",
  "ない",
  "よう",
  "たり",
  "たら",
  "いた",
  "した",
  "れた",
  "みた",
  "きて",
  "って",
  "んで",
  "われ",
  "られ",
  "させ",
  "われる",
  "しまう",
]);

/** Trailing particles peeled from a merged kana run (longest first). */
const TRAILING_PEEL = [
  "だから",
  "ですから",
  "から",
  "まで",
  "より",
  "ほど",
  "だけ",
  "など",
  "って",
  "では",
  "には",
  "とは",
  "でも",
  "ても",
  "のは",
  "のが",
  "のを",
  "だ",
  "と",
  "は",
  "が",
  "を",
  "に",
  "で",
  "へ",
  "も",
  "の",
  "や",
  "か",
] as const;

/**
 * Peeling these particles would split a real word (もと/こと/もの/ほか/きっと).
 */
function wouldBreakLexicalStem(particle: string, nextRest: string): boolean {
  if (!nextRest) return true;
  // きっと / ずっと / もっと — do not peel と after っ
  if (particle === "と" && /[っッ]$/u.test(nextRest)) return true;
  // もと / こと / あと — do not peel the final と
  if (particle === "と" && /(も|こ|あ)$/u.test(nextRest)) return true;
  // もの — do not peel の from も
  if (particle === "の" && nextRest === "も") return true;
  // ものの — keep the grammar form together
  if (particle === "の" && nextRest === "もの") return true;
  // ものが / ものは / ものを — do not peel compound particle off も
  if (
    (particle === "のが" || particle === "のは" || particle === "のを") &&
    nextRest === "も"
  ) {
    return true;
  }
  // だから / ですから — keep as one particle unit
  if (particle === "から" && (nextRest === "だ" || nextRest === "です")) {
    return true;
  }
  // ほか — do not peel か from ほ
  if (particle === "か" && /(ほ)$/u.test(nextRest)) return true;
  return false;
}

/** Case particles that must not glue onto a following content word (を+もと). */
const CASE_PARTICLES = new Set(["を", "に", "が", "は", "で", "へ", "の", "や"]);

function classifyUnit(text: string): HighlightUnit["kind"] {
  if (/^\s+$/.test(text)) return "space";
  if (PUNCT_ONLY.test(text)) return "punctuation";
  return "word";
}

function stripTrailingPunct(text: string): { core: string; punct: string } {
  const punct = text.match(TRAILING_PUNCT_RE)?.[0] ?? "";
  return { core: punct ? text.slice(0, -punct.length) : text, punct };
}

function isPureKanaCore(text: string): boolean {
  const { core } = stripTrailingPunct(text);
  return core.length > 0 && /^[\u3040-\u309f\u30a0-\u30ffー]+$/u.test(core);
}

/** Katakana-only (loanwords). Hiragana particles stay separate. */
function isPureKatakanaCore(text: string): boolean {
  const { core } = stripTrailingPunct(text);
  return core.length > 0 && /^[\u30a0-\u30ffー]+$/u.test(core);
}

function kanaCoreLen(text: string): number {
  return [...stripTrailingPunct(text).core].length;
}

function hasKanji(text: string): boolean {
  return /[\u4e00-\u9faf\u3400-\u4dbf]/u.test(text);
}

function isKanjiOnlyFragment(text: string): boolean {
  const { core } = stripTrailingPunct(text);
  return core.length > 0 && /^[\u4e00-\u9faf\u3400-\u4dbf]+$/u.test(core);
}

function isAttachableOkurigana(text: string): boolean {
  const { core } = stripTrailingPunct(text);
  if (!core || !isPureKanaCore(text)) return false;
  if (ATTACHABLE_KANA.has(core)) return true;
  return [...core].length === 1;
}

/** Incomplete kana piece that should glue into a conjugated word (し/まっ/た). */
function isKanaFragment(text: string): boolean {
  const { core } = stripTrailingPunct(text);
  if (!core) return false;
  const len = [...core].length;
  if (len <= 1) return true;
  if (/[っッ]$/u.test(core)) return true;
  if (ATTACHABLE_KANA.has(core)) return true;
  return false;
}

/** Safe to glue onto a kanji stem after fragment merges (ます/です only — not particles). */
function isFinalStemAttachable(text: string): boolean {
  const { core } = stripTrailingPunct(text);
  if (!core || !isPureKanaCore(text)) return false;
  if (/^(ます|です|でした|ました|ません|した|いた|れた|します)$/u.test(core)) {
    return true;
  }
  if (/ます$/u.test(core) && [...core].length <= 4) return true;
  if (/です$/u.test(core) && [...core].length <= 4) return true;
  return false;
}

function joinUnits(a: HighlightUnit, b: HighlightUnit): HighlightUnit {
  const text = a.text + b.text;
  return {
    start: a.start,
    end: b.end,
    text,
    kind: classifyUnit(text),
  };
}

/** Do not peel past-tense た/だ off verb stems like しまっ→た. */
function canPeelCopulaOrTa(restCore: string): boolean {
  if (restCore.length < 2) return false;
  if (/[っッ]$/u.test(restCore)) return false;
  return true;
}

/**
 * Split a merged kana run into spoken chunks by peeling edge particles.
 * Example: もとだと → もと | だ | と
 * Keeps しまった intact (no peel of た after っ).
 * Never peels と from もと (would leave a single mora).
 */
function splitMergedKanaRun(unit: HighlightUnit): HighlightUnit[] {
  const { core, punct } = stripTrailingPunct(unit.text);
  if (kanaCoreLen(unit.text) <= 2) return [unit];

  const parts: string[] = [];
  let rest = core;

  let peeled = true;
  while (peeled && rest.length > 0) {
    peeled = false;
    for (const p of TRAILING_PEEL) {
      if (!rest.endsWith(p) || rest.length <= p.length) continue;
      const nextRest = rest.slice(0, -p.length);
      const nextLen = [...nextRest].length;
      // Do not peel もと→も+と (single mora left)
      if ([...p].length === 1 && nextLen < 2) continue;
      if (wouldBreakLexicalStem(p, nextRest)) continue;
      // Keep final copula on the stem (はずだ) unless another particle
      // was already peeled (もとだと → もと | だ | と).
      if (p === "だ" && parts.length === 0) continue;
      if (p === "だ" && !canPeelCopulaOrTa(nextRest)) continue;
      parts.unshift(p);
      rest = nextRest;
      peeled = true;
      break;
    }
  }

  // Leading の only (のもと → の + もと). Never peel も/と — that breaks もと.
  const leading: string[] = [];
  while (rest.startsWith("の") && rest.length > 1) {
    leading.push("の");
    rest = rest.slice(1);
  }

  const tokens = [...leading, ...(rest ? [rest] : []), ...parts];
  if (tokens.length <= 1) return [unit];

  const out: HighlightUnit[] = [];
  let offset = unit.start;
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]!;
    const withPunct = i === tokens.length - 1 ? token + punct : token;
    out.push({
      start: offset,
      end: offset + withPunct.length,
      text: withPunct,
      kind: classifyUnit(withPunct),
    });
    offset += withPunct.length;
  }
  return out;
}

/**
 * Intl.Segmenter often splits spoken words (もと → も|と, しまった → し|まっ|た).
 * Rebuild into voice-sized units.
 */
function mergeJapaneseSpeechUnits(units: HighlightUnit[]): HighlightUnit[] {
  // 1) Pair adjacent single-kana (もと)
  const paired: HighlightUnit[] = [];
  for (let i = 0; i < units.length; i++) {
    const cur = units[i]!;
    const next = units[i + 1];
    const next2 = units[i + 2];
    const prev = paired[paired.length - 1];

    // Prefer も+と → もと over の+も / を+も (〜のもとで, 〜をもとに).
    const nextIsMotoHead =
      !!next &&
      stripTrailingPunct(next.text).core === "も" &&
      !!next2 &&
      stripTrailingPunct(next2.text).core === "と";

    const canPair =
      !!next &&
      !nextIsMotoHead &&
      cur.kind !== "space" &&
      next.kind !== "space" &&
      isPureKanaCore(cur.text) &&
      isPureKanaCore(next.text) &&
      kanaCoreLen(cur.text) === 1 &&
      kanaCoreLen(next.text) === 1 &&
      stripTrailingPunct(cur.text).punct === "" &&
      !(
        STANDALONE_KANA.has(stripTrailingPunct(cur.text).core) &&
        prev &&
        (hasKanji(prev.text) || kanaCoreLen(prev.text) >= 2)
      );

    if (canPair) {
      paired.push(joinUnits(cur, next));
      i++;
      continue;
    }
    paired.push(cur);
  }

  // 1b) Merge consecutive katakana loanword fragments
  //     (スマート + フォン → スマートフォン). Segmenter often splits these.
  const kataMerged: HighlightUnit[] = [];
  for (const u of paired) {
    const prev = kataMerged[kataMerged.length - 1];
    if (
      prev &&
      prev.kind !== "space" &&
      u.kind !== "space" &&
      isPureKatakanaCore(prev.text) &&
      isPureKatakanaCore(u.text) &&
      stripTrailingPunct(prev.text).punct === ""
    ) {
      kataMerged[kataMerged.length - 1] = joinUnits(prev, u);
    } else {
      kataMerged.push(u);
    }
  }

  // 2) Glue a lone kanji onto the previous stem (落ち + 込 → 落ち込)
  //    Only single kanji — do not glue 厳しい + 指導.
  const compounds: HighlightUnit[] = [];
  for (const u of kataMerged) {
    const prev = compounds[compounds.length - 1];
    const nextCore = stripTrailingPunct(u.text).core;
    if (
      prev &&
      prev.kind !== "space" &&
      u.kind !== "space" &&
      hasKanji(prev.text) &&
      isKanjiOnlyFragment(u.text) &&
      [...nextCore].length === 1 &&
      stripTrailingPunct(prev.text).punct === ""
    ) {
      compounds[compounds.length - 1] = joinUnits(prev, u);
    } else {
      compounds.push(u);
    }
  }

  // 3) Attach okurigana/particles onto kanji stems — but do not steal the
  //    first mora of a following kana word (も+と, し+まっ, だ+ろう).
  const withOkuri: HighlightUnit[] = [];
  for (let i = 0; i < compounds.length; i++) {
    const u = compounds[i]!;
    const next = compounds[i + 1];
    const prev = withOkuri[withOkuri.length - 1];
    const uCore = stripTrailingPunct(u.text).core;
    const nextCore = next ? stripTrailingPunct(next.text).core : "";
    const nextIsKanaFragment =
      !!next &&
      next.kind !== "space" &&
      isPureKanaCore(next.text) &&
      isKanaFragment(next.text);
    // だろう: keep だ with ろう, not glued onto the verb stem (守るだ|ろう).
    const isDarouSplit =
      uCore === "だ" && !!next && /^ろう/.test(nextCore);

    const canAttach =
      prev &&
      prev.kind !== "space" &&
      u.kind !== "space" &&
      hasKanji(prev.text) &&
      isAttachableOkurigana(u.text) &&
      !isDarouSplit &&
      !(kanaCoreLen(u.text) === 1 && nextIsKanaFragment);

    if (canAttach) {
      withOkuri[withOkuri.length - 1] = joinUnits(prev!, u);
    } else {
      withOkuri.push(u);
    }
  }

  // 4) Merge consecutive pure-kana fragments (し + まっ + た。 → しまった。)
  //    Do not glue case particles onto the next word (を + もと → をもと).
  //    Do not glue a particle onto the previous stem when it starts the next
  //    word (ても + か + まわない → かまわない, not てもか).
  const kanaMerged: HighlightUnit[] = [];
  for (let i = 0; i < withOkuri.length; i++) {
    const u = withOkuri[i]!;
    const next = withOkuri[i + 1];
    const prev = kanaMerged[kanaMerged.length - 1];
    const prevCore = prev ? stripTrailingPunct(prev.text).core : "";
    const uCore = stripTrailingPunct(u.text).core;
    const nextCore = next ? stripTrailingPunct(next.text).core : "";

    const blockCaseParticle =
      !!prev &&
      CASE_PARTICLES.has(prevCore) &&
      !isKanaFragment(u.text) &&
      kanaCoreLen(u.text) >= 2;

    // か often starts a content word (かまわない), not a particle on the
    // previous stem (てもか). Other standalone particles still glue/peel normally.
    const startsNextWord =
      uCore === "か" &&
      kanaCoreLen(u.text) === 1 &&
      !!next &&
      next.kind !== "space" &&
      isPureKanaCore(next.text) &&
      !STANDALONE_KANA.has(nextCore);

    if (startsNextWord) {
      kanaMerged.push(u);
      continue;
    }

    if (
      prev &&
      prev.kind !== "space" &&
      u.kind !== "space" &&
      isPureKanaCore(prev.text) &&
      isPureKanaCore(u.text) &&
      stripTrailingPunct(prev.text).punct === "" &&
      !blockCaseParticle &&
      (isKanaFragment(prev.text) || isKanaFragment(u.text))
    ) {
      kanaMerged[kanaMerged.length - 1] = joinUnits(prev, u);
    } else {
      kanaMerged.push(u);
    }
  }

  // 5) Peel edge particles from long kana runs (もとだと → もと|だ|と)
  const peeled: HighlightUnit[] = [];
  for (const u of kanaMerged) {
    if (isPureKanaCore(u.text) && kanaCoreLen(u.text) > 2) {
      peeled.push(...splitMergedKanaRun(u));
    } else {
      peeled.push(u);
    }
  }

  // 6) Final stem attach for します/です left after fragment merges
  const out: HighlightUnit[] = [];
  for (const u of peeled) {
    const prev = out[out.length - 1];
    if (
      prev &&
      prev.kind !== "space" &&
      u.kind !== "space" &&
      hasKanji(prev.text) &&
      isFinalStemAttachable(u.text)
    ) {
      out[out.length - 1] = joinUnits(prev, u);
    } else {
      out.push(u);
    }
  }
  return out;
}

/**
 * Japanese speech highlight units.
 * Starts from the same Segmenter wrap units as the UI, then merges
 * split kana words (もと) and okurigana so karaoke tracks the voice.
 * UTF-16 indices.
 */
export function buildJapaneseHighlightUnits(text: string): HighlightUnit[] {
  const base = groupWrapUnits(splitIntoWords(text, "ja")).map((u) => ({
    start: u.start,
    end: u.end,
    text: u.text,
    kind: classifyUnit(u.text),
  }));
  return mergeJapaneseSpeechUnits(base);
}

/**
 * English display units — non-space runs (punctuation stays with the word).
 * Matches HighlightedEnglish's `\S+` / `\s+` split.
 * UTF-16 indices.
 */
export function buildEnglishHighlightUnits(text: string): HighlightUnit[] {
  const units: HighlightUnit[] = [];
  const re = /(\s+)|(\S+)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const piece = match[0];
    units.push({
      start: match.index,
      end: match.index + piece.length,
      text: piece,
      kind: classifyUnit(piece),
    });
  }
  return units;
}

/** Active karaoke units only (skip pure spaces). */
export function activeHighlightUnits(units: HighlightUnit[]): HighlightUnit[] {
  return units.filter((u) => u.kind !== "space");
}

/**
 * Map a browser boundary charIndex (+ optional charLength) onto a display unit.
 * Prefers word units over punctuation-only when possible.
 */
export function findUnitForBoundary(
  units: HighlightUnit[],
  charIndex: number,
  charLength?: number
): SpeechHighlightRange | null {
  const active = activeHighlightUnits(units);
  if (active.length === 0) return null;

  const endHint =
    typeof charLength === "number" && charLength > 0
      ? charIndex + charLength
      : charIndex;

  let containing = active.find(
    (u) => charIndex >= u.start && charIndex < u.end
  );
  if (!containing) {
    containing = active.find((u) => u.start >= charIndex) ?? active.at(-1)!;
  }

  // If we landed on punctuation-only and a word precedes it, prefer the word.
  if (containing.kind === "punctuation") {
    const prevWord = [...active]
      .reverse()
      .find((u) => u.kind === "word" && u.end <= containing!.start);
    if (prevWord && endHint <= containing.end) {
      containing = prevWord;
    }
  }

  return { start: containing.start, end: containing.end };
}

/** Ranges only — Japanese active units. */
export function splitHighlightUnits(
  text: string
): { start: number; end: number }[] {
  return activeHighlightUnits(buildJapaneseHighlightUnits(text)).map((u) => ({
    start: u.start,
    end: u.end,
  }));
}

/** Ranges only — English active units. */
export function splitEnglishHighlightUnits(
  text: string
): { start: number; end: number }[] {
  return activeHighlightUnits(buildEnglishHighlightUnits(text)).map((u) => ({
    start: u.start,
    end: u.end,
  }));
}

function isSmallKana(ch: string): boolean {
  return /[ゃゅょぁぃぅぇぉャュョァィゥェォっッ]/.test(ch);
}

function isKanji(ch: string): boolean {
  return /[\u4e00-\u9faf\u3400-\u4dbf]/.test(ch);
}

function isKana(ch: string): boolean {
  return /[\u3040-\u309f\u30a0-\u30ff]/.test(ch);
}

/**
 * Weighted duration (ms) for one highlight unit at speech rate 1.
 * Callers scale with `duration / rate`.
 *
 * For Japanese with `spokenText`, mora weight comes from the spoken kana
 * (にんしん), not from surface kanji count (妊娠 → 2×1.6).
 *
 * Break weights use a one-point step for commas / clause commas,
 * particle-only units, and other phrase separators so fallback karaoke
 * dwells slightly longer at natural voiceover breaks.
 */
const KARAOKE_BREAK_POINT = 0.15;
/**
 * Pause Nanami often inserts between spaced reading tokens.
 * Keep modest — stacked gaps across a sentence were lagging highlights.
 */
const SPEAK_TOKEN_GAP = 0.15;
/** ms per mora-weight at speech rate 1 (callers divide by utterance rate). */
const JA_MORA_MS = 150;
/** Minimum dwell for a Japanese content unit at rate 1. */
const JA_MIN_UNIT_MS = 120;

const PARTICLE_BREAK_CORES = new Set([
  "を",
  "に",
  "が",
  "は",
  "で",
  "へ",
  "の",
  "や",
  "と",
  "も",
  "から",
  "まで",
  "より",
  "ほど",
  "だけ",
  "など",
  "では",
  "には",
  "とは",
  "でも",
  "ても",
  "のは",
  "のが",
  "のを",
  "って",
]);

function isParticleBreakUnit(text: string): boolean {
  const { core } = stripTrailingPunct(text);
  return PARTICLE_BREAK_CORES.has(core);
}

/** Mora weight from kana (and digits); ignores kanji glyphs. */
function estimateSpokenMoraWeight(spoken: string): number {
  let mora = 0;
  for (const ch of spoken) {
    if (isSmallKana(ch)) mora += 0.15;
    else if (ch === "ー" || ch === "〜" || ch === "～") mora += 0.5;
    else if (isKana(ch)) mora += 1;
    else if (/\d/.test(ch)) mora += 0.8;
    else if (/\s/.test(ch)) mora += SPEAK_TOKEN_GAP;
    else if (!PUNCT_ONLY.test(ch)) mora += 0.5;
  }
  return mora;
}

export function estimateUnitDurationMs(
  unit: HighlightUnit,
  lang: "ja" | "en"
): number {
  const text = unit.text;
  if (unit.kind === "space") return 0;

  let punctPause = 0;
  // Commas / Japanese phrase commas (、)
  if (/[,，、]/.test(text)) punctPause += 0.25 + KARAOKE_BREAK_POINT;
  // Other phrase separators
  if (/[;；:]/.test(text)) punctPause += 0.35 + KARAOKE_BREAK_POINT;
  if (/[.!?。！？]/.test(text)) punctPause += 0.55 + KARAOKE_BREAK_POINT;
  // Lone particles as their own karaoke unit
  if (lang === "ja" && isParticleBreakUnit(text)) {
    punctPause += KARAOKE_BREAK_POINT;
  }
  if (unit.speakGapAfter) punctPause += SPEAK_TOKEN_GAP;

  if (lang === "en") {
    const spoken = unit.spokenText ?? text;
    const letters = spoken.replace(/[^A-Za-z0-9']/g, "").length;
    const weight = 0.6 + Math.min(letters, 12) * 0.08 + punctPause;
    return Math.max(120, weight * 280);
  }

  // Prefer aligned spoken kana whenever available.
  if (unit.spokenText) {
    const mora = estimateSpokenMoraWeight(unit.spokenText);
    if (unit.kind === "punctuation") {
      return Math.max(80, punctPause * 280);
    }
    const weight = Math.max(0.7, mora) + punctPause;
    return Math.max(JA_MIN_UNIT_MS, weight * JA_MORA_MS);
  }

  let mora = 0;
  for (const ch of text) {
    if (isSmallKana(ch)) mora += 0.15;
    else if (ch === "ー" || ch === "〜") mora += 0.5;
    else if (isKanji(ch)) mora += 1.6;
    else if (isKana(ch)) mora += 1;
    else if (/\d/.test(ch)) mora += 0.8;
    else if (!/\s/.test(ch) && !PUNCT_ONLY.test(ch)) mora += 0.5;
  }
  if (unit.kind === "punctuation") {
    return Math.max(80, punctPause * 280);
  }
  const weight = Math.max(0.7, mora) + punctPause;
  return Math.max(JA_MIN_UNIT_MS, weight * JA_MORA_MS);
}

/**
 * All active display units overlapping a reading-token surface span (in order).
 * Falls back to a nearest unit only when nothing overlaps.
 */
function displayUnitsForTokenSpan(
  displayUnits: HighlightUnit[],
  start: number,
  end: number
): HighlightUnit[] {
  const active = activeHighlightUnits(displayUnits);
  if (active.length === 0) return [];

  const overlapping = active.filter((u) => u.start < end && u.end > start);
  if (overlapping.length > 0) {
    // Prefer word units when a span also covers punctuation-only units.
    const words = overlapping.filter((u) => u.kind === "word");
    if (words.length > 0) {
      const punct = overlapping.filter(
        (u) => u.kind === "punctuation" && u.start >= words.at(-1)!.end
      );
      return [...words, ...punct];
    }
    return overlapping;
  }

  const fallback =
    active.find((u) => start >= u.start && start < u.end) ??
    active.find((u) => u.start >= start) ??
    active.at(-1);
  return fallback ? [fallback] : [];
}

function isKanaOnlyText(text: string): boolean {
  return text.length > 0 && /^[\u3040-\u309f\u30a0-\u30ffー〜～]+$/u.test(text);
}

function toHiraganaLocal(text: string): string {
  return text.replace(/[\u30a1-\u30f6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

/** Split spoken kana into mora-sized chunks for proportional allocation. */
function splitSpokenMorae(spoken: string): string[] {
  const chars = [...spoken.replace(/\s+/g, "")];
  const morae: string[] = [];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]!;
    const next = chars[i + 1];
    if (next && /[ゃゅょぁぃぅぇぉャュョァィゥェォ]/.test(next)) {
      morae.push(ch + next);
      i++;
    } else {
      morae.push(ch);
    }
  }
  return morae;
}

/**
 * Align one reading token's spoken kana onto the overlapping display units.
 * Exact path uses furigana segments; proportional mora split is the backup.
 */
function distributeSpokenTokenAcrossUnits(
  surface: string,
  readingToken: string,
  spokenToken: string,
  units: HighlightUnit[],
  tokenStart: number,
  tokenEnd: number
): Array<{ unit: HighlightUnit; spokenText: string }> {
  if (units.length === 0) return [];
  if (units.length === 1) {
    return [
      {
        unit: units[0]!,
        spokenText: spokenToken || units[0]!.text,
      },
    ];
  }

  const slice = surface.slice(tokenStart, tokenEnd);
  const segs = alignFurigana(slice, readingToken);
  const spokenAt: string[] = Array.from({ length: slice.length }, () => "");
  let p = 0;
  for (const seg of segs) {
    if (seg.reading) {
      if (seg.text.length > 0) spokenAt[p] = seg.reading;
    } else if (isKanaOnlyText(seg.text)) {
      const hira = toHiraganaLocal(seg.text);
      const hiraChars = [...hira];
      const surfaceChars = [...seg.text];
      for (let i = 0; i < surfaceChars.length; i++) {
        spokenAt[p + i] = hiraChars[i] ?? surfaceChars[i] ?? "";
      }
    }
    p += seg.text.length;
  }

  const distributed = units.map((u) => {
    const relStart = Math.max(0, u.start - tokenStart);
    const relEnd = Math.min(slice.length, u.end - tokenStart);
    let frag = "";
    for (let i = relStart; i < relEnd; i++) frag += spokenAt[i] ?? "";
    return { unit: u, spokenText: frag };
  });

  const wordPieces = distributed.filter((d) => d.unit.kind === "word");
  const emptyWords = wordPieces.filter((d) => !d.spokenText);
  const coveredSpoken = distributed.map((d) => d.spokenText).join("");
  const expectedCore = spokenToken.replace(/\s+/g, "");
  const coveredCore = coveredSpoken.replace(/\s+/g, "");

  if (
    emptyWords.length === 0 &&
    coveredCore.length > 0 &&
    // Allow particle rewrite length differences (は→わ) of at most a few chars
    Math.abs(coveredCore.length - expectedCore.length) <= 2
  ) {
    return distributed.map((d) => ({
      unit: d.unit,
      spokenText: d.spokenText
        ? buildJapaneseSpeakToken(d.spokenText)
        : d.unit.kind === "punctuation"
          ? d.unit.text
          : "",
    }));
  }

  return proportionalDistributeSpoken(units, spokenToken);
}

function proportionalDistributeSpoken(
  units: HighlightUnit[],
  spokenToken: string
): Array<{ unit: HighlightUnit; spokenText: string }> {
  const morae = splitSpokenMorae(spokenToken);
  const targets = units.filter((u) => u.kind === "word");
  const punctOnly = units.filter((u) => u.kind === "punctuation");

  if (targets.length === 0) {
    return units.map((u) => ({
      unit: u,
      spokenText: u.kind === "punctuation" ? u.text : spokenToken,
    }));
  }

  const weights = targets.map((u) => {
    const { core } = stripTrailingPunct(u.text);
    let w = 0;
    for (const ch of core) {
      if (isKanji(ch)) w += 2;
      else if (isKana(ch) || ch === "ー" || ch === "〜" || ch === "～") w += 1;
      else if (!/\s/.test(ch)) w += 1;
    }
    return Math.max(1, w);
  });
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  const out: Array<{ unit: HighlightUnit; spokenText: string }> = [];
  let moraIndex = 0;
  for (let i = 0; i < targets.length; i++) {
    const u = targets[i]!;
    const share =
      i === targets.length - 1
        ? morae.length - moraIndex
        : Math.max(
            1,
            Math.round((weights[i]! / totalWeight) * morae.length)
          );
    const take = Math.min(
      Math.max(1, share),
      Math.max(1, morae.length - moraIndex - (targets.length - 1 - i))
    );
    const frag = morae.slice(moraIndex, moraIndex + take).join("");
    moraIndex += take;
    out.push({ unit: u, spokenText: frag || spokenToken });
  }
  // Append any leftover mora to the last word unit
  if (moraIndex < morae.length && out.length > 0) {
    const last = out.at(-1)!;
    last.spokenText += morae.slice(moraIndex).join("");
  }
  for (const p of punctOnly) {
    if (p.start >= (targets.at(-1)?.end ?? 0)) {
      out.push({ unit: p, spokenText: p.text });
    }
  }
  return out;
}

/** Merge consecutive steps that highlight the same surface range. */
function mergeConsecutiveKaraokeSteps(
  steps: SpokenKaraokeStep[]
): SpokenKaraokeStep[] {
  const out: SpokenKaraokeStep[] = [];
  for (const step of steps) {
    const prev = out.at(-1);
    if (prev && prev.start === step.start && prev.end === step.end) {
      const joiner = prev.speakGapAfter ? " " : "";
      prev.spokenText = `${prev.spokenText}${joiner}${step.spokenText}`;
      prev.speakGapAfter = step.speakGapAfter;
      continue;
    }
    out.push({ ...step });
  }
  return out;
}

/**
 * Insert any active word units still missing from the timeline (surface order).
 */
function ensureWordUnitsCovered(
  steps: SpokenKaraokeStep[],
  displayUnits: HighlightUnit[]
): SpokenKaraokeStep[] {
  const words = activeHighlightUnits(displayUnits).filter(
    (u) => u.kind === "word"
  );
  if (words.length === 0) return steps;

  const covered = new Set(steps.map((s) => `${s.start}:${s.end}`));
  const missing = words.filter((u) => !covered.has(`${u.start}:${u.end}`));
  if (missing.length === 0) return steps;

  const merged = [...steps];
  for (const unit of missing) {
    const spoken = isKanaOnlyText(stripTrailingPunct(unit.text).core)
      ? toHiraganaLocal(stripTrailingPunct(unit.text).core)
      : unit.text;
    const step: SpokenKaraokeStep = {
      start: unit.start,
      end: unit.end,
      text: unit.text,
      kind: unit.kind,
      spokenText: spoken,
      speakGapAfter: false,
    };
    const insertAt = merged.findIndex((s) => s.start > unit.start);
    if (insertAt < 0) merged.push(step);
    else merged.splice(insertAt, 0, step);
  }
  return mergeConsecutiveKaraokeSteps(merged);
}

/**
 * Build fallback karaoke steps from the spaced reading (what TTS hears).
 * Each step highlights a surface display unit; duration uses spoken kana.
 * One reading token may fan out across multiple visible display units.
 */
export function buildJapaneseSpokenKaraokeSteps(
  surface: string,
  spacedReading: string,
  displayUnits?: HighlightUnit[]
): SpokenKaraokeStep[] {
  const units = displayUnits ?? buildJapaneseHighlightUnits(surface);
  const reading = spacedReading.trim();
  if (!reading) {
    return activeHighlightUnits(units).map((u) => ({
      start: u.start,
      end: u.end,
      text: u.text,
      kind: u.kind,
      spokenText: u.text,
      speakGapAfter: false,
    }));
  }

  const { tokenSpans } = alignFuriganaWithTokenSpans(surface, reading);
  if (tokenSpans.length === 0) {
    return activeHighlightUnits(units).map((u) => ({
      start: u.start,
      end: u.end,
      text: u.text,
      kind: u.kind,
      spokenText: u.text,
      speakGapAfter: false,
    }));
  }

  const steps: SpokenKaraokeStep[] = [];
  for (let i = 0; i < tokenSpans.length; i++) {
    const span = tokenSpans[i]!;
    const overlapping = displayUnitsForTokenSpan(units, span.start, span.end);
    if (overlapping.length === 0) continue;

    const spokenToken = buildJapaneseSpeakToken(span.token);
    const pieces = distributeSpokenTokenAcrossUnits(
      surface,
      span.token,
      spokenToken,
      overlapping,
      span.start,
      span.end
    );

    debugKaraoke("token", {
      token: span.token,
      spokenToken,
      span: [span.start, span.end],
      overlapping: overlapping.map((u) => u.text),
      pieces: pieces.map((p) => `${p.unit.text}->${p.spokenText}`),
    });

    for (let pi = 0; pi < pieces.length; pi++) {
      const piece = pieces[pi]!;
      const isLastPiece = pi === pieces.length - 1;
      steps.push({
        start: piece.unit.start,
        end: piece.unit.end,
        text: piece.unit.text,
        kind: piece.unit.kind,
        spokenText: piece.spokenText || piece.unit.text,
        speakGapAfter: isLastPiece && i < tokenSpans.length - 1,
      });
    }
  }

  const merged = mergeConsecutiveKaraokeSteps(steps);
  const covered = ensureWordUnitsCovered(merged, units);

  // Enforce non-decreasing starts (drop rare regressive leftovers).
  const monotonic: SpokenKaraokeStep[] = [];
  for (const step of covered) {
    const prev = monotonic.at(-1);
    if (prev && step.start < prev.start) continue;
    monotonic.push(step);
  }

  debugKaraoke("final-steps", monotonic.map((s) => `${s.text}/${s.spokenText}`));
  return monotonic;
}

/** Attach spoken-kana timing fields onto existing display units (span merge). */
export function attachJapaneseSpokenText(
  units: HighlightUnit[],
  surface: string,
  spacedReading: string
): HighlightUnit[] {
  const steps = buildJapaneseSpokenKaraokeSteps(
    surface,
    spacedReading,
    units
  );
  // Merge spoken fragments that highlight the same display span.
  const byRange = new Map<string, HighlightUnit>();
  for (const step of steps) {
    const key = `${step.start}:${step.end}`;
    const prev = byRange.get(key);
    if (!prev) {
      byRange.set(key, {
        start: step.start,
        end: step.end,
        text: step.text,
        kind: step.kind,
        spokenText: step.spokenText,
        speakGapAfter: step.speakGapAfter,
      });
    } else {
      byRange.set(key, {
        ...prev,
        spokenText: `${prev.spokenText ?? ""}${step.speakGapAfter || prev.speakGapAfter ? " " : ""}${step.spokenText}`.trim(),
        speakGapAfter: step.speakGapAfter,
      });
    }
  }

  return units.map((u) => {
    const keyed = byRange.get(`${u.start}:${u.end}`);
    if (!keyed) return u;
    return {
      ...u,
      spokenText: keyed.spokenText,
      speakGapAfter: keyed.speakGapAfter,
    };
  });
}
