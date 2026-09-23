/**
 * Browser speech synthesis with generation-safe karaoke highlighting.
 *
 * Per utterance there is exactly ONE karaoke timeline, started synchronously
 * from `onstart`, driven by absolute cumulative deadlines measured with
 * `performance.now()`. Browser `onboundary` events do not switch modes: a
 * useful forward boundary snaps the highlight to the reported unit and rebases
 * the timeline origin so every later deadline is corrected. Stale/backward
 * boundaries are ignored, and skipped units are never visually replayed.
 */

import {
  activeHighlightUnits,
  buildEnglishHighlightUnits,
  buildEnglishSpokenKaraokeSteps,
  buildJapaneseHighlightUnits,
  buildJapaneseSpokenKaraokeSteps,
  deriveSpacedReadingForUnits,
  estimateUnitDurationMs,
  findUnitForBoundary,
  type HighlightUnit,
} from "../utils/speechHighlightUnits";
import { buildJapaneseSpeakText, splitJapaneseBySentences } from "../utils/japaneseSpeakText";
import {
  buildEnglishSpeakText,
  splitEnglishByClauses,
  splitEnglishDescriptiveAside,
} from "../utils/englishSpeakText";
import {
  ENGLISH_TTS_LANG,
  JAPANESE_TTS_LANG,
  getTtsVoiceName,
  resolveEnglishVoice,
  resolveJapaneseVoice,
} from "./ttsVoices";
import {
  SPEECH_COMMA_PAUSE_MS,
  SPEECH_EN_CHAIN_PAUSE_MS,
  SPEECH_EN_SEMICOLON_PAUSE_MS,
  SPEECH_JA_COMMA_PAUSE_MS,
  SPEECH_JA_SENTENCE_PAUSE_MS,
} from "../config/speechTiming";

import { emitSpeechEvent } from "./speechBus";

export type SpeechStatus = "idle" | "speaking" | "paused";

export type SpeechHighlight = {
  /** Start index of the currently spoken unit (inclusive, UTF-16). */
  start: number;
  /** End index of the currently spoken unit (exclusive, UTF-16). */
  end: number;
};

export type SpeakCallbacks = {
  onStart?: () => void;
  onBoundary?: (highlight: SpeechHighlight) => void;
  onEnd?: () => void;
  onError?: (error?: unknown) => void;
};

/** Marker passed to `onError` when playback is cancelled (Stop or superseded). */
export const SpeechCancelled = Object.freeze({
  name: "SpeechCancelled" as const,
});

export function isSpeechCancelled(error: unknown): boolean {
  return error === SpeechCancelled;
}

export type SpeakJapaneseOptions = {
  /**
   * Space-separated kana reading (same as furigana data).
   * When set, audio uses this reading so ambiguous kanji pronounce correctly
   * (e.g. 間に → まに, not あいだに). Highlights still track `text` surface indices.
   */
  reading?: string | null;
};

export const SPEECH_RATE_NORMAL = 0.80;
export const SPEECH_RATE_SLOW = 0.68;
/** Chapter 5 "natural" — slightly faster than RPG default, still clear. */
export const SPEECH_RATE_NATURAL = 0.92;
/** Chapter 5 "fast" — modest bump only (accessibility). UI label: 1.25×. */
export const SPEECH_RATE_FAST = 1.0;
/** Slightly faster normal used only for the shadowing listen pass. */
export const SPEECH_RATE_SHADOWING = 0.85;
/** Faster Andrew English used only for interview practice. */
export const SPEECH_RATE_INTERVIEW_EN = 1.05;
/** Nanami rate for N3 JP+EN mix interview (raised from 0.85). */
export const SPEECH_RATE_INTERVIEW_MIX = 0.88;

/** True when the UI rate is the 1.25× fast preset. */
export function isFastSpeechRate(rate: number): boolean {
  return Math.abs(rate - SPEECH_RATE_FAST) < 0.001;
}

/**
 * Auto Mode rate: while 1.25× is selected, lock every scripted pass to fast
 * so Normal/Slow/Shadowing steps do not flip the chrome rate. Otherwise use
 * the scripted pass rate (normal / slow / shadowing).
 */
export function resolveAutoModeSpeechRate(
  preferred: number | null | undefined,
  scripted: number
): number {
  if (preferred != null && isFastSpeechRate(preferred)) {
    return SPEECH_RATE_FAST;
  }
  return scripted;
}

const DEBUG_SPEECH = false;
/**
 * Lead-in after onstart before the first karaoke unit (ms).
 * 0 = highlight the first unit synchronously inside `onstart`.
 */
const FALLBACK_START_OFFSET_MS = 0;
/**
 * Shared estimate scale (Andrew + Nanami).
 * Neural voices at SPEECH_RATE_NORMAL (0.80) do not slow linearly — dividing
 * by the raw rate stretches karaoke past the voice. Keep a mild stretch above
 * 1.0 so Game Mode / Quest karaoke does not race ahead of the utterance;
 * browser word boundaries still rebase when present (EN always; JA via spoken
 * reading indices when audioText ≠ display).
 * (Play/Quiz historically used ~1.35; 0.88 overshot the other way. JA briefly
 * used 0.80 estimate-only and raced Nanami whenever readings forced fallback.)
 */
