/**
 * Browser speech synthesis with generation-safe karaoke highlighting.
 *
 * Per utterance: wait for onstart -> briefly detect browser word boundaries ->
 * lock into either `boundary` mode OR weighted `fallback` mode (never both).
 */

import {
  activeHighlightUnits,
  buildEnglishHighlightUnits,
  buildJapaneseHighlightUnits,
  buildJapaneseSpokenKaraokeSteps,
  estimateUnitDurationMs,
  findUnitForBoundary,
  type HighlightUnit,
} from "../utils/speechHighlightUnits";
import { buildJapaneseSpeakText } from "../utils/japaneseSpeakText";
import { buildEnglishSpeakText } from "../utils/englishSpeakText";

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

export type SpeakJapaneseOptions = {
  /**
   * Space-separated kana reading (same as furigana data).
   * When set, audio uses this reading so ambiguous kanji pronounce correctly
   * (e.g. 間に → まに, not あいだに). Highlights still track `text` surface indices.
   */
  reading?: string | null;
};

export const SPEECH_RATE_NORMAL = 0.85;
export const SPEECH_RATE_SLOW = 0.68;
/** Slightly faster normal used only for the shadowing listen pass. */
export const SPEECH_RATE_SHADOWING = 0.85;

const DEBUG_SPEECH = false;
/** Wait after onstart for a real browser boundary before choosing fallback. */
const BOUNDARY_DETECT_MS = 320;
/** Lead-in after onstart before first fallback unit (ms). Audible audio often lags onstart. */
const FALLBACK_START_OFFSET_MS = 100;

type HighlightMode = "detecting" | "boundary" | "fallback";

let playbackGeneration = 0;
let fallbackTimer: number | null = null;
let boundaryDetectionTimer: number | null = null;
let gapFillTimer: number | null = null;
let pendingStartTimer: number | null = null;
let pendingVoicesChangedHandler: (() => void) | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;

function debug(...args: unknown[]) {
  if (DEBUG_SPEECH) console.log("[speech]", ...args);
}

function allVoices(): SpeechSynthesisVoice[] {
  return window.speechSynthesis?.getVoices() ?? [];
}

function pickNanamiVoice(): SpeechSynthesisVoice | null {
  const voices = allVoices();
  const ja = voices.filter((v) => v.lang.toLowerCase().startsWith("ja"));
  if (ja.length === 0) return null;

  const score = (v: SpeechSynthesisVoice): number => {
    const n = v.name;
    let s = 0;
    if (/七海/.test(n)) s += 100;
    if (/nanami/i.test(n)) s += 80;
    if (/online/i.test(n)) s += 40;
    if (/natural/i.test(n)) s += 40;
    if (/microsoft/i.test(n)) s += 20;
    return s;
  };

  return [...ja].sort((a, b) => score(b) - score(a))[0] ?? null;
}

