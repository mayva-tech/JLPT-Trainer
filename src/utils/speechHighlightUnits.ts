import { groupWrapUnits, splitIntoWords } from "./wrapWords";
import {
  alignFurigana,
  alignFuriganaWithTokenSpans,
} from "./alignFurigana";
import {
  appendPhraseParticleSpeakPause,
  buildJapaneseSpeakToken,
  shouldKeepGaTight,
  shouldKeepNiTight,
  shouldKeepWoTight,
} from "./japaneseSpeakText";
import { buildEnglishSpeakText, isSkippedParentheticalNote } from "./englishSpeakText";
import {
  SPEECH_COMMA_PAUSE_MS,
  SPEECH_EN_CHAIN_PAUSE_MS,
  SPEECH_EN_COLON_PAUSE_MS,
  SPEECH_EN_SEMICOLON_PAUSE_MS,
  SPEECH_JA_COMMA_PAUSE_MS,
  SPEECH_JA_SENTENCE_PAUSE_MS,
} from "../config/speechTiming";

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
/** Grammar placeholder glyphs that are displayed but never karaoke-highlighted. */
const SLOT_MARKER_ONLY = /^[〜～~]+$/u;

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
  "しても",
  "しては",
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
  // Past / te endings (なった / しまって / わかって) — never peel conjugation
  // って/った back off the stem (な|って, しま|って).
  if (particle === "って" || particle === "った") return true;
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
  // ところに / ところを / ところが — N2 grammar; keep particle on ところ
  // (peeling left karaoke speaking ところに on the ところ span and skipping に)
  if (
    (particle === "に" ||
      particle === "を" ||
      particle === "が" ||
      particle === "へ" ||
      particle === "で" ||
      particle === "は") &&
    nextRest === "ところ"
  ) {
    return true;
  }
  return false;
}

/** Case particles that must not glue onto a following content word (を+もと). */
const CASE_PARTICLES = new Set(["を", "に", "が", "は", "で", "へ", "の", "や"]);

/**
 * Auxiliaries / fixed forms the JA Segmenter often splits mid-word
 * (べ|きだ, くだ|さい, で|しょう, ご|ざ|い|ます, …).
 * Must stay one wrap/karaoke unit so line breaks never cut inside them.
 * Longest-first for greedy merge.
 */
const ATOMIC_WRAP_WORDS = [
  // 〜てください / くださる
  "くださいませんでした",
  "くださいませんか",
  "くださいません",
  "くださいました",
  "くださいませ",
  "くださいます",
  "ください",
  "くださる",
  "下さいませんでした",
  "下さいませんか",
  "下さいません",
  "下さいました",
  "下さいませ",
  "下さい",
  // 〜なさい
  "なさいません",
  "なさいます",
  "なさい",
  "なさる",
  // ございます / でございます
  "でございませんでした",
  "でございません",
  "でございました",
  "でございます",
  "ございませんでした",
  "ございません",
  "ございました",
  "ございます",
  // いただく / いたす
  "いただけないでしょうか",
  "いただけませんか",
  "いただけません",
  "いただけますか",
  "いただけます",
  "いただけない",
  "いただきました",
  "いただきます",
  "いただく",
  "いたしました",
  "いたします",
  // べき / べし
  "べきではない",
  "べきではありません",
  "べきです",
  "べきだ",
  "べき",
  "べからず",
  "べく",
  "べし",
  // でしょう / だろう
  "でしょうか",
  "でしょうね",
  "でしょう",
  "だろう",
  // かもしれない
  "かもしれません",
  "かもしれないです",
  "かもしれない",
  "かも知れません",
  "かも知れない",
  // なければならない / いけない
  "なければなりません",
  "なければならない",
  "なければいけません",
  "なければいけない",
  "なくてはいけません",
  "なくてはいけない",
  "なくてはならない",
  "なくちゃいけない",
  "なくちゃ",
  "なきゃいけない",
  "なきゃ",
  // なる past / te (すくなく|な|っ|た, な|って)
  "いなくなった",
  "いなくなって",
  "なくなった",
  "なくなって",
  "すくなくなった",
  "すくなくなって",
  "少なくなった",
  "少なくなって",
  "多くなった",
  "多くなって",
  "大きくなった",
  "大きくなって",
  "良くなった",
  "良くなって",
  "よくなった",
  "よくなって",
  "好きになった",
  "好きになって",
  "ことになった",
  "ことになって",
  "になった",
  "になって",
  "なった",
  "なって",
  // Common past/te that Segmenter splits then peels (あっ|て, しま|って)
  "わかった",
  "わかって",
  "しまった",
  "しまって",
  "もらった",
  "もらって",
  "あった",
  "あって",
  "いった",
  "いって",
  "によって",
  "にとって",
  "について",
  // polite endings often split ま|せん / ま|した / ま|しょう
  "ませんでしたか",
  "ませんでした",
  "ませんか",
  "ましょうか",
  "ましょう",
  "ました",
  "ません",
  "でした",
  // おいでになる (おい|で cut)
  "おいでになります",
  "おいでになる",
  "おいでください",
] as const;

