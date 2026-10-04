import { useCallback, useEffect, useRef, useState } from "react";
import type { Voice } from "./duo";
import { playSuitOff, playSuitOn } from "./suitSfx";

const SUIT_KEY = "jlpt-trainer:talking-head-suit:v1";

/** How long the reveal (shutter lifting off the face) is allowed to play. */
export const SUIT_REVEAL_MS = 1400;

export type SuitState = Record<Voice, boolean>;

const NONE: SuitState = { ja: false, en: false };

/** Stored as JSON per voice; the older single "on"/"off" applies to both. */
function loadSuits(): SuitState {
  try {
    const raw = globalThis.localStorage?.getItem(SUIT_KEY);
    if (raw === "on") return { ja: true, en: true };
    if (!raw || raw === "off") return NONE;
    const parsed = JSON.parse(raw) as Partial<SuitState>;
    return { ja: parsed.ja === true, en: parsed.en === true };
  } catch {
    return NONE;
  }
}

/**
 * Mecha suit on/off per head (Nanami and Andrew separately) — off by default,
 * remembered across sessions. `revealing[voice]` is true briefly after that
 * head suits up, so it plays the reveal once rather than on every remount.
 * Each switch plays a mechanical sound; restoring a saved "on" is silent.
 */
export function useSuitMode(): {
  suit: SuitState;
  revealing: SuitState;
  toggleSuit: (voice: Voice) => boolean;
} {
  const [suit, setSuit] = useState(loadSuits);
  const [revealing, setRevealing] = useState<SuitState>(NONE);
  const suitRef = useRef(suit);
  suitRef.current = suit;
  const timers = useRef<Partial<Record<Voice, number>>>({});

  useEffect(
    () => () => {
      Object.values(timers.current).forEach((id) => window.clearTimeout(id));
    },
    []
  );

  const toggleSuit = useCallback((voice: Voice) => {
    const nextOn = !suitRef.current[voice];
    const next = { ...suitRef.current, [voice]: nextOn };
    suitRef.current = next;
    setSuit(next);
    try {
      globalThis.localStorage?.setItem(SUIT_KEY, JSON.stringify(next));
    } catch {
      // private mode / quota
    }
    if (nextOn) playSuitOn();
    else playSuitOff();
    const pending = timers.current[voice];
    if (pending) window.clearTimeout(pending);
    setRevealing((r) => ({ ...r, [voice]: nextOn }));
    if (nextOn) {
      timers.current[voice] = window.setTimeout(
        () => setRevealing((r) => ({ ...r, [voice]: false })),
        SUIT_REVEAL_MS
      );
    }
    return nextOn;
  }, []);

  return { suit, revealing, toggleSuit };
}