function pickEnglishVoice(): SpeechSynthesisVoice | null {
  const voices = allVoices();
  const en = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  if (en.length === 0) return null;

  const score = (v: SpeechSynthesisVoice): number => {
    const n = v.name;
    let s = 0;
    if (/andrew/i.test(n)) s += 100;
    if (/online/i.test(n)) s += 40;
    if (/natural/i.test(n)) s += 40;
    if (/microsoft/i.test(n)) s += 20;
    if (/en-US/i.test(v.lang) || /United States/i.test(n)) s += 10;
    return s;
  };

  return [...en].sort((a, b) => score(b) - score(a))[0] ?? null;
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

function clearGapFillTimer() {
  if (gapFillTimer !== null) {
    window.clearTimeout(gapFillTimer);
    gapFillTimer = null;
  }
}

function clearBoundaryDetectionTimer() {
  if (boundaryDetectionTimer !== null) {
    window.clearTimeout(boundaryDetectionTimer);
    boundaryDetectionTimer = null;
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
  clearGapFillTimer();
  clearBoundaryDetectionTimer();
  clearPendingStartOnly();
  activeUtterance = null;
}

function isUsefulBoundaryName(name: string | undefined): boolean {
  return !name || name === "word" || name === "sentence";
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
  spacedReading?: string | null
) {
  if (!window.speechSynthesis || !text.trim()) {
    callbacks?.onEnd?.();
    return;
  }

  const audioText = (speakText ?? text).trim() || text;
  // Browser boundary indices refer to audioText; they won't match surface
  // highlights when we speak a kana reading of kanji.
  const forceFallback = withHighlight && audioText !== text;

  // New generation invalidates any in-flight utterance callbacks.
  playbackGeneration += 1;
  const playbackId = playbackGeneration;
  clearPlaybackHandles();
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(audioText);
  activeUtterance = utter;
  const isJa = lang.startsWith("ja");
  const unitLang: "ja" | "en" = isJa ? "ja" : "en";
  utter.lang = lang;
  utter.rate = rate;
  if (voice) utter.voice = voice;

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

  // Japanese + reading: schedule fallback from spoken kana tokens, not kanji weight.
  const reading = spacedReading?.trim();
  const fallbackUnits: HighlightUnit[] =
    isJa && reading
      ? buildJapaneseSpokenKaraokeSteps(text, reading, allUnits).map((s) => ({
          start: s.start,
          end: s.end,
          text: s.text,
          kind: s.kind,
          spokenText: s.spokenText,
          speakGapAfter: s.speakGapAfter,
        }))
      : activeHighlightUnits(allUnits);

  const units = fallbackUnits;

  let mode: HighlightMode = "detecting";
  let lastBoundaryStart = -1;
  let lastBoundaryEnd = -1;
  let utteranceStarted = false;
  let finished = false;

  const alive = () => playbackId === playbackGeneration;

  const emitHighlight = (h: SpeechHighlight) => {
    if (!alive()) return;
    if (h.start === lastBoundaryStart && h.end === lastBoundaryEnd) return;
    // Never move backward.
    if (h.start < lastBoundaryStart) return;
    lastBoundaryStart = h.start;
    lastBoundaryEnd = h.end;
    debug("highlight", playbackId, mode, h);
    callbacks?.onBoundary?.(h);
  };

  /**
   * Browser TTS often jumps over a unit (〜から|みる|と → から then と).
   * Walk any skipped active units before landing on `target`.
   */
  const advanceHighlightTo = (target: SpeechHighlight) => {
    clearGapFillTimer();
    const from = Math.max(0, lastBoundaryEnd);
    const skipped = activeHighlightUnits(allUnits).filter(
      (u) => u.start >= from && u.start < target.start
    );
    if (skipped.length === 0) {
      emitHighlight(target);
      return;
    }

    const queue: SpeechHighlight[] = [
      ...skipped.map((u) => ({ start: u.start, end: u.end })),
      target,
    ];
    let i = 0;
    const step = () => {
      gapFillTimer = null;
      if (!alive()) return;
      if (mode !== "boundary" && mode !== "detecting") return;
      const h = queue[i++];
      if (!h) return;
      emitHighlight(h);
      if (i >= queue.length) return;
      const justShown = activeHighlightUnits(allUnits).find(
        (u) => u.start === h.start && u.end === h.end
      );
      const dwell = justShown
        ? Math.max(
            70,
            Math.min(
              160,
              (estimateUnitDurationMs(justShown, unitLang) /
                Math.max(rate, 0.2)) *
                0.45
            )
          )
        : 90;
      gapFillTimer = window.setTimeout(step, dwell);
    };
    step();
  };

  const startFallback = () => {
    if (!alive() || !withHighlight || units.length === 0) return;
    mode = "fallback";
    clearBoundaryDetectionTimer();
    clearGapFillTimer();
    debug("mode", playbackId, "fallback");

    const scheduleNext = (index: number, delayMs: number) => {
      clearFallbackTimer();
      fallbackTimer = window.setTimeout(() => {
        fallbackTimer = null;
        if (!alive() || mode !== "fallback") return;
        const unit = units[index];
        if (!unit) return;
        emitHighlight({ start: unit.start, end: unit.end });
        const next = index + 1;
        if (next >= units.length) return;
        const dur =
          estimateUnitDurationMs(unit, unitLang) / Math.max(rate, 0.2);
        scheduleNext(next, dur);
      }, delayMs);
    };

    scheduleNext(0, FALLBACK_START_OFFSET_MS);
  };

  const enterBoundaryMode = (h: SpeechHighlight) => {
    if (!alive()) return;
    mode = "boundary";
    clearBoundaryDetectionTimer();
    clearFallbackTimer();
    debug("mode", playbackId, "boundary");
    advanceHighlightTo(h);
  };

  utter.onstart = () => {
    if (!alive()) return;
    utteranceStarted = true;
    debug("onstart", playbackId);
    callbacks?.onStart?.();

    if (!withHighlight || units.length === 0) return;

    if (forceFallback) {
      startFallback();
      return;
    }

    mode = "detecting";
    clearBoundaryDetectionTimer();
    boundaryDetectionTimer = window.setTimeout(() => {
      boundaryDetectionTimer = null;
      if (!alive()) return;
      if (mode === "detecting") startFallback();
    }, BOUNDARY_DETECT_MS);
  };

  utter.onboundary = (event: SpeechSynthesisEvent) => {
    if (!alive()) return;
    if (!withHighlight) return;
    if (forceFallback) return;
    if (!isUsefulBoundaryName(event.name)) return;
    if (!utteranceStarted) return;

    const charIndex = event.charIndex ?? 0;
    const charLength =
      typeof event.charLength === "number" && event.charLength > 0
        ? event.charLength
        : undefined;
    const mapped = findUnitForBoundary(allUnits, charIndex, charLength);
    if (!mapped) return;

    debug("raw-boundary", playbackId, {
      name: event.name,
      charIndex,
      charLength,
      mapped,
      mode,
    });

    if (mode === "detecting") {
      enterBoundaryMode(mapped);
      return;
    }
    if (mode === "boundary") {
      advanceHighlightTo(mapped);
      return;
    }
    // fallback: ignore late browser boundaries
  };

  const finish = (kind: "end" | "error", error?: unknown) => {
    if (!alive() || finished) return;
    finished = true;
    // Browser TTS sometimes skips the final unit's boundary. Light that one
    // remaining span once — never rush a multi-unit 80ms sweep (fake sync).
    if (withHighlight && mode === "boundary") {
      const remaining = activeHighlightUnits(allUnits).filter(
        (u) => u.start >= Math.max(0, lastBoundaryEnd)
      );
      if (remaining.length === 1) {
        emitHighlight({
          start: remaining[0]!.start,
          end: remaining[0]!.end,
        });
      }
    }
    clearAndEnd();

    function clearAndEnd() {
      if (activeUtterance === utter) {
        clearPlaybackHandles();
      } else {
        clearFallbackTimer();
        clearGapFillTimer();
        clearBoundaryDetectionTimer();
      }
      debug(kind, playbackId, error);
      if (kind === "error") {
        callbacks?.onError?.(error);
      }
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
    const v = lang === "ja" ? pickNanamiVoice() : pickEnglishVoice();
    return v?.name ?? null;
  },

  stop() {
    playbackGeneration += 1;
    clearPlaybackHandles();
    debug("stop", playbackGeneration);
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
  },

  pause() {
    if (!window.speechSynthesis) return;
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
    }
  },

  resume() {
    if (!window.speechSynthesis) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  },

  speakJapanese(
    text: string,
    callbacks?: SpeakCallbacks,
    rate = SPEECH_RATE_NORMAL,
    options?: SpeakJapaneseOptions
  ) {
    const reading = options?.reading ?? null;
    const speakText = reading ? buildJapaneseSpeakText(text, reading) : text;
    runUtterance(
      text,
      "ja-JP",
      pickNanamiVoice(),
      callbacks,
      true,
      rate,
      speakText,
      reading
    );
  },

  speakEnglish(
    text: string,
    callbacks?: SpeakCallbacks,
    rate = SPEECH_RATE_NORMAL
  ) {
    const speakText = buildEnglishSpeakText(text);
    runUtterance(
      text,
      "en-US",
      pickEnglishVoice(),
      callbacks,
      true,
      rate,
      speakText
    );
  },
};

/** @internal test helpers */
export const __speechTestHooks = {
  getGeneration: () => playbackGeneration,
  BOUNDARY_DETECT_MS,
  FALLBACK_START_OFFSET_MS,
};

export { buildJapaneseSpeakText } from "../utils/japaneseSpeakText";
export { buildEnglishSpeakText } from "../utils/englishSpeakText";