const FALLBACK_TIMING_SCALE_EN = 1.08;
const FALLBACK_TIMING_SCALE_JA = 1.08;
/** @deprecated alias — tests / callers that expect a single scale get JA. */
const FALLBACK_TIMING_SCALE = FALLBACK_TIMING_SCALE_JA;

/**
 * Karaoke timeline rate divisor.
 * Floors mild normal-rate slowdown for neural voices; uses the real rate
 * when the user picks slow (0.75×) so highlights track Nanami/Andrew.
 */
export function karaokeRateDivisor(
  lang: "ja" | "en",
  rate: number
): number {
  // Same floor for JA and EN so reading-driven JA karaoke stretches like EN.
  const normalFloor = 0.88;
  if (rate < SPEECH_RATE_NORMAL - 0.001) {
    // Slow mode (and any below-normal override): track the utterance rate.
    return Math.max(rate, 0.5);
  }
  return Math.max(rate, normalFloor);
}

/** Monotonic clock for karaoke scheduling. */
function nowMs(): number {
  return typeof performance !== "undefined" && typeof performance.now === "function"
    ? performance.now()
    : Date.now();
}

/** Pause/resume handle for the karaoke timeline of the live utterance. */
type KaraokeTimeline = {
  pause: () => void;
  resume: () => void;
};

/**
 * Real silence between gloss head/aside, EN clause segments (`;` / em-dash /
 * tip newlines / sentence ends) — neural voices ignore in-utterance pauses.
 */
const ENGLISH_CHAIN_PAUSE_MS = SPEECH_EN_CHAIN_PAUSE_MS;
/** Default Nanami sentence breath (。！？); commas use SPEECH_JA_COMMA_PAUSE_MS. */
const JAPANESE_CHAIN_PAUSE_MS = SPEECH_JA_SENTENCE_PAUSE_MS;

let playbackGeneration = 0;
let fallbackTimer: number | null = null;
let activeTimeline: KaraokeTimeline | null = null;
let pendingStartTimer: number | null = null;
let asidePauseTimer: number | null = null;
/** User callbacks waiting on the gloss/clause pause between EN utterances. */
let pendingAsideCallbacks: SpeakCallbacks | null = null;
let pendingVoicesChangedHandler: (() => void) | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let activePlayback: {
  callbacks?: SpeakCallbacks;
  settled: boolean;
} | null = null;

function clearAsidePauseTimer() {
  if (asidePauseTimer !== null) {
    window.clearTimeout(asidePauseTimer);
    asidePauseTimer = null;
  }
}

function clearPendingAsideChain() {
  clearAsidePauseTimer();
  pendingAsideCallbacks = null;
}

function debug(...args: unknown[]) {
  if (DEBUG_SPEECH) console.log("[speech]", ...args);
}

function allVoices(): SpeechSynthesisVoice[] {
  return window.speechSynthesis?.getVoices() ?? [];
}

function pickNanamiVoice(): SpeechSynthesisVoice | null {
  return resolveJapaneseVoice(allVoices());
}

function pickEnglishVoice(): SpeechSynthesisVoice | null {
  return resolveEnglishVoice(allVoices());
}

export function getSpeakableJapanese(
  step: string,
  item: { word: string; phrase: string; sentence: string }
): string | null {
  return getJapaneseSpeechInput(step, item)?.text ?? null;
}

/** Surface text + optional reading for correct TTS pronunciation. */
export function getJapaneseSpeechInput(
  step: string,
  item: {
    word: string;
    reading?: string;
    phrase: string;
    phraseReading?: string;
    sentence: string;
    sentenceReading?: string;
  }
): { text: string; reading?: string } | null {
  switch (step) {
    case "word":
    case "review":
      return { text: item.word, reading: item.reading };
    case "phrase":
      return { text: item.phrase, reading: item.phraseReading };
    case "sentence":
    case "shadowing":
      return { text: item.sentence, reading: item.sentenceReading };
    default:
      return null;
  }
}

export function getSpeakableEnglish(
  step: string,
  item: {
    meaning: string;
    phraseMeaning: string;
    sentenceMeaning: string;
  }
): string | null {
  switch (step) {
    case "word":
    case "review":
      return item.meaning;
    case "phrase":
      return item.phraseMeaning;
    case "sentence":
    case "shadowing":
      return item.sentenceMeaning;
    default:
      return null;
  }
}

export function getGrammarSpeakableJapanese(
  step: string,
  item: { pattern: string; sentence: string }
): string | null {
  return getGrammarJapaneseSpeechInput(step, item)?.text ?? null;
}

export function getGrammarJapaneseSpeechInput(
  step: string,
  item: {
    pattern: string;
    patternReading?: string;
    sentence: string;
    sentenceReading?: string;
  }
): { text: string; reading?: string } | null {
  switch (step) {
    case "pattern":
    case "review":
      return { text: item.pattern, reading: item.patternReading };
    case "sentence":
    case "shadowing":
      return { text: item.sentence, reading: item.sentenceReading };
    default:
      return null;
  }
}

export function getGrammarSpeakableEnglish(
  step: string,
  item: { meaning: string; sentenceMeaning: string }
): string | null {
  switch (step) {
    case "pattern":
    case "review":
      return item.meaning;
    case "sentence":
    case "shadowing":
      return item.sentenceMeaning;
    default:
      return null;
  }
}

