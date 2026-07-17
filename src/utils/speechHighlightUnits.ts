import { groupWrapUnits, splitIntoWords } from "./wrapWords";

export type HighlightUnit = {
  start: number;
  end: number;
  text: string;
  kind: "word" | "punctuation" | "space";
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
    const prev = paired[paired.length - 1];

    const canPair =
      !!next &&
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

  // 2) Glue a lone kanji onto the previous stem (落ち + 込 → 落ち込)
  //    Only single kanji — do not glue 厳しい + 指導.
  const compounds: HighlightUnit[] = [];
  for (const u of paired) {
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
  //    first mora of a following kana word (も+と, し+まっ).
  const withOkuri: HighlightUnit[] = [];
  for (let i = 0; i < compounds.length; i++) {
    const u = compounds[i]!;
    const next = compounds[i + 1];
    const prev = withOkuri[withOkuri.length - 1];
    const nextIsKanaFragment =
      !!next &&
      next.kind !== "space" &&
      isPureKanaCore(next.text) &&
      isKanaFragment(next.text);

    const canAttach =
      prev &&
      prev.kind !== "space" &&
      u.kind !== "space" &&
      hasKanji(prev.text) &&
      isAttachableOkurigana(u.text) &&
      !(kanaCoreLen(u.text) === 1 && nextIsKanaFragment);

    if (canAttach) {
      withOkuri[withOkuri.length - 1] = joinUnits(prev!, u);
    } else {
      withOkuri.push(u);
    }
  }

  // 4) Merge consecutive pure-kana fragments (し + まっ + た。 → しまった。)
  const kanaMerged: HighlightUnit[] = [];
  for (const u of withOkuri) {
    const prev = kanaMerged[kanaMerged.length - 1];
    if (
      prev &&
      prev.kind !== "space" &&
      u.kind !== "space" &&
      isPureKanaCore(prev.text) &&
      isPureKanaCore(u.text) &&
      stripTrailingPunct(prev.text).punct === "" &&
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
 */
export function estimateUnitDurationMs(
  unit: HighlightUnit,
  lang: "ja" | "en"
): number {
  const text = unit.text;
  if (unit.kind === "space") return 0;

  let punctPause = 0;
  if (/[,，、]/.test(text)) punctPause += 0.25;
  if (/[;；:]/.test(text)) punctPause += 0.35;
  if (/[.!?。！？]/.test(text)) punctPause += 0.55;

  if (lang === "en") {
    const letters = text.replace(/[^A-Za-z0-9']/g, "").length;
    const weight = 0.6 + Math.min(letters, 12) * 0.08 + punctPause;
    return Math.max(120, weight * 280);
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
  return Math.max(140, weight * 165);
}
