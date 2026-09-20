/**
 * Shared speech UI preferences for JLPT Trainer + ペラペラクエスト.
 * Japanese voice is always resolved via `ttsVoices` → Microsoft Nanami.
 */

/** v2: Auto Voice defaults OFF for Pera Pera Quest page opens. */
export const SPEECH_PREFS_KEY = "jlpt-trainer:speech-prefs:v2";

export type SpeechRateMode = "normal" | "slow" | "fast";

export type SpeechPreferences = {
  /** Auto-play Japanese→English lines when a new step appears. */
  autoVoice: boolean;
  rateMode: SpeechRateMode;
};

const DEFAULTS: SpeechPreferences = {
  autoVoice: false,
  rateMode: "normal",
};

function parseRateMode(value: unknown): SpeechRateMode {
  if (value === "slow" || value === "fast") return value;
  return "normal";
}

type Store = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

function browserStore(): Store | null {
  try {
    const store = globalThis.localStorage;
    if (!store?.getItem || !store?.setItem) return null;
    return store;
  } catch {
    return null;
  }
}

export function loadSpeechPreferences(
  store: Store | null = browserStore()
): SpeechPreferences {
  if (!store) return { ...DEFAULTS };
  try {
    const raw = store.getItem(SPEECH_PREFS_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      autoVoice:
        typeof parsed.autoVoice === "boolean"
          ? parsed.autoVoice
          : DEFAULTS.autoVoice,
      rateMode: parseRateMode(parsed.rateMode),
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSpeechPreferences(
  prefs: SpeechPreferences,
  store: Store | null = browserStore()
): void {
  if (!store) return;
  try {
    store.setItem(SPEECH_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Private mode / quota
  }
}

export function updateSpeechPreferences(
  patch: Partial<SpeechPreferences>,
  store: Store | null = browserStore()
): SpeechPreferences {
  const next = { ...loadSpeechPreferences(store), ...patch };
  saveSpeechPreferences(next, store);
  return next;
}