/** Re-export unit helpers for callers/tests. */
export {
  buildJapaneseHighlightUnits,
  buildEnglishHighlightUnits,
  findUnitForBoundary,
  splitHighlightUnits,
  splitEnglishHighlightUnits,
} from "../utils/speechHighlightUnits";

function clearFallbackTimer() {
  if (fallbackTimer !== null) {
    window.clearTimeout(fallbackTimer);
    fallbackTimer = null;
  }
}

function clearPendingStartOnly() {
  if (pendingStartTimer !== null) {
    window.clearTimeout(pendingStartTimer);
    pendingStartTimer = null;
  }
  if (pendingVoicesChangedHandler && window.speechSynthesis) {
    window.speechSynthesis.removeEventListener(
      "voiceschanged",
      pendingVoicesChangedHandler
    );
    pendingVoicesChangedHandler = null;
  }
}

/** Clear timers/listeners for the current utterance lifecycle (not generation). */
function clearPlaybackHandles() {
  clearFallbackTimer();
  clearPendingStartOnly();
  clearAsidePauseTimer();
  activeTimeline = null;
  activeUtterance = null;
}

/** Settle the in-flight waiter as cancelled. Does not call `onEnd`. */
function settleActiveAsCancelled(): void {
  if (pendingAsideCallbacks) {
    const cb = pendingAsideCallbacks;
    pendingAsideCallbacks = null;
    clearAsidePauseTimer();
    cb.onError?.(SpeechCancelled);
  }
  const current = activePlayback;
  if (!current || current.settled) return;
  current.settled = true;
  debug("cancel", playbackGeneration);
  current.callbacks?.onError?.(SpeechCancelled);
}

function isUsefulBoundaryName(name: string | undefined): boolean {
  return !name || name === "word" || name === "sentence";
}

/**
 * Map a browser boundary in `audioText` onto a display karaoke unit when the
 * spoken string differs from the visible text (EN stripped notes / JA readings).
 * Walks units by their spoken form so glosses like "to return (goods)" and
 * kanji+reading lines still rebase instead of running estimate-only.
 *
 * Matching tolerates TTS whitespace / 、 inserted by particle pauses so a unit
 * spoken as "さいしょの" still hits audio "さいしょ の".
 */
function findSpokenBoundaryUnit(
  units: HighlightUnit[],
  audioText: string,
  charIndex: number
): SpeechHighlight | null {
  if (units.length === 0) return null;
  let searchFrom = 0;
  for (let i = 0; i < units.length; i += 1) {
    const spoken = (units[i]!.spokenText ?? units[i]!.text).trim();
    if (!spoken) continue;
    const hit = indexOfSpokenInAudio(audioText, spoken, searchFrom);
    if (!hit) continue;
    const { at, end } = hit;
    if (charIndex >= at && charIndex < Math.max(end, at + 1)) {
      return { start: units[i]!.start, end: units[i]!.end };
    }
    if (charIndex < at) {
      return { start: units[i]!.start, end: units[i]!.end };
    }
    searchFrom = end;
  }
  const last = units[units.length - 1]!;
  return { start: last.start, end: last.end };
}

/**
 * Locate `spoken` inside `audioText` starting at `from`.
 * Exact match first; then allow optional spaces / ideographic commas between
 * characters, and treat hiragana/katakana as equivalent so かあど still hits
 * audio that kept カあド (or the reverse).
 */
function indexOfSpokenInAudio(
  audioText: string,
  spoken: string,
  from: number
): { at: number; end: number } | null {
  const exact = audioText.indexOf(spoken, from);
  if (exact >= 0) {
    return { at: exact, end: exact + spoken.length };
  }

  const toHira = (ch: string): string => {
    const code = ch.codePointAt(0)!;
    if (code >= 0x30a1 && code <= 0x30f6) {
      return String.fromCodePoint(code - 0x60);
    }
    return ch;
  };

  const chars = [...spoken.replace(/\s+/gu, "")].map(toHira);
  if (chars.length === 0) return null;

  // Walk audio from `from`, matching each spoken char with optional gaps.
  // Indices stay in the original string (1:1 with BMP kana).
  const audioChars = [...audioText];
  // Map code-unit index → char index for slice(from)
  let cu = 0;
  let startChar = 0;
  while (cu < from && startChar < audioChars.length) {
    cu += audioChars[startChar]!.length;
    startChar += 1;
  }

  for (let start = startChar; start < audioChars.length; start += 1) {
    let ai = start;
    let si = 0;
    while (si < chars.length && ai < audioChars.length) {
      const a = audioChars[ai]!;
      if (/[\s、，]/u.test(a)) {
        ai += 1;
        continue;
      }
      if (toHira(a) !== chars[si]) break;
      si += 1;
      ai += 1;
    }
    if (si === chars.length) {
      // Convert char indices back to code-unit offsets
      let at = 0;
      for (let i = 0; i < start; i += 1) at += audioChars[i]!.length;
      let end = at;
      for (let i = start; i < ai; i += 1) end += audioChars[i]!.length;
      return { at, end };
    }
  }
  return null;
}