function isAtomicWrapWord(core: string): boolean {
  return (ATOMIC_WRAP_WORDS as readonly string[]).includes(core);
}

/** True when `core` is a proper prefix of an atomic wrap word (べ → べき). */
function isAtomicWrapPrefix(core: string): boolean {
  return (ATOMIC_WRAP_WORDS as readonly string[]).some(
    (w) => w.startsWith(core) && w.length > core.length
  );
}

/**
 * Rejoin Segmenter fragments that form an atomic wrap word.
 * Example: くだ + さい。 → ください。 / べ + きだ → べきだ
 */
function mergeAtomicWrapWords(units: HighlightUnit[]): HighlightUnit[] {
  const out: HighlightUnit[] = [];
  let i = 0;
  while (i < units.length) {
    const start = units[i]!;
    if (start.kind === "space") {
      out.push(start);
      i++;
      continue;
    }

    let bestCount = 0;
    let bestJoined: HighlightUnit | null = null;
    let concat = "";
    let joined = start;

    for (let j = i; j < units.length && j < i + 8; j++) {
      const u = units[j]!;
      if (u.kind === "space") break;
      const { core } = stripTrailingPunct(u.text);
      // Atomic forms are kana (plus 下さい). Do not cross kanji stems.
      if (j > i && !isPureKanaCore(u.text)) break;
      if (
        j === i &&
        !isPureKanaCore(u.text) &&
        !isAtomicWrapPrefix(core) &&
        !isAtomicWrapWord(core)
      ) {
        break;
      }

      concat += core;
      joined = j === i ? u : joinUnits(joined, u);
      const joinedCore = stripTrailingPunct(joined.text).core;
      if (isAtomicWrapWord(joinedCore)) {
        bestCount = j - i + 1;
        bestJoined = joined;
      }
      if (
        !isAtomicWrapWord(concat) &&
        !isAtomicWrapPrefix(concat) &&
        !isAtomicWrapWord(joinedCore) &&
        !isAtomicWrapPrefix(joinedCore)
      ) {
        break;
      }
    }

    if (bestJoined && bestCount > 1) {
      out.push(bestJoined);
      i += bestCount;
    } else {
      out.push(start);
      i++;
    }
  }
  return out;
}

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
  // Past / te-form endings after pairing っ+た (行|った, 言|って)
  if (/^(った|って|んだ|んで)$/u.test(core)) return true;
  return [...core].length === 1;
}

/** Incomplete kana piece that should glue into a conjugated word (し/まっ/た). */
function isKanaFragment(text: string): boolean {
  const { core } = stripTrailingPunct(text);
  if (!core) return false;
  const len = [...core].length;
  if (len <= 1) return true;
  if (/[っッ]$/u.test(core)) return true;
  // な|った → glue った onto な (なった); same for って
  if (/^(っ|ッ)[たて]$/u.test(core)) return true;
  if (ATTACHABLE_KANA.has(core)) return true;
  return false;
}

/** Safe to glue onto a kanji stem after fragment merges (ます/です only — not particles). */
function isFinalStemAttachable(text: string): boolean {
  const { core } = stripTrailingPunct(text);
  if (!core || !isPureKanaCore(text)) return false;
  // Never fold wrap-atomic auxiliaries into the prior stem (聞く+べきです).
  if (isAtomicWrapWord(core) || isAtomicWrapPrefix(core)) return false;
  if (
    /^(ます|です|でした|ました|ません|ましょう|した|いた|れた|します|しません|しました|しましょう)$/u.test(
      core
    )
  ) {
    return true;
  }
  if (/ます$/u.test(core) && [...core].length <= 4) return true;
  if (/です$/u.test(core) && [...core].length <= 4) return true;
  if (/ましょう$/u.test(core) && [...core].length <= 6) return true;
  if (/ません$/u.test(core) && [...core].length <= 5) return true;
  return false;
}

/**
 * Polite auxiliary pieces the segmenter often splits (しま|しょう, でし|ょう).
 * Without this merge, karaoke lights しま and skips the final しょう.
 */
