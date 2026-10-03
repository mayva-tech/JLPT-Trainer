/**
 * Sensei bus — the mascot's inbox and settings.
 *
 * Anything can hand the mascot a tip with `showSenseiTip`; the single mounted
 * mascot decides when to pop up. Settings (which mascot, on/off) live here too
 * so the talking head's keyboard shortcut and the mascot stay in sync.
 * Tips shown from here are silent; only a tap on the mascot reads one aloud
 * (after stopping whatever was playing), so it cannot talk over a lesson.
 */

export type SenseiCharacter = "tanuki" | "neko";

export interface SenseiTip {
  /** Stable id, so the same tip is not repeated back to back. */
  id: string;
  /** Japanese key phrase (optional). */
  ja?: string;
  /** Kana reading of `ja`, when it contains kanji. */
  reading?: string;
  /** The note itself, in English. */
  en: string;
}

export interface SenseiSettings {
  character: SenseiCharacter;
  enabled: boolean;
}

const SETTINGS_KEY = "jlpt-trainer:sensei:v1";
const DEFAULT_SETTINGS: SenseiSettings = { character: "tanuki", enabled: true };

type TipListener = (tip: SenseiTip) => void;
type SettingsListener = (settings: SenseiSettings) => void;

const tipListeners = new Set<TipListener>();
const settingsListeners = new Set<SettingsListener>();
let settings: SenseiSettings | null = null;

function loadSettings(): SenseiSettings {
  try {
    const raw = globalThis.localStorage?.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const p = JSON.parse(raw) as Partial<SenseiSettings>;
    return {
      character: p.character === "neko" ? "neko" : "tanuki",
      enabled: p.enabled !== false,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function getSenseiSettings(): SenseiSettings {
  settings ??= loadSettings();
  return settings;
}

export function setSenseiSettings(patch: Partial<SenseiSettings>): SenseiSettings {
  settings = { ...getSenseiSettings(), ...patch };
  try {
    globalThis.localStorage?.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // private mode / quota
  }
  for (const l of settingsListeners) {
    try {
      l(settings);
    } catch {
      // UI problem, not the caller's
    }
  }
  return settings;
}

export function subscribeToSenseiSettings(listener: SettingsListener): () => void {
  settingsListeners.add(listener);
  return () => {
    settingsListeners.delete(listener);
  };
}

/** Hand the mascot a tip to show. */
export function showSenseiTip(tip: SenseiTip): void {
  for (const l of tipListeners) {
    try {
      l(tip);
    } catch {
      // UI problem, not the caller's
    }
  }
}

export function subscribeToSenseiTips(listener: TipListener): () => void {
  tipListeners.add(listener);
  return () => {
    tipListeners.delete(listener);
  };
}

/** Test seam. */
export function __resetSenseiBus(): void {
  tipListeners.clear();
  settingsListeners.clear();
  settings = null;
}