function runUtterance(
  text: string,
  lang: string,
  voice: SpeechSynthesisVoice | null,
  callbacks?: SpeakCallbacks,
  withHighlight = false,
  rate = SPEECH_RATE_NORMAL,
  /** When set, audio uses this string; highlights still use `text`. */
  speakText?: string,
  /** Spaced kana reading used to time Japanese fallback karaoke. */
  spacedReading?: string | null,
  /**
   * When set, fallback karaoke uses these steps (display indices into `text`)
   * instead of rebuilding from the full string — used for split EN asides/clauses.
   */
  karaokeUnits?: HighlightUnit[] | null
) {
  if (!window.speechSynthesis || !text.trim()) {
    callbacks?.onEnd?.();
    return;
  }

  const audioText = (speakText ?? text).trim() || text;
  const reading = spacedReading?.trim() || "";
  const isJa = lang.startsWith("ja");
  // Browser boundary indices refer to audioText. For Japanese with an explicit
  // reading (even when it equals the surface, e.g. 〜ことになっている), use the
  // spoken-kana fallback timeline — Nanami word boundaries routinely skip いる /
  // auxiliary chunks in grammar patterns and example sentences.
  const forceFallback =
    withHighlight &&
    (audioText !== text ||
      (isJa && reading.length > 0) ||
      (karaokeUnits != null && karaokeUnits.length > 0));

  // New generation invalidates any in-flight karaoke / start callbacks.
  playbackGeneration += 1;
  const playbackId = playbackGeneration;
  clearPlaybackHandles();
  settleActiveAsCancelled();
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(audioText);
  activeUtterance = utter;
  const playback = { callbacks, settled: false };
  activePlayback = playback;
  const unitLang: "ja" | "en" = isJa ? "ja" : "en";
  utter.lang = lang;
  // Voice must be set before rate — Chromium resets rate when voice is assigned.
  if (voice) utter.voice = voice;
  utter.rate = rate;

  debug("speak", {
    playbackId,
    lang,
    voice: voice?.name ?? "(default)",
    rate,
    text: text.slice(0, 40),
    audioText: audioText.slice(0, 40),
    forceFallback,
  });

  const allUnits: HighlightUnit[] = isJa
    ? buildJapaneseHighlightUnits(text)
    : buildEnglishHighlightUnits(text);

  // A kana reading can only drive karaoke when it can be aligned to the visible
  // units: either it is space-separated by word unit, or the surface is a
  // single unit, or the reading is the surface itself. Some corpora (speech
  // styles) store one unspaced kana blob instead; pairing that against the
  // units positionally shifts every highlight, so recover the token boundaries
  // from the furigana alignment first. Audio always uses the original reading.
  const readingTokenCount = reading ? reading.split(/\s+/).filter(Boolean).length : 0;
  let karaokeReading = reading;
  let karaokeReadingAligned =
    reading.length > 0 &&
    (readingTokenCount > 1 ||
      activeHighlightUnits(allUnits).length <= 1 ||
      reading.replace(/\s+/g, "") === text.replace(/\s+/g, ""));

  if (isJa && reading && !karaokeReadingAligned) {
    const derived = deriveSpacedReadingForUnits(text, reading, allUnits);
    if (derived) {
      karaokeReading = derived;
      karaokeReadingAligned = true;
    }
  }

  // Japanese + alignable reading: schedule fallback from spoken kana tokens,
  // not kanji weight. English with speak transforms (skipped (notes), ~
  // pauses): time from spoken form.
  const fallbackUnits: HighlightUnit[] =
    karaokeUnits && karaokeUnits.length > 0
      ? karaokeUnits
      : isJa && karaokeReading && karaokeReadingAligned
        ? buildJapaneseSpokenKaraokeSteps(text, karaokeReading, allUnits).map(
            (s) => ({
              start: s.start,
              end: s.end,
              text: s.text,
              kind: s.kind,
              spokenText: s.spokenText,
              speakGapAfter: s.speakGapAfter,
            })
          )
        : !isJa
          ? buildEnglishSpokenKaraokeSteps(text)
          : activeHighlightUnits(allUnits);

  const units = fallbackUnits;

  let lastBoundaryStart = -1;
  let lastBoundaryEnd = -1;
  let utteranceStarted = false;

  const alive = () => playbackId === playbackGeneration;

  const emitHighlight = (
    h: SpeechHighlight,
    opts?: { announceMouth?: boolean }
  ) => {
    if (!alive()) return;
    if (h.start === lastBoundaryStart && h.end === lastBoundaryEnd) return;
    // Never move backward.
    if (h.start < lastBoundaryStart) return;
    lastBoundaryStart = h.start;
    lastBoundaryEnd = h.end;
    debug("highlight", playbackId, h);
    callbacks?.onBoundary?.(h);
    // Announce the unit globally so shared UI (the talking heads) can follow
    // the voice without every caller threading callbacks down to it. Same
    // duration as the karaoke timeline (EN and JA) so Nanami/Andrew mouths
    // stay locked to the highlight and the voice.
    if (opts?.announceMouth === false) return;
    const unitIndex = units.findIndex(
      (u) => u.start === h.start && u.end === h.end
    );
    const spokenUnit = unitIndex >= 0 ? units[unitIndex] : null;
    if (spokenUnit) {
      const unitDurationMs =
        (estimateUnitDurationMs(
          spokenUnit,
          unitLang,
          units[unitIndex + 1] ?? null
        ) /
          rateDivisor) *
        timingScale;
      // Decorative listeners schedule timers off this value; a non-finite one
      // would fire them all immediately and make the mouth chatter. Audio is
      // unaffected either way, so drop the announcement rather than risk it.
      if (!Number.isFinite(unitDurationMs) || unitDurationMs <= 0) return;
      emitSpeechEvent({
        type: "unit",
        lang: unitLang,
        text: spokenUnit.text,
        spokenText: spokenUnit.spokenText ?? null,
        durationMs: unitDurationMs,
      });
    }
  };

  // ── Karaoke timeline ────────────────────────────────────────────────
  // plannedStart[i] is the estimated offset (ms) of unit i from the timeline
  // origin. Deadlines are absolute: deadline(i) = timelineOrigin +
  // plannedStart[i]. Nothing is derived from the previous timer's fire time,
  // so late timers cannot accumulate drift.
  const timingScale =
    unitLang === "en" ? FALLBACK_TIMING_SCALE_EN : FALLBACK_TIMING_SCALE_JA;
  // Andrew/Nanami neural rates are nonlinear near SPEECH_RATE_NORMAL —
  // don't stretch karaoke as if 0.80 were a true 20% slowdown.
  // Shared floor 0.88 at normal (and faster) rates.
  // At SPEECH_RATE_SLOW (0.75× UI → 0.68), use the real rate so karaoke
  // does not keep racing ahead at ~0.88 while the voice is at 0.68.
  const rateDivisor = karaokeRateDivisor(unitLang, rate);

  const plannedStart: number[] = [];
  {
    let acc = FALLBACK_START_OFFSET_MS;
    for (let i = 0; i < units.length; i += 1) {
      plannedStart.push(acc);
      acc +=
        (estimateUnitDurationMs(units[i]!, unitLang, units[i + 1] ?? null) /
          rateDivisor) *
        timingScale;
    }
  }

  /** Origin such that unit i is due at `timelineOrigin + plannedStart[i]`. */
  let timelineOrigin = 0;
  let timelineRunning = false;
  let pausedAt: number | null = null;
  /** Index into `units` of the last unit actually highlighted. */
  let emittedIndex = -1;
  /** Index of the next unit awaiting its deadline. */
  let nextIndex = 0;

  const emitUnitAt = (index: number) => {
    const unit = units[index];
    if (!unit) return;
    emitHighlight({ start: unit.start, end: unit.end });
    if (index > emittedIndex) emittedIndex = index;
  };

  const armTimer = () => {
    clearFallbackTimer();
    if (!alive() || !timelineRunning || pausedAt !== null) return;
    if (nextIndex >= units.length) return;
    const delay = Math.max(
      0,
      timelineOrigin + plannedStart[nextIndex]! - nowMs()
    );
    fallbackTimer = window.setTimeout(onTimelineTick, delay);
  };

  function onTimelineTick() {
    fallbackTimer = null;
    if (!alive() || !timelineRunning || pausedAt !== null) return;
    // Catch-up without replay: if several deadlines already elapsed (a late
    // timer, a backgrounded tab), jump straight to the latest due unit.
    const t = nowMs();
    let index = nextIndex;
    while (index + 1 < units.length && timelineOrigin + plannedStart[index + 1]! <= t) {
      index += 1;
    }
    emitUnitAt(index);
    nextIndex = index + 1;
    armTimer();
  }

  const startTimeline = () => {
    if (!alive() || !withHighlight || units.length === 0) return;
    timelineRunning = true;
    pausedAt = null;
    timelineOrigin = nowMs();
    nextIndex = 0;
    debug("timeline-start", playbackId, units.length);
    if (FALLBACK_START_OFFSET_MS <= 0) {
      // Karaoke begins immediately — no detection window.
      emitUnitAt(0);
      nextIndex = 1;
    }
    armTimer();
  };

  /** Map a boundary range onto an index in the karaoke timeline. */
  const timelineIndexFor = (range: SpeechHighlight): number => {
    const containing = units.findIndex(
      (u) => range.start >= u.start && range.start < u.end
    );
    if (containing >= 0) return containing;
    return units.findIndex((u) => u.start >= range.start);
  };

  /**
   * A useful forward boundary is the ground truth: snap to it (no replay of
   * skipped units) and rebase the origin so all later deadlines are corrected.
   */
  const applyBoundary = (range: SpeechHighlight) => {
    if (!timelineRunning || pausedAt !== null) return;
    const index = timelineIndexFor(range);
    if (index < 0) return;
    if (index < emittedIndex) return; // stale boundary — never move backwards
    timelineOrigin = nowMs() - plannedStart[index]!;
    if (index > emittedIndex) {
      emitUnitAt(index);
      nextIndex = index + 1;
    } else if (nextIndex <= index) {
      nextIndex = index + 1;
    }
    debug("boundary-rebase", playbackId, index);
    armTimer();
  };

  const timeline: KaraokeTimeline = {
    pause: () => {
      if (!timelineRunning || pausedAt !== null) return;
      pausedAt = nowMs();
      clearFallbackTimer();
      debug("timeline-pause", playbackId);
    },
    resume: () => {
      if (!timelineRunning || pausedAt === null) return;
      // Shift every remaining deadline by the frozen span.
      timelineOrigin += nowMs() - pausedAt;
      pausedAt = null;
      debug("timeline-resume", playbackId);
      armTimer();
    },
  };
  activeTimeline = timeline;

  utter.onstart = () => {
    if (!alive()) return;
    utteranceStarted = true;
    debug("onstart", playbackId);
    emitSpeechEvent({ type: "start", lang: unitLang, rate });
    callbacks?.onStart?.();
    startTimeline();
  };

  utter.onboundary = (event: SpeechSynthesisEvent) => {
    if (!alive()) return;
    if (!withHighlight) return;
    if (!isUsefulBoundaryName(event.name)) return;
    if (!utteranceStarted) return;

    const charIndex = event.charIndex ?? 0;
    const charLength =
      typeof event.charLength === "number" && event.charLength > 0
        ? event.charLength
        : undefined;

    // Boundary indices refer to `audioText`. When it differs from the visible
    // text (JA readings / EN speak transforms), map via the karaoke units'
    // spoken form — same wiring for Andrew notes and Nanami readings so JA
    // does not race on estimate-only while EN rebases.
    if (forceFallback) {
      const mapped = findSpokenBoundaryUnit(units, audioText, charIndex);
      if (mapped) {
        debug("spoken-boundary", playbackId, { charIndex, mapped, lang: unitLang });
        applyBoundary(mapped);
      }
      return;
    }

    const mapped = findUnitForBoundary(allUnits, charIndex, charLength);
    if (!mapped) return;

    debug("raw-boundary", playbackId, {
      name: event.name,
      charIndex,
      charLength,
      mapped,
    });
    applyBoundary(mapped);
  };

  const finish = (kind: "end" | "error", error?: unknown) => {
    if (!alive() || playback.settled) return;
    playback.settled = true;
    timelineRunning = false;
    clearFallbackTimer();
    // Browser TTS sometimes skips the final unit's boundary. Light that one
    // remaining span once — never rush a multi-unit 80ms sweep (fake sync).
    // Do not announce the mouth: audio is already over, and a full-duration
    // unit event here would schedule visemes after Nanami has stopped.
    if (withHighlight) {
      const remaining = units.filter(
        (u) => u.kind !== "space" && u.start >= Math.max(0, lastBoundaryEnd)
      );
      if (remaining.length === 1) {
        emitHighlight(
          {
            start: remaining[0]!.start,
            end: remaining[0]!.end,
          },
          { announceMouth: false }
        );
      }
    }
    clearAndEnd();

    function clearAndEnd() {
      if (activeUtterance === utter) {
        clearPlaybackHandles();
      } else {
        clearFallbackTimer();
      }
      if (activeTimeline === timeline) activeTimeline = null;
      debug(kind, playbackId, error);
      if (kind === "error") {
        callbacks?.onError?.(error);
      }
      emitSpeechEvent({ type: "end" });
      callbacks?.onEnd?.();
    }
  };

  utter.onend = () => finish("end");
  utter.onerror = (ev) => finish("error", ev);

  let started = false;
  const startOnce = () => {
    if (started) return;
    if (!alive()) return;
    started = true;
    clearPendingStartOnly();
    debug("speak-submit", playbackId);
    window.speechSynthesis.speak(utter);
  };

  if (allVoices().length === 0) {
    pendingVoicesChangedHandler = () => startOnce();
    window.speechSynthesis.addEventListener(
      "voiceschanged",
      pendingVoicesChangedHandler
    );
    pendingStartTimer = window.setTimeout(startOnce, 150);
  } else {
    startOnce();
  }
}

