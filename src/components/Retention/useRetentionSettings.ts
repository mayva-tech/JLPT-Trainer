import { useCallback, useState } from "react";

const KEY = "jlpt-trainer:player-retention:v1";

export interface RetentionSettings {
  /** "Can you read this?" before each word in Auto Mode. */
  hook: boolean;
  /** "Pause & answer" checkpoint every few words in Auto Mode. */
  check: boolean;
  /** A varied intro line before each word / pattern / quiz question (Auto Mode). */
  intro: boolean;
  /** A varied outro line after each one (Auto Mode). */
  outro: boolean;
}

const DEFAULTS: RetentionSettings = { hook: true, check: true, intro: true, outro: true };

function load(): RetentionSettings {
  try {
    const raw = globalThis.localStorage?.getItem(KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<RetentionSettings>) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

/** Retention features for lesson videos — all on by default, remembered. */
export function useRetentionSettings(): [RetentionSettings, (key: keyof RetentionSettings) => void] {
  const [settings, setSettings] = useState(load);
  const toggle = useCallback((key: keyof RetentionSettings) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        globalThis.localStorage?.setItem(KEY, JSON.stringify(next));
      } catch {
        // private mode / quota
      }
      return next;
    });
  }, []);
  return [settings, toggle];
}
