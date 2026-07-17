import { groupWrapUnits, splitIntoWords } from "../utils/wrapWords";

/** Browser speech — Japanese uses Microsoft Nanami (七海) Online Natural when available. */

export type SpeechStatus = "idle" | "speaking" | "paused";

export type SpeechHighlight = {
  /** Start index of the currently spoken unit (inclusive). */
  start: number;
  /** End index of the currently spoken unit (exclusive). */
  end: number;
};

export type SpeakCallbacks = {
  onBoundary?: (highlight: SpeechHighlight) => void;
  onEnd?: () => void;
};

function allVoices(): SpeechSynthesisVoice[] {
  return window.speechSynthesis?.getVoices() ?? [];
}

/**
 * Prefer: Microsoft Nanami Online (Natural) / 七海
 * Fallbacks: any Nanami, then any Microsoft ja, then any ja.
 */
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
  switch (step) {
    case "word":
    case "review":
      return item.word;
    case "phrase":
      return item.phrase;
    case "sentence":
    case "shadowing":
      return item.sentence;
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
  switch (step) {
    case "pattern":
    case "review":
      return item.pattern;
    case "sentence":
    case "shadowing":
      return item.sentence;
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

/**
 * Japanese karaoke units = same word/phrase wraps as the UI (Intl.Segmenter).
 * Matches how Nanami fires word boundaries — not per character.
 * Whitespace-only segments are skipped; punctuation stays attached to the word.
 */
export function splitHighlightUnits(text: string): { start: number; end: number }[] {
  return groupWrapUnits(splitIntoWords(text, "ja"))
    .filter((u) => !/^\s+$/.test(u.text))
    .map((u) => ({ start: u.start, end: u.end }));
}

/** Split English into word units for karaoke highlight. */
export function splitEnglishHighlightUnits(
  text: string
): { start: number; end: number }[] {
  const units: { start: number; end: number }[] = [];
  const re = /\S+/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    units.push({ start: match.index, end: match.index + match[0].length });
  }
  return units;
}

let paceTimer: number | null = null;
let firstHoldTimer: number | null = null;

type HighlightUnit = { start: number; end: number };

/** First word/phrase hold — long enough to see before engine jumps ahead. */
const FIRST_UNIT_HOLD_MS = { ja: 380, en: 420 } as const;

function clearPace() {
  if (paceTimer !== null) {
    window.clearInterval(paceTimer);
    paceTimer = null;
  }
  if (firstHoldTimer !== null) {
    window.clearTimeout(firstHoldTimer);
    firstHoldTimer = null;
  }
}

function unitIndexForChar(
  units: HighlightUnit[],
  charIndex: number
): number {
  if (units.length === 0) return -1;
  const containing = units.findIndex(
    (u) => charIndex >= u.start && charIndex < u.end
  );
  if (containing >= 0) return containing;
  const next = units.findIndex((u) => u.start >= charIndex);
  if (next >= 0) return next;
  return units.length - 1;
}

/**
 * Soft backup pace between word units when the engine is quiet.
 * Sized so the full line finishes roughly with the utterance — not ahead of it.
 */
function msPerHighlightUnit(
  text: string,
  units: HighlightUnit[],
  rate: number,
  mode: "ja" | "en"
): number {
  if (units.length <= 1) return 10_000; // single word: stay lit; onend clears
  if (mode === "en") {
    return Math.max(FIRST_UNIT_HOLD_MS.en, 320 / rate);
  }
  const chars = [...text].filter((ch) => !/\s/.test(ch)).length;
  // ~180ms/char at rate 1 — slightly behind speech so boundaries lead when present
  const estimatedMs = Math.max(chars, 1) * (180 / rate);
  return Math.max(FIRST_UNIT_HOLD_MS.ja, estimatedMs / units.length);
}

function startHighlightPace(opts: {
  units: HighlightUnit[];
  text: string;
  rate: number;
  mode: "ja" | "en";
  getIndex: () => number;
  tryAdvance: (next: number) => boolean;
  canLeaveFirst: () => boolean;
  onAdvance: (h: SpeechHighlight) => void;
}) {
  clearPace();
  const { units, text, rate, mode, getIndex, tryAdvance, canLeaveFirst, onAdvance } =
    opts;
  if (units.length === 0) return;

  // Always start on the first word/phrase.
  tryAdvance(0);

  // One unit (落ち込む, a short English gloss): no stepping — voice owns the hold.
  if (units.length === 1) return;

  const stepMs = msPerHighlightUnit(text, units, rate, mode);
  paceTimer = window.setInterval(() => {
    const cur = getIndex();
    if (cur === 0 && !canLeaveFirst()) return;
    const next = cur + 1;
    if (next >= units.length) {
      if (paceTimer !== null) {
        window.clearInterval(paceTimer);
        paceTimer = null;
      }
      return;
    }
    if (tryAdvance(next)) onAdvance(units[next]!);
  }, stepMs);
}

export const SPEECH_RATE_NORMAL = 0.85;
export const SPEECH_RATE_SLOW = 0.7;
/** Slightly faster normal used only for the shadowing listen pass. */
export const SPEECH_RATE_SHADOWING = 0.95;

/** First word/phrase range — use before the first boundary callback arrives. */
export function firstHighlightUnit(
  text: string,
  lang: "ja" | "en"
): SpeechHighlight {
  const units =
    lang === "ja"
      ? splitHighlightUnits(text)
      : splitEnglishHighlightUnits(text);
  return units[0] ?? { start: 0, end: Math.min(1, text.length) };
}

function runUtterance(
  text: string,
  lang: string,
  voice: SpeechSynthesisVoice | null,
  callbacks?: SpeakCallbacks,
  withHighlight = false,
  rate = SPEECH_RATE_NORMAL
) {
  if (!window.speechSynthesis || !text.trim()) return;

  clearPace();
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  const isJa = lang.startsWith("ja");
  utter.lang = lang;
  utter.rate = rate;
  if (voice) utter.voice = voice;

  if (withHighlight && callbacks?.onBoundary) {
    const mode = isJa ? "ja" : "en";
    const units = isJa
      ? splitHighlightUnits(text)
      : splitEnglishHighlightUnits(text);
    let currentUnit = -1;
    let started = false;
    let firstShownAt = 0;
    let pendingAfterFirst = -1;
    const firstHoldMs = FIRST_UNIT_HOLD_MS[mode];

    const emit = (index: number) => {
      const unit = units[index];
      if (!unit) return;
      currentUnit = index;
      callbacks.onBoundary?.(unit);
    };

    const canLeaveFirst = () =>
      firstShownAt > 0 && performance.now() - firstShownAt >= firstHoldMs;

    const schedulePendingAfterFirst = () => {
      if (firstHoldTimer !== null) return;
      const remaining = Math.max(
        0,
        firstHoldMs - (performance.now() - firstShownAt)
      );
      firstHoldTimer = window.setTimeout(() => {
        firstHoldTimer = null;
        if (pendingAfterFirst > currentUnit) {
          const t = pendingAfterFirst;
          pendingAfterFirst = -1;
          emit(t);
        }
      }, remaining);
    };

    /** Move forward only; hold unit 0 briefly so the first word is visible. */
    const tryAdvance = (rawIndex: number): boolean => {
      const target = Math.max(0, Math.min(rawIndex, units.length - 1));

      if (!started) {
        started = true;
        firstShownAt = performance.now();
        emit(0);
        if (target <= 0) return true;
      }

      if (target <= currentUnit) return false;

      if (currentUnit === 0 && !canLeaveFirst()) {
        pendingAfterFirst = Math.max(pendingAfterFirst, target);
        schedulePendingAfterFirst();
        return false;
      }

      emit(target);
      return true;
    };

    utter.onstart = () => {
      if (units.length === 0) return;
      tryAdvance(0);
    };

    utter.onboundary = (event: SpeechSynthesisEvent) => {
      if (!(event.name === "word" || event.name === "sentence" || !event.name)) {
        return;
      }
      if (units.length === 0) return;

      const charIndex = event.charIndex ?? 0;
      let idx = unitIndexForChar(units, charIndex);

      // Engine often reports the end of the current word — step to the next.
      if (
        idx >= 0 &&
        idx === currentUnit &&
        typeof event.charLength === "number" &&
        event.charLength > 0 &&
        charIndex + event.charLength >= (units[idx]?.end ?? 0) &&
        idx + 1 < units.length
      ) {
        idx = idx + 1;
      }

      tryAdvance(idx);
    };

    startHighlightPace({
      units,
      text,
      rate,
      mode,
      getIndex: () => currentUnit,
      tryAdvance,
      canLeaveFirst,
      onAdvance: (h) => callbacks.onBoundary?.(h),
    });
  }

  utter.onend = () => {
    clearPace();
    callbacks?.onEnd?.();
  };
  utter.onerror = () => {
    clearPace();
    callbacks?.onEnd?.();
  };

  const start = () => window.speechSynthesis.speak(utter);

  if (allVoices().length === 0) {
    window.speechSynthesis.addEventListener("voiceschanged", start, {
      once: true,
    });
    window.setTimeout(start, 150);
  } else {
    start();
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

  stop() {
    clearPace();
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

  /** Japanese with Microsoft Nanami (七海) Online Natural + highlight. */
  speakJapanese(text: string, callbacks?: SpeakCallbacks, rate = SPEECH_RATE_NORMAL) {
    runUtterance(text, "ja-JP", pickNanamiVoice(), callbacks, true, rate);
  },

  /** English with Microsoft Andrew Online Natural + word highlight. */
  speakEnglish(text: string, callbacks?: SpeakCallbacks, rate = SPEECH_RATE_NORMAL) {
    runUtterance(text, "en-US", pickEnglishVoice(), callbacks, true, rate);
  },
};