export const speechService = {
  getStatus(): SpeechStatus {
    if (!window.speechSynthesis) return "idle";
    if (window.speechSynthesis.speaking && window.speechSynthesis.paused) {
      return "paused";
    }
    if (window.speechSynthesis.speaking) return "speaking";
    return "idle";
  },

  getPreferredVoiceName(lang: "ja" | "en"): string | null {
    return getTtsVoiceName(lang, allVoices());
  },

  stop() {
    playbackGeneration += 1;
    clearPlaybackHandles();
    settleActiveAsCancelled();
    debug("stop", playbackGeneration);
    // Close the mouth even when nothing was mid-utterance to settle.
    emitSpeechEvent({ type: "end" });
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
  },

  pause() {
    // Freeze karaoke first so no unit fires between the two calls.
    activeTimeline?.pause();
    if (!window.speechSynthesis) return;
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
    }
  },

  resume() {
    if (window.speechSynthesis?.paused) {
      window.speechSynthesis.resume();
    }
    // Shift remaining karaoke deadlines by the paused span.
    activeTimeline?.resume();
  },

  speakJapanese(
    text: string,
    callbacks?: SpeakCallbacks,
    rate = SPEECH_RATE_NORMAL,
    options?: SpeakJapaneseOptions
  ) {
    const reading = options?.reading ?? null;
    const segments = buildJapaneseSpeakSegments(text, reading);
    if (segments.length <= 1) {
      const speakText = buildJapaneseSpeakText(text, reading);
      runUtterance(
        text,
        JAPANESE_TTS_LANG,
        pickNanamiVoice(),
        callbacks,
        true,
        rate,
        speakText,
        reading
      );
      return;
    }

    speakJapaneseSegments(text, segments, callbacks, rate);
  },

  speakEnglish(
    text: string,
    callbacks?: SpeakCallbacks,
    rate = SPEECH_RATE_NORMAL
  ) {
    const segments = buildEnglishSpeakSegments(text);
    if (segments.length <= 1) {
      const speakText = buildEnglishSpeakText(text);
      runUtterance(
        text,
        ENGLISH_TTS_LANG,
        pickEnglishVoice(),
        callbacks,
        true,
        rate,
        speakText
      );
      return;
    }

    speakEnglishSegments(text, segments, callbacks, rate);
  },
};

