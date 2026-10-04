import { useCallback, useEffect, useRef, useState } from "react";

const SUIT_KEY = "jlpt-trainer:talking-head-suit:v1";

/** How long the reveal (shutter lifting off the face) is allowed to play. */
export const SUIT_REVEAL_MS = 1400;

function loadOn(): boolean {
  try {
    return globalThis.localStorage?.getItem(SUIT_KEY) === "on";
  } catch {
    return false;
  }
}

/**
 * Mecha suit on/off — off by default, remembered across sessions.
 * `revealing` is true briefly after switching on, so the stage plays the
 * reveal once rather than on every remount.
 */
export function useSuitMode(): {
  suit: boolean;
  revealing: boolean;
  toggleSuit: () => boolean;
} {
  const [suit, setSuit] = useState(loadOn);
  const [revealing, setRevealing] = useState(false);
  const suitRef = useRef(suit);
  suitRef.current = suit;
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    []
  );

  const toggleSuit = useCallback(() => {
    const next = !suitRef.current;
    suitRef.current = next;
    setSuit(next);
    try {
      globalThis.localStorage?.setItem(SUIT_KEY, next ? "on" : "off");
    } catch {
      // private mode / quota
    }
    if (timer.current) window.clearTimeout(timer.current);
    setRevealing(next);
    if (next) {
      timer.current = window.setTimeout(() => setRevealing(false), SUIT_REVEAL_MS);
    }
    return next;
  }, []);

  return { suit, revealing, toggleSuit };
}
