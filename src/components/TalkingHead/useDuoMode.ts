import { useCallback, useEffect, useRef, useState } from "react";
import {
  isDuoActive,
  msUntilSolo,
  recordVoice,
  type RecentVoices,
  type SeatRole,
  type Voice,
} from "./duo";

const DUO_KEY = "jlpt-trainer:talking-head-duo:v1";

function loadDuoOn(): boolean {
  try {
    return globalThis.localStorage?.getItem(DUO_KEY) !== "off";
  } catch {
    return true;
  }
}

/**
 * Whether Nanami and Andrew share the stage right now. Records each time a
 * voice starts speaking and falls back to a single head once one of them has
 * been quiet for the duo window. Can be switched off (persisted).
 */
export function useDuoMode(
  lang: Voice | null,
  speaking: boolean
): { duo: boolean; toggleDuo: () => boolean } {
  const [recent, setRecent] = useState<RecentVoices>({});
  const [, setTick] = useState(0);
  const [duoOn, setDuoOn] = useState(loadDuoOn);
  const onRef = useRef(duoOn);
  onRef.current = duoOn;

  // Record every utterance start (speaking flips on, or the voice changes).
  useEffect(() => {
    if (!speaking || !lang) return;
    setRecent((prev) => recordVoice(prev, lang, Date.now()));
  }, [lang, speaking]);

  // Re-render once when the window lapses, so the stage folds back to solo.
  useEffect(() => {
    const left = msUntilSolo(recent, Date.now());
    if (left === null) return;
    const id = window.setTimeout(() => setTick((t) => t + 1), left + 50);
    return () => window.clearTimeout(id);
  }, [recent]);

  const toggleDuo = useCallback(() => {
    const next = !onRef.current;
    setDuoOn(next);
    try {
      globalThis.localStorage?.setItem(DUO_KEY, next ? "on" : "off");
    } catch {
      // private mode / quota
    }
    return next;
  }, []);

  return { duo: duoOn && isDuoActive(recent, Date.now()), toggleDuo };
}

/** Share of glances aimed at the partner, per role; the rest wander freely. */
const ATTENTION: Record<SeatRole, number> = {
  solo: 0,
  listening: 0.7,
  speaking: 0.4,
  idle: 0.45,
};

/** Whether this head is looking at its partner right now — changes at random. */
export function useDuoAttention(role: SeatRole): boolean {
  const [attending, setAttending] = useState(true);
  useEffect(() => {
    const share = ATTENTION[role];
    if (share === 0) return;
    let id = 0;
    const schedule = () => {
      id = window.setTimeout(() => {
        setAttending(Math.random() < share);
        schedule();
      }, 900 + Math.random() * 2200);
    };
    schedule();
    return () => window.clearTimeout(id);
  }, [role]);
  return role !== "solo" && attending;
}

/** A listener's aizuchi: a small nod every couple of seconds while active. */
export function useAizuchi(active: boolean): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let id = 0;
    const schedule = () => {
      id = window.setTimeout(() => {
        if (cancelled) return;
        setCount((c) => c + 1);
        schedule();
      }, 1600 + Math.random() * 2000);
    };
    // First nod lands a beat after the partner starts talking.
    id = window.setTimeout(() => {
      if (cancelled) return;
      setCount((c) => c + 1);
      schedule();
    }, 700 + Math.random() * 600);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [active]);
  return count;
}