type JapaneseSpeakSegment = {
  speak: string;
  reading: string | null;
  steps: HighlightUnit[] | null;
  /** Silence before the next JA clause (0 on the last segment). */
  pauseAfterMs: number;
};

function japanesePauseAfterSurface(surface: string): number {
  if (/[、，]\s*$/u.test(surface)) return SPEECH_JA_COMMA_PAUSE_MS;
  if (/[。！？]\s*$/u.test(surface)) return SPEECH_JA_SENTENCE_PAUSE_MS;
  return SPEECH_JA_SENTENCE_PAUSE_MS;
}

type EnglishSpeakSegment = {
  speak: string;
  steps: HighlightUnit[] | null;
  /** Silence before the next EN clause (0 on the last segment). */
  pauseAfterMs: number;
};

function englishPauseAfterSurface(surface: string): number {
  if (/;\s*$/u.test(surface)) return SPEECH_EN_SEMICOLON_PAUSE_MS;
  return SPEECH_EN_CHAIN_PAUSE_MS;
}

/**
 * Split JA on `。` / `！` / `？` so Nanami takes a real breath between
 * sentences. Commas stay in one utterance (no Chromium handoff mid-phrase).
 */
function buildJapaneseSpeakSegments(
  text: string,
  reading: string | null
): JapaneseSpeakSegment[] {
  const clauses = splitJapaneseBySentences(text, reading);
  if (!clauses) return [];

  const allUnits = buildJapaneseHighlightUnits(text);
  const readingTrim = reading?.trim() || "";
  // Prefer the author spaced reading when it already has token breaks — deriving
  // from display units can glue particles (さいしょの) that Nanami speaks apart.
  const karaokeReading =
    readingTrim && !/\s/u.test(readingTrim)
      ? deriveSpacedReadingForUnits(text, readingTrim, allUnits) ?? readingTrim
      : readingTrim;
  const allSteps: HighlightUnit[] = karaokeReading
    ? buildJapaneseSpokenKaraokeSteps(text, karaokeReading, allUnits).map(
        (s) => ({
          start: s.start,
          end: s.end,
          text: s.text,
          kind: s.kind,
          spokenText: s.spokenText,
          speakGapAfter: s.speakGapAfter,
        })
      )
    : activeHighlightUnits(allUnits);

  return clauses.map((clause, i) => {
    const clauseSteps = allSteps.filter(
      (s) => s.start >= clause.start && s.start < clause.end
    );
    const surface = text.slice(clause.start, clause.end);
    const isLast = i >= clauses.length - 1;
    return {
      speak: clause.speak,
      reading: clause.reading,
      steps: clauseSteps.length > 0 ? clauseSteps : null,
      pauseAfterMs: isLast ? 0 : japanesePauseAfterSurface(surface),
    };
  });
}

