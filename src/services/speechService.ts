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

/** Split Japanese into highlight units (kanji runs, kana runs, punctuation). */
export function splitHighlightUnits(text: string): { start: number; end: number }[] {
  const chars = [...text];
  const units: { start: number; end: number }[] = [];
  let i = 0;

  const isKanji = (ch: string) => /[\u4e00-\u9faf\u3400-\u4dbf]/.test(ch);
  const isKana = (ch: string) => /[\u3040-\u309f\u30a0-\u30ffー]/.test(ch);

  while (i < chars.length) {
    const start = i;
    const ch = chars[i]!;
    if (isKanji(ch)) {
      while (i < chars.length && isKanji(chars[i]!)) i++;
      // Keep each kanji as its own unit for clearer karaoke
      for (let k = start; k < i; k++) {
        units.push({ start: k, end: k + 1 });
      }
    } else if (isKana(ch)) {
      while (i < chars.length && isKana(chars[i]!)) i++;
      // Group short kana (okurigana / particles) as one unit if length <= 2, else per char
      if (i - start <= 2) {
        units.push({ start, end: i });
      } else {
        for (let k = start; k < i; k++) {
          units.push({ start: k, end: k + 1 });
        }
      }
    } else {
      i++;
      units.push({ start, end: i });
    }
  }
  return units;
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

let fallbackTimer: number | null = null;
let boundarySeen = false;

function clearFallback() {
  if (fallbackTimer !== null) {
    window.clearInterval(fallbackTimer);
    fallbackTimer = null;
  }
  boundarySeen = false;
}

function startFallbackHighlight(
  text: string,
  rate: number,
  mode: "ja" | "en",
  onBoundary?: (h: SpeechHighlight) => void
) {
  clearFallback();
  const units =
    mode === "en" ? splitEnglishHighlightUnits(text) : splitHighlightUnits(text);
  if (units.length === 0 || !onBoundary) return;

  const msPerUnit =
    mode === "en"
      ? Math.max(160, 320 / rate)
      : Math.max(90, 175 / rate);
  let index = 0;

  onBoundary(units[0]!);
  fallbackTimer = window.setInterval(() => {
    if (boundarySeen) {
      clearFallback();
      return;
    }
    index++;
    if (index >= units.length) {
      clearFallback();
      return;
    }
    onBoundary(units[index]!);
  }, msPerUnit);
}

export const SPEECH_RATE_NORMAL = 0.85;
export const SPEECH_RATE_SLOW = 0.7;
/** Slightly faster normal used only for the shadowing listen pass. */
export const SPEECH_RATE_SHADOWING = 0.95;

function runUtterance(
  text: string,
  lang: string,
  voice: SpeechSynthesisVoice | null,
  callbacks?: SpeakCallbacks,
  withHighlight = false,
  rate = SPEECH_RATE_NORMAL
) {
  if (!window.speechSynthesis || !text.trim()) return;

  clearFallback();
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  const isJa = lang.startsWith("ja");
  utter.lang = lang;
  utter.rate = rate;
  if (voice) utter.voice = voice;

  if (withHighlight && callbacks?.onBoundary) {
    utter.onboundary = (event: SpeechSynthesisEvent) => {
      if (event.name === "word" || event.name === "sentence" || !event.name) {
        boundarySeen = true;
        clearFallback();
        const start = event.charIndex ?? 0;
        let end: number;
        if (typeof event.charLength === "number" && event.charLength > 0) {
          end = start + event.charLength;
        } else if (!isJa) {
          const slice = text.slice(start);
          const word = slice.match(/^\S+/);
          end = start + (word ? word[0].length : 1);
        } else {
          end = start + Math.min(2, text.length - start) || start + 1;
        }
        callbacks.onBoundary?.({
          start,
          end: Math.min(text.length, end),
        });
      }
    };

    startFallbackHighlight(
      text,
      rate,
      isJa ? "ja" : "en",
      callbacks.onBoundary
    );
  }

  utter.onend = () => {
    clearFallback();
    callbacks?.onEnd?.();
  };
  utter.onerror = () => {
    clearFallback();
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
    clearFallback();
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
