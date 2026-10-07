import { useCallback, useEffect, useState } from "react";

const KEY = "jlpt-trainer:ambience-pan:v1";
const CHANGE_EVENT = "jlpt-trainer:ambience-pan-change";
/** Pan positions across the scene: 0 = left edge, 1 = right edge. */
export const PAN_STEP = 0.05;
const DEFAULT_PAN = 0.5;

function clampPan(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_PAN;
  const snapped = Math.round(Math.round(value / PAN_STEP) * PAN_STEP * 100) / 100;
  return Math.min(1, Math.max(0, snapped));
}

function load(): number {
  try {
    const raw = globalThis.localStorage?.getItem(KEY);
    return raw == null ? DEFAULT_PAN : clampPan(Number(raw));
  } catch {
    return DEFAULT_PAN;
  }
}

/** The art reads the pan from a root CSS variable, so every backdrop follows it. */
function applyPan(value: number): void {
  globalThis.document?.documentElement.style.setProperty("--amb-pan", String(value));
}

applyPan(load());

/** Which part of a cropped backdrop is visible — shared by every stage, remembered. */
export function useAmbiencePan(): [number, (delta: number) => void] {
  const [pan, setPan] = useState(load);

  useEffect(() => {
    const sync = () => setPan(load());
    globalThis.addEventListener?.(CHANGE_EVENT, sync);
    return () => globalThis.removeEventListener?.(CHANGE_EVENT, sync);
  }, []);

  const shift = useCallback((delta: number) => {
    const next = clampPan(load() + delta);
    try {
      globalThis.localStorage?.setItem(KEY, String(next));
    } catch {
      // private mode / quota
    }
    applyPan(next);
    setPan(next);
    queueMicrotask(() => globalThis.dispatchEvent?.(new Event(CHANGE_EVENT)));
  }, []);

  return [pan, shift];
}