function speakJapaneseSegments(
  displayText: string,
  segments: JapaneseSpeakSegment[],
  callbacks: SpeakCallbacks | undefined,
  rate: number
) {
  const voice = pickNanamiVoice();
  let started = false;
  let index = 0;

  const playNext = () => {
    const seg = segments[index];
    if (!seg) {
      callbacks?.onEnd?.();
      return;
    }
    const isLast = index >= segments.length - 1;
    index += 1;

    runUtterance(
      displayText,
      JAPANESE_TTS_LANG,
      voice,
      {
        onStart: () => {
          if (!started) {
            started = true;
            callbacks?.onStart?.();
          }
        },
        onBoundary: callbacks?.onBoundary,
        onError: (error) => {
          clearPendingAsideChain();
          callbacks?.onError?.(error);
        },
        onEnd: () => {
          if (isLast) {
            callbacks?.onEnd?.();
            return;
          }
          const pauseGen = playbackGeneration;
          const pauseMs = seg.pauseAfterMs;
          clearAsidePauseTimer();
          pendingAsideCallbacks = callbacks ?? null;
          asidePauseTimer = window.setTimeout(() => {
            asidePauseTimer = null;
            pendingAsideCallbacks = null;
            if (playbackGeneration !== pauseGen) return;
            playNext();
          }, pauseMs);
        },
      },
      true,
      rate,
      seg.speak,
      seg.reading,
      seg.steps
    );
  };

  playNext();
}

/**
 * Prefer trailing gloss aside splits, else `;` / em-dash / sentence clause
 * splits — all need a real inter-utterance pause so karaoke does not drift
 * off Andrew (mdash with no pause makes karaoke race ahead).
 */