function isPoliteAuxContinuation(prevCore: string, uCore: string): boolean {
  if (!prevCore || !uCore) return false;
  // しま + しょう/す/せん/した → しましょう/します/しません/しました
  if (prevCore === "しま" && /^(しょう|す|せん|した)$/u.test(uCore)) {
    return true;
  }
  // でし + ょう/た → でしょう/でした
  if (prevCore === "でし" && /^(ょう|た)$/u.test(uCore)) return true;
  // で + しょう → でしょう (Segmenter often keeps しょう whole)
  if (prevCore === "で" && /^しょう/.test(uCore)) return true;
  // まし + ょう → ましょう
  if (prevCore === "まし" && uCore === "ょう") return true;
  // …ま + しょう when the stem already absorbed し (確認しま|しょう)
  if (/ま$/u.test(prevCore) && uCore === "しょう") return true;
  // ござ + います/いません/いました
  if (prevCore === "ござ" && /^(います|いません|いました)$/u.test(uCore)) {
    return true;
  }
  // かも + しれない/しれません
  if (prevCore === "かも" && /^しれ(ない|ません|ないです)$/u.test(uCore)) {
    return true;
  }
  // おかしく + なって / よく + なった (adjective 〜く + なる)
  if (/[く]$/u.test(prevCore) && /^(なった|なって)$/u.test(uCore)) {
    return true;
  }
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
  // Do not peel か/は/… off atomic forms (でしょうか → でしょう|か).
  if (isAtomicWrapWord(core)) return [unit];

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

  // 2b) Rejoin べき / ください (etc.) before okurigana attach can steal べ.
  const atomicMerged = mergeAtomicWrapWords(compounds);

  // 3) Attach okurigana/particles onto kanji stems — but do not steal the
  //    first mora of a following kana word (も+と, し+まっ, だ+ろう, べ+き).
  const withOkuri: HighlightUnit[] = [];
  for (let i = 0; i < atomicMerged.length; i++) {
    const u = atomicMerged[i]!;
    const next = atomicMerged[i + 1];
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
    // べき / ください: never glue the first mora onto the prior stem.
    const isAtomicAuxHead =
      isAtomicWrapWord(uCore) ||
      (isAtomicWrapPrefix(uCore) &&
        !!next &&
        next.kind !== "space" &&
        isPureKanaCore(next.text));

    const canAttach =
      prev &&
      prev.kind !== "space" &&
      u.kind !== "space" &&
      hasKanji(prev.text) &&
      isAttachableOkurigana(u.text) &&
      !isDarouSplit &&
      !isAtomicAuxHead &&
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
      (isKanaFragment(prev.text) ||
        isKanaFragment(u.text) ||
        isPoliteAuxContinuation(prevCore, uCore))
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

  // 6) Final stem attach for します/です/しましょう left after fragment merges
  const out: HighlightUnit[] = [];
  for (const u of peeled) {
    const prev = out[out.length - 1];
    const prevCore = prev ? stripTrailingPunct(prev.text).core : "";
    const uCore = stripTrailingPunct(u.text).core;
    if (
      prev &&
      prev.kind !== "space" &&
      u.kind !== "space" &&
      hasKanji(prev.text) &&
      (isFinalStemAttachable(u.text) ||
        isPoliteAuxContinuation(prevCore, uCore))
    ) {
      out[out.length - 1] = joinUnits(prev, u);
    } else {
      out.push(u);
    }
  }

  // 7) Bind subject が onto the following tight predicate (問題|がある)
  //    so karaoke can light がある as one span with the voice.
  return rebindTightGaOntoFollowingPredicate(out);
}

/**
 * Peel a trailing subject が off the noun and glue it to the next predicate
 * when Nanami keeps が tight (問題がある → 問題 | がある).
 * Do not glue onto kanji-led verbs (が承ります) — that hides 承ります as its
 * own karaoke span under an unspaced reading.
 */
function rebindTightGaOntoFollowingPredicate(
  units: HighlightUnit[]
): HighlightUnit[] {
  const out: HighlightUnit[] = [];
  for (let i = 0; i < units.length; i++) {
    const u = units[i]!;
    const next = units[i + 1];
    if (!next || u.kind === "space" || next.kind === "space") {
      out.push(u);
      continue;
    }

    const { core, punct } = stripTrailingPunct(u.text);
    const nextCore = stripTrailingPunct(next.text).core;
    // がある / いれば stay tight; が承ります / が降る keep が separate.
    if (/^[\u4e00-\u9faf\u3400-\u4dbf]/u.test(nextCore)) {
      out.push(u);
      continue;
    }
    if (!shouldKeepGaTight(next.text)) {
      out.push(u);
      continue;
    }

    if (core === "が") {
      out.push(joinUnits(u, next));
      i++;
      continue;
    }

    if (core.length > 1 && core.endsWith("が") && punct === "") {
      const stemText = u.text.slice(0, -1);
      const gaUnit: HighlightUnit = {
        start: u.end - 1,
        end: u.end,
        text: "が",
        kind: "word",
      };
      out.push({
        start: u.start,
        end: u.end - 1,
        text: stemText,
        kind: classifyUnit(stemText),
      });
      out.push(joinUnits(gaUnit, next));
      i++;
      continue;
    }

    out.push(u);
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
  return splitEmbeddedWaveDashes(mergeJapaneseSpeechUnits(base));
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
  return splitEmbeddedWaveDashes(units);
}

/** True when a display span sits inside a skipped meta `(formal)`-style note. */
function spanOverlapsParenthetical(
  text: string,
  start: number,
  end: number
): boolean {
  const re = /\(([^)]*)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (!isSkippedParentheticalNote(m[1] ?? "")) continue;
    const a = m.index;
    const b = m.index + m[0].length;
    if (start < b && end > a) return true;
  }
  return false;
}

/**
 * English fallback karaoke: time from what TTS actually speaks.
 * Skips meta `(formal)` notes and slot markers `~` / `～` (pause attaches to the
 * previous word), matching `buildEnglishSpeakText`. Descriptive `(nuance)` asides
 * stay on the timeline; the headword before the aside gets a period dwell
 * ("I. soft, casual"). Trailing `;` / `—` becomes an ellipsis dwell.
 */
export function buildEnglishSpokenKaraokeSteps(text: string): HighlightUnit[] {
  // Keep slot-marker units long enough to transfer their pause to the previous
  // spoken word; they are never added to the returned highlight steps.
  const units = buildEnglishHighlightUnits(text).filter(
    (u) => u.kind !== "space"
  );
  const steps: HighlightUnit[] = [];

  for (const unit of units) {
    if (spanOverlapsParenthetical(text, unit.start, unit.end)) {
      continue;
    }
    const raw = unit.text.trim();
    if (SLOT_MARKER_ONLY.test(raw)) {
      const prev = steps.at(-1);
      if (prev) {
        const base = prev.spokenText ?? prev.text;
        prev.spokenText = /[,，、]$/u.test(base) ? base : `${base},`;
        prev.speakGapAfter = true;
      }
      continue;
    }

    // Lone em/en dash — attach ellipsis dwell to the previous word (same as `;`)
    // and extend the highlight through the dash so the pause is visible.
    if (/^[—–]+$/u.test(raw)) {
      const prev = steps.at(-1);
      if (prev) {
        const base = (prev.spokenText ?? prev.text)
          .replace(/\s*\.{3}\s*$/u, "")
          .replace(/[,.]+$/u, "");
        prev.spokenText = `${base} ...`;
        prev.end = unit.end;
      }
      continue;
    }

    // Lone "/" alternate — same ellipsis breath as speak text (`day / all`).
    if (/^\/+$/u.test(raw)) {
      const prev = steps.at(-1);
      if (prev) {
        const base = (prev.spokenText ?? prev.text)
          .replace(/\s*\.{3}\s*$/u, "")
          .replace(/[,.]+$/u, "");
        prev.spokenText = `${base} ...`;
        prev.end = unit.end;
      }
      continue;
    }

    // Descriptive "(soft, casual)" aside — period pause after the headword.
    const opensDescriptiveParen =
      raw.startsWith("(") &&
      !isSkippedParentheticalNote(raw.replace(/^\(/, "").replace(/\)[^)]*$/, ""));

    if (opensDescriptiveParen) {
      const prev = steps.at(-1);
      if (prev) {
        const base = (prev.spokenText ?? prev.text)
          .replace(/\s*\.{3}\s*$/u, "")
          .replace(/[,.]+$/u, "");
        prev.spokenText = `${base}.`;
        prev.speakGapAfter = true;
      }
    }

    // Strip display parentheses so duration tracks the spoken aside words.
    const spokenSource = raw.replace(/[()]/g, "");
    let spoken = buildEnglishSpeakText(spokenSource).trim();
    if (!spoken || !/[A-Za-z0-9']/.test(spoken)) {
      continue;
    }

    // Keep semicolon / mdash clause breaks on the karaoke timeline (spoken as "...").
    // Ellipsis already carries the pause — do not also set speakGapAfter.
    if (/[;—–]/.test(raw) && !/\.\.\./.test(spoken)) {
      spoken = `${spoken.replace(/[,.—–]+$/u, "")} ...`;
    }

    steps.push({
      ...unit,
      spokenText: spoken,
    });
  }

  return steps.length > 0 ? steps : activeHighlightUnits(units);
}

/** Pull every grammar-slot variant out into its own non-highlighted unit. */
function splitEmbeddedWaveDashes(units: HighlightUnit[]): HighlightUnit[] {
  const out: HighlightUnit[] = [];
  for (const u of units) {
    if (!/[〜～~]/u.test(u.text) || /^[〜～~]+$/u.test(u.text)) {
      out.push(u);
      continue;
    }
    const parts = u.text.split(/([〜～~]+)/u).filter((p) => p.length > 0);
    if (parts.length <= 1) {
      out.push(u);
      continue;
    }
    let offset = u.start;
    for (const part of parts) {
      out.push({
        start: offset,
        end: offset + part.length,
        text: part,
        kind: classifyUnit(part),
      });
      offset += part.length;
    }
  }
  return out;
}

/** Active karaoke units only (skip spaces and grammar-slot markers). */
export function activeHighlightUnits(units: HighlightUnit[]): HighlightUnit[] {
  return units.filter(
    (u) => u.kind !== "space" && !SLOT_MARKER_ONLY.test(u.text.trim())
  );
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
 * Tuned so JA karaoke stays near the voice (EN weights are separate).
 */
const SPEAK_TOKEN_GAP = 0.2;
/**
 * ms per mora-weight at speech rate 1 (callers divide by utterance rate).
 * Nanami runs near 7.3 mora/s at rate 1 (~137 ms/mora). 135 stays a hair
 * ahead of that so fallback karaoke does not trail the voice on long quest
 * sentences (145 + the normal-rate divisor floor was still overshooting).
 */
const JA_MORA_MS = 135;
/** Minimum dwell for a Japanese content unit at rate 1. */
const JA_MIN_UNIT_MS = 110;
/** Extra dwell after grammar-slot 〜 before the next pattern piece. */
const WAVE_DASH_PAUSE = 0.9;
/** English ms weight multiplier at speech rate 1 — tuned for Andrew karaoke. */
const EN_WEIGHT_MS = 315;
/**
 * Punctuation / clause breath weight for English karaoke.
 * × EN_WEIGHT_MS ≈ SPEECH_EN_CHAIN_PAUSE_MS at rate 1.
 */
const EN_PUNCT_PAUSE = SPEECH_EN_CHAIN_PAUSE_MS / EN_WEIGHT_MS;
/** English semicolon breath — shorter than the general EN chain. */
const EN_SEMICOLON_PAUSE = SPEECH_EN_SEMICOLON_PAUSE_MS / EN_WEIGHT_MS;
/** EN `,` breath (TTS + karaoke). JA `、` has its own floor below — see there. */
const EN_COMMA_PAUSE = SPEECH_COMMA_PAUSE_MS / EN_WEIGHT_MS;
/**
 * Karaoke weight for Japanese sentence punct (。！？).
 * Cap to the real chain pause — a 120ms floor held the last highlight (and
 * mouth) after Nanami had already finished the clause.
 */
const JA_SENTENCE_PAUSE =
  Math.max(SPEECH_JA_SENTENCE_PAUSE_MS, 60) / JA_MORA_MS;
/**
 * Readability floor for the karaoke dwell at a display-clause `、`
 * (はい、 / 明日、), independent of SPEECH_COMMA_PAUSE_MS (that constant is
 * EN's real breath value now that JA's real comma silence is 0 — see
 * SPEECH_JA_COMMA_PAUSE_MS). Deliberately smaller than the sentence
 * floor above: a comma is a lighter beat than a sentence end, and the
 * highlight dwell should not outlast the near-immediate audio handoff by more
 * than a small readability margin.
 */
const JA_COMMA_KARAOKE_FLOOR_MS = 50;
/**
 * Karaoke dwell for a display-clause `、`.
 * Mid-string commas may also be split into real utterances in speechService,
 * with SPEECH_JA_COMMA_PAUSE_MS (0) as the real silence there — this is the
 * visual floor only. TTS-inserted particle commas (わ、) still use the small
 * break below when only spokenText has `、`.
 */
const JA_COMMA_PAUSE =
  Math.max(SPEECH_JA_COMMA_PAUSE_MS, JA_COMMA_KARAOKE_FLOOR_MS) / JA_MORA_MS;
/** Light JA punct (`;` / `:` fallback) — between comma and sentence. */
const JA_PUNCT_PAUSE = JA_COMMA_PAUSE;
/** English ellipsis / em-dash / tip-newline / slash breath. */
const EN_ELLIPSIS_PAUSE = EN_PUNCT_PAUSE;
/** English sentence-final . ! ? breath. */
const EN_SENTENCE_PAUSE = EN_PUNCT_PAUSE;
/**
 * English `:` breath. A colon introduces a list or gloss ("meaning: to
 * prepare") and is spoken with a short lift, not the full stop the general
 * chain pause gives it.
 */
const EN_COLON_PAUSE = SPEECH_EN_COLON_PAUSE_MS / EN_WEIGHT_MS;
/** JA "/" / ellipsis alternate pause — match comma breath. */
const SLASH_PAUSE = JA_COMMA_PAUSE;

/**
 * Common English abbreviations whose trailing `.` is not a sentence end.
 * Compared case-insensitively against the unit core.
 */
const EN_ABBREVIATIONS = new Set([
  "mr",
  "mrs",
  "ms",
  "dr",
  "prof",
  "st",
  "no",
  "vs",
  "etc",
  "approx",
  "est",
  "fig",
  "eg",
  "ie",
  "jr",
  "sr",
  "inc",
  "ltd",
  "co",
  "dept",
  "min",
  "max",
  "sec",
  "hr",
  "yen",
]);

/**
 * True when a `.` in `text` is a real sentence end rather than an
 * abbreviation dot or a decimal point.
 *
 * Without this, `Mr.`, `a.m.`, `approx.` and `3.5` each collect a full
 * sentence breath mid-phrase — measured at 649 ms against a natural ~200 ms,
 * which is heard as the voice stalling in the middle of a clause.
 * `!` and `?` are unambiguous and always count.
 */
function hasSentenceFinalPunct(text: string): boolean {
  if (/[!?！？。]/.test(text)) return true;
  if (!/\./.test(text)) return false;

  // Neutralise every dot that is not a sentence end, then see if any remain.
  // Works token-wise, because callers pass display text and spoken text joined
  // together rather than a single clean token.
  let rest = text.replace(/(\d)\.(\d)/g, "$1$2"); // decimals: 3.5
  rest = rest.replace(/(?:[A-Za-z]\.){2,}/g, " "); // a.m., e.g., U.S.A.
  rest = rest.replace(/([A-Za-z]+)\./g, (match, word: string) =>
    EN_ABBREVIATIONS.has(word.toLowerCase()) ? " " : match
  );
  return /\./.test(rest);
}

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

/**
 * Extra mora-weight after phrase particles は / が / を / に so karaoke dwells
 * longer before the next word (筆跡は→彼, 日本語を→本格的に, 本格的に→勉強).
 *
 * Kept light: stacked particle holds on long quest sentences were a major
 * source of highlight/mouth continuing after Nanami had finished.
 */
const PHRASE_PARTICLE_PAUSE = 0.35;

function isParticleBreakUnit(text: string): boolean {
  const { core } = stripTrailingPunct(text);
  return PARTICLE_BREAK_CORES.has(core);
}

/** Topic/subject/object/adverbial particle at end of unit (筆跡は, 日本語を, 本格的に). */
function unitHasTrailingPhraseParticle(unit: HighlightUnit): boolean {
  const { core } = stripTrailingPunct(unit.text);
  if (!/[はがをに]$/u.test(core)) return false;
  if (!unit.spokenText) return true;

  // The spaced reading marks a real particle boundary (`ぐんばい が`).
  // Do not mistake the final は in compounds such as では (`でわ`) for a
  // standalone topic pause.
  const spokenCore = stripTrailingPunct(unit.spokenText).core.trim();
  return /(?:^|\s)[わはがをに]$/u.test(spokenCore);
}

/** を/が/に that bind into a pattern or governing predicate — no long phrase pause. */
function shouldSkipPhraseParticlePause(
  text: string,
  nextText?: string | null
): boolean {
  if (!nextText) return false;
  const { core } = stripTrailingPunct(text);
  if (core.endsWith("を")) return shouldKeepWoTight(nextText);
  if (core.endsWith("が")) return shouldKeepGaTight(nextText);
  if (core.endsWith("に")) return shouldKeepNiTight(nextText);
  return false;
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

/**
 * Karaoke dwell weights that are silence / phrase-edge holds — not voiced
 * content. Mouth shapes must not keep articulating across these, or the head
 * chatters after Nanami has already finished the mora.
 */
function estimateUnitPauseWeight(
  unit: HighlightUnit,
  lang: "ja" | "en",
  nextUnit?: HighlightUnit | null
): number {
  const text = unit.text;
  let punctPause = 0;
  const spokenForPunct = `${text}\n${unit.spokenText ?? ""}`;
  // Commas / Japanese phrase commas (、)
  if (lang === "en" && /[,，、]/.test(spokenForPunct)) {
    punctPause += EN_COMMA_PAUSE;
  } else if (/[、，]/.test(text)) {
    // Display clause comma — longer dwell (utterance splits handle the breath)
    punctPause += JA_COMMA_PAUSE;
  } else if (/[、，]/.test(unit.spokenText ?? "")) {
    // TTS-inserted particle comma only — light break so karaoke stays tight
    punctPause += 0.3 + KARAOKE_BREAK_POINT;
  }
  // "/" / semicolon / mdash ellipsis — longer gap; do not also add raw `;` pause
  if (/\.\.\./.test(spokenForPunct) || /\//.test(text)) {
    if (lang === "en" && /[;；]/.test(spokenForPunct)) {
      // Semicolon rewritten to "..." — use the shorter semicolon breath.
      punctPause += EN_SEMICOLON_PAUSE;
    } else {
      punctPause += lang === "en" ? EN_ELLIPSIS_PAUSE : SLASH_PAUSE;
    }
  }
  // Other phrase separators (only when not already an ellipsis pause)
  if (/[;；]/.test(spokenForPunct) && !/\.\.\./.test(spokenForPunct)) {
    punctPause += lang === "en" ? EN_SEMICOLON_PAUSE : JA_PUNCT_PAUSE;
  } else if (/[:：]/.test(spokenForPunct) && !/\.\.\./.test(spokenForPunct)) {
    punctPause += lang === "en" ? EN_COLON_PAUSE : JA_PUNCT_PAUSE;
  }
  if (
    !/\.\.\./.test(spokenForPunct) &&
    (lang === "en"
      ? hasSentenceFinalPunct(spokenForPunct)
      : /[.!?。！？]/.test(spokenForPunct))
  ) {
    punctPause += lang === "en" ? EN_SENTENCE_PAUSE : JA_SENTENCE_PAUSE;
  }
  // Lone particles as their own karaoke unit
  if (lang === "ja" && isParticleBreakUnit(text)) {
    punctPause += KARAOKE_BREAK_POINT;
  }
  // Phrase particles は/が/を/に — longer dwell before next word
  // (skip を/が/に when bound into をきっかけに / お金があれば / 本日に限り / …)
  // If spokenText already has a TTS 、, top up to the particle pause (don't double).
  if (
    lang === "ja" &&
    unitHasTrailingPhraseParticle(unit) &&
    !shouldSkipPhraseParticlePause(
      text,
      nextUnit?.spokenText ?? nextUnit?.text
    )
  ) {
    const existingCommaWeight = /[、，]/.test(text)
      ? JA_COMMA_PAUSE
      : /[、，]/.test(unit.spokenText ?? "")
        ? 0.3 + KARAOKE_BREAK_POINT
        : 0;
    if (existingCommaWeight > 0) {
      punctPause += Math.max(0, PHRASE_PARTICLE_PAUSE - existingCommaWeight);
    } else {
      punctPause += PHRASE_PARTICLE_PAUSE;
    }
  }
  // Grammar pattern slot 〜 / ～ — pause before the next piece (〜ばかりか〜も)
  if (
    nextUnit &&
    /^[〜～~]+$/u.test(stripTrailingPunct(text).core) &&
    !/^[、,]+$/u.test(stripTrailingPunct(nextUnit.text).core)
  ) {
    punctPause += WAVE_DASH_PAUSE;
  }
  if (unit.speakGapAfter && !/\.\.\./.test(spokenForPunct)) {
    punctPause += SPEAK_TOKEN_GAP;
  }
  return punctPause;
}

/** Voiced content weight only (mora / letters) — no pause dwell. */
function estimateUnitSpeechWeight(
  unit: HighlightUnit,
  lang: "ja" | "en"
): number {
  const text = unit.text;
  if (unit.kind === "punctuation") return 0;

  if (lang === "en") {
    const spoken = unit.spokenText ?? text;
    const letters = spoken.replace(/[^A-Za-z0-9']/g, "").length;
    return 0.62 + Math.min(letters, 14) * 0.085;
  }

  if (unit.spokenText) {
    return Math.max(0.75, estimateSpokenMoraWeight(unit.spokenText));
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
  return Math.max(0.75, mora);
}

export function estimateUnitDurationMs(
  unit: HighlightUnit,
  lang: "ja" | "en",
  nextUnit?: HighlightUnit | null
): number {
  if (unit.kind === "space") return 0;

  const punctPause = estimateUnitPauseWeight(unit, lang, nextUnit);

  if (lang === "en") {
    const weight = estimateUnitSpeechWeight(unit, lang) + punctPause;
    return Math.max(130, weight * EN_WEIGHT_MS);
  }

  if (unit.kind === "punctuation") {
    return Math.max(90, punctPause * JA_MORA_MS);
  }
  const weight = estimateUnitSpeechWeight(unit, lang) + punctPause;
  return Math.max(JA_MIN_UNIT_MS, weight * JA_MORA_MS);
}

/**
 * Voiced portion of a unit's karaoke dwell (ms at rate 1).
 * Used by talking-head lip-sync so the mouth closes for particle/punct holds
 * instead of chewing through leftover shapes after the audio mora ended.
 */
export function estimateUnitSpeechDurationMs(
  unit: HighlightUnit,
  lang: "ja" | "en"
): number {
  if (unit.kind === "space" || unit.kind === "punctuation") return 0;

  const speechWeight = estimateUnitSpeechWeight(unit, lang);
  if (lang === "en") {
    return Math.max(130, speechWeight * EN_WEIGHT_MS);
  }
  return Math.max(JA_MIN_UNIT_MS, speechWeight * JA_MORA_MS);
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
 * Bind subject が onto the following tight predicate (がある, があれば)
 * so karaoke lights one span and does not linger on が alone.
 */
function mergeTightGaPredicateKaraokeSteps(
  steps: SpokenKaraokeStep[]
): SpokenKaraokeStep[] {
  const out: SpokenKaraokeStep[] = [];
  for (let i = 0; i < steps.length; i++) {
    const cur = steps[i]!;
    const next = steps[i + 1];
    const curCore = stripTrailingPunct(cur.text).core;
    if (
      next &&
      curCore === "が" &&
      shouldKeepGaTight(next.spokenText || next.text) &&
      // Keep が | 承ります separate so kanji verbs get their own highlight.
      !/^[\u4e00-\u9faf\u3400-\u4dbf]/u.test(
        stripTrailingPunct(next.text).core
      )
    ) {
      const text = cur.text + next.text;
      const joiner =
        cur.speakGapAfter || /\s$/u.test(cur.spokenText) ? "" : " ";
      const spoken = `${cur.spokenText}${joiner}${next.spokenText}`.replace(
        /\s+/g,
        " "
      ).trim();
      out.push({
        start: cur.start,
        end: next.end,
        text,
        kind: classifyUnit(text),
        spokenText: spoken,
        speakGapAfter: next.speakGapAfter,
      });
      i++;
      continue;
    }
    out.push(cur);
  }
  return out;
}

/** True when every char of `unit` is covered by one or more karaoke steps. */
function unitRangeCoveredBySteps(
  unit: HighlightUnit,
  steps: SpokenKaraokeStep[]
): boolean {
  const len = unit.end - unit.start;
  if (len <= 0) return true;
  const hits = new Array<boolean>(len).fill(false);
  for (const step of steps) {
    const a = Math.max(step.start, unit.start);
    const b = Math.min(step.end, unit.end);
    for (let i = a; i < b; i++) hits[i - unit.start] = true;
  }
  return hits.every(Boolean);
}

/**
 * No extra inter-token dwell when Nanami keeps が/を/に tight with the next
 * predicate (問題が→ある, を聞いて, に限り).
 */
function shouldSkipSpeakTokenGap(
  currentToken: string,
  nextToken?: string
): boolean {
  if (!nextToken) return false;
  const { core } = stripTrailingPunct(currentToken);
  if (core === "が" || core.endsWith("が")) return shouldKeepGaTight(nextToken);
  if (core === "を" || core.endsWith("を")) return shouldKeepWoTight(nextToken);
  if (core === "に" || core.endsWith("に")) return shouldKeepNiTight(nextToken);
  return false;
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

  const missing = words.filter((u) => !unitRangeCoveredBySteps(u, steps));
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
/**
 * Derive a reading that is space-separated by karaoke unit from an unspaced
 * one (e.g. "わたしもいきます。" for 私も行きます。).
 *
 * Corpus readings are supposed to be spaced by word unit; some corpora (speech
 * styles, phone lines) store a single kana blob instead. Pairing such a blob
 * against the units positionally shifts every highlight, so recover the token
 * boundaries from the furigana alignment instead. Returns null when the text
 * cannot be aligned confidently — callers should then fall back to visible-unit
 * timing rather than guess.
 */
export function deriveSpacedReadingForUnits(
  text: string,
  reading: string,
  units: HighlightUnit[]
): string | null {
  const active = activeHighlightUnits(units);
  if (active.length === 0) return null;
  const bare = reading.replace(/\s+/g, "");
  if (!bare) return null;

  let segments;
  try {
    segments = alignFurigana(text, reading);
  } catch {
    return null;
  }
  if (segments.length === 0) return null;

  // Character offset -> kana, following the aligned segments.
  const spans: {
    start: number;
    end: number;
    kana: string;
    hasReading: boolean;
  }[] = [];
  let offset = 0;
  for (const seg of segments) {
    const end = offset + seg.text.length;
    spans.push({
      start: offset,
      end,
      kana: seg.reading ?? seg.text,
      hasReading: seg.reading !== undefined,
    });
    offset = end;
  }
  if (offset !== text.length) return null;

  const tokens: string[] = [];
  for (const unit of active) {
    let kana = "";
    for (const span of spans) {
      if (span.end <= unit.start || span.start >= unit.end) continue;
      const inside = span.start >= unit.start && span.end <= unit.end;
      if (!inside) {
        // A kanji segment straddling a unit boundary cannot be split safely.
        if (span.hasReading) return null;
        kana += text.slice(
          Math.max(span.start, unit.start),
          Math.min(span.end, unit.end)
        );
        continue;
      }
      kana += span.kana;
    }
    if (!kana) return null;
    tokens.push(kana);
  }

  const derived = tokens.join(" ");
  // Only trust it when it reproduces the original reading exactly.
  if (derived.replace(/\s+/g, "") !== bare) return null;
  return derived;
}

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
  const spokenTokens = tokenSpans.map((span) =>
    buildJapaneseSpeakToken(span.token)
  );
  const spokenWithPauses = spokenTokens.map((tok, i) =>
    appendPhraseParticleSpeakPause(tok, spokenTokens[i + 1])
  );

  for (let i = 0; i < tokenSpans.length; i++) {
    const span = tokenSpans[i]!;
    const overlapping = displayUnitsForTokenSpan(units, span.start, span.end);
    if (overlapping.length === 0) continue;

    const spokenToken = spokenWithPauses[i]!;
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
      // Clip to the reading-token surface span so glued display units like
      // 問題が still advance 問題 → が with the voice (not one long hold).
      const start = Math.max(piece.unit.start, span.start);
      const end = Math.min(piece.unit.end, span.end);
      if (end <= start) continue;
      const text = surface.slice(start, end);
      const nextToken = tokenSpans[i + 1]?.token;
      const speakGapAfter =
        isLastPiece &&
        i < tokenSpans.length - 1 &&
        !shouldSkipSpeakTokenGap(span.token, nextToken);
      steps.push({
        start,
        end,
        text,
        kind: classifyUnit(text),
        spokenText: piece.spokenText || text,
        speakGapAfter,
      });
    }
  }

  const merged = mergeTightGaPredicateKaraokeSteps(
    mergeConsecutiveKaraokeSteps(steps)
  );
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