function buildEnglishSpeakSegments(text: string): EnglishSpeakSegment[] {
  const aside = splitEnglishDescriptiveAside(text);
  if (aside) {
    const steps = buildEnglishSpokenKaraokeSteps(text);
    const headSteps = steps
      .filter((s) => s.start < aside.asideOpen)
      .map((s) => ({
        ...s,
        spokenText:
          buildEnglishSpeakText(s.text.replace(/[()]/g, "")).trim() || s.text,
        speakGapAfter: false,
      }));
    const asideSteps = steps.filter((s) => s.start >= aside.asideOpen);
    return [
      {
        speak: buildEnglishSpeakText(aside.head),
        steps: headSteps.length > 0 ? headSteps : null,
        pauseAfterMs: SPEECH_EN_CHAIN_PAUSE_MS,
      },
      {
        speak: buildEnglishSpeakText(aside.aside),
        steps: asideSteps.length > 0 ? asideSteps : null,
        pauseAfterMs: 0,
      },
    ];
  }

  const clauses = splitEnglishByClauses(text);
  if (!clauses) return [];

  const steps = buildEnglishSpokenKaraokeSteps(text);
  return clauses.map((clause, i) => {
    const clauseSlice = text.slice(clause.start, clause.end);
    const clauseSteps = steps
      .filter((s) => s.start >= clause.start && s.start < clause.end)
      .map((s) => {
        // Strip clause-final punct from the spoken form, but KEEP mdash/semicolon
        // ellipsis dwell so karaoke holds at the break (same breath as the real
        // inter-utterance pause) — stripping it made "75% —" race into the next clause.
        if (/[;,.!?—–]$/u.test(s.text)) {
          const stripped = s.text.replace(/[;,.!?—–]+$/u, "").trim();
          const base = buildEnglishSpeakText(stripped).trim() || stripped;
          const keepEllipsis = /\.\.\.\s*$/u.test(s.spokenText ?? "");
          return {
            ...s,
            spokenText: keepEllipsis ? `${base.replace(/\s*\.{3}\s*$/u, "")} ...` : base,
            speakGapAfter: false,
          };
        }
        // Preserve "75% ..." style mdash dwell attached to the prior word.
        return { ...s, speakGapAfter: false };
      });
    // Quest tip line breaks ("Natural\nClear purpose.") — hold karaoke on the
    // last word through the same breath as ENGLISH_CHAIN_PAUSE_MS.
    if (/\n/.test(clauseSlice) && clauseSteps.length > 0) {
      const last = clauseSteps[clauseSteps.length - 1]!;
      const base = (last.spokenText ?? last.text)
        .replace(/\s*\.{3}\s*$/u, "")
        .trim();
      last.spokenText = `${base} ...`;
      last.end = clause.end;
    }
    const isLast = i >= clauses.length - 1;
    return {
      speak: clause.speak,
      steps: clauseSteps.length > 0 ? clauseSteps : null,
      pauseAfterMs: isLast ? 0 : englishPauseAfterSurface(clauseSlice),
    };
  });
}

function speakEnglishSegments(
  displayText: string,
  segments: EnglishSpeakSegment[],
  callbacks: SpeakCallbacks | undefined,
  rate: number
) {
  const voice = pickEnglishVoice();
  let started = false;
  let index = 0;

  const playNext = () => {
    const seg = segments[index];
    if (!seg) {
      callbacks?.onEnd?.();
      return;
    }
    const isLast = index >= segments.length - 1;
    index += 1;

    runUtterance(
      displayText,
      ENGLISH_TTS_LANG,
      voice,
      {
        onStart: () => {
          if (!started) {
            started = true;
            callbacks?.onStart?.();
          }
        },
        onBoundary: callbacks?.onBoundary,
        onError: (error) => {
          clearPendingAsideChain();
          callbacks?.onError?.(error);
        },
        onEnd: () => {
          if (isLast) {
            callbacks?.onEnd?.();
            return;
          }
          const pauseGen = playbackGeneration;
          const pauseMs = seg.pauseAfterMs;
          clearAsidePauseTimer();
          pendingAsideCallbacks = callbacks ?? null;
          asidePauseTimer = window.setTimeout(() => {
            asidePauseTimer = null;
            pendingAsideCallbacks = null;
            if (playbackGeneration !== pauseGen) return;
            playNext();
          }, pauseMs);
        },
      },
      true,
      rate,
      seg.speak,
      null,
      seg.steps
    );
  };

  playNext();
}

/** @internal test helpers */
export const __speechTestHooks = {
  getGeneration: () => playbackGeneration,
  FALLBACK_START_OFFSET_MS,
  FALLBACK_TIMING_SCALE,
  FALLBACK_TIMING_SCALE_JA,
  FALLBACK_TIMING_SCALE_EN,
  SPEECH_CLAUSE_PAUSE_MS: SPEECH_EN_CHAIN_PAUSE_MS,
  SPEECH_EN_CHAIN_PAUSE_MS,
  SPEECH_EN_SEMICOLON_PAUSE_MS,
  SPEECH_COMMA_PAUSE_MS,
  SPEECH_JA_SENTENCE_PAUSE_MS,
  SPEECH_JA_COMMA_PAUSE_MS,
  ENGLISH_CHAIN_PAUSE_MS,
  JAPANESE_CHAIN_PAUSE_MS,
  karaokeRateDivisor,
};

export {
  SPEECH_CLAUSE_PAUSE_MS,
  SPEECH_COMMA_PAUSE_MS,
  SPEECH_EN_CHAIN_PAUSE_MS,
  SPEECH_EN_SEMICOLON_PAUSE_MS,
  SPEECH_JA_SENTENCE_PAUSE_MS,
  SPEECH_JA_COMMA_PAUSE_MS,
  SPEECH_JP_EN_HANDOFF_MS,
  SPEECH_BILINGUAL_FIELD_GAP_MS,
} from "../config/speechTiming";
export {
  buildJapaneseSpeakText,
  splitJapaneseBySentences,
} from "../utils/japaneseSpeakText";
export {
  buildEnglishSpeakText,
  splitEnglishByClauses,
  splitEnglishBySemicolon,
  splitEnglishDescriptiveAside,
} from "../utils/englishSpeakText";

