import { useEffect, useState } from "react";

const KEY = "jlpt-trainer:ambience-pan:v1";
const CHANGE_EVENT = "jlpt-trainer:ambience-pan-change";
/** Pan positions across the scene: 0 = left edge, 1 = right edge. */
const DEFAULT_PAN = 0.5;
/** Drift speed in pan units per second: edge to edge in 40 s. */
export const DRIFT_PER_SEC = 0.025;

export type DriftDirection = -1 | 0 | 1;

function normalizePan(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_PAN;
  return Math.min(1, Math.max(0, Math.round(value * 1000) / 1000));
}

function load(): number {
  try {
    const raw = globalThis.localStorage?.getItem(KEY);
    return raw == null ? DEFAULT_PAN : normalizePan(Number(raw));
  } catch {
    return DEFAULT_PAN;
  }
}

/** The art reads the pan from a root CSS variable, so every backdrop follows it. */
function applyPan(value: number): void {
  globalThis.document?.documentElement.style.setProperty("--amb-pan", String(value));
}

function save(value: number): void {
  try {
    globalThis.localStorage?.setItem(KEY, String(value));
  } catch {
    // private mode / quota
  }
}

applyPan(load());

/* ── Drift: one shared slow back-and-forth glide for every backdrop ── */

let drift: DriftDirection = 0;
let driftPan = DEFAULT_PAN;
let driftFrame: number | null = null;
let driftLast = 0;

/** Next pan and direction after `seconds` of drifting, bouncing off both edges. */
export function stepDrift(
  pan: number,
  direction: -1 | 1,
  seconds: number
): { pan: number; direction: -1 | 1 } {
  let next = pan + direction * DRIFT_PER_SEC * seconds;
  let dir = direction;
  if (next >= 1) {
    next = 2 - next;
    dir = -1;
  } else if (next <= 0) {
    next = -next;
    dir = 1;
  }
  return { pan: Math.min(1, Math.max(0, next)), direction: dir };
}

function driftTick(now: number): void {
  if (drift === 0) return;
  // A long gap (background tab) shouldn't jump the scene.
  const seconds = Math.min(0.1, (now - driftLast) / 1000);
  driftLast = now;
  const step = stepDrift(driftPan, drift, seconds);
  driftPan = step.pan;
  applyPan(driftPan);
  if (step.direction !== drift) {
    drift = step.direction;
    globalThis.dispatchEvent?.(new Event(CHANGE_EVENT));
  }
  driftFrame = globalThis.requestAnimationFrame(driftTick);
}

export function stopDrift(): void {
  if (drift === 0) return;
  drift = 0;
  if (driftFrame !== null) globalThis.cancelAnimationFrame(driftFrame);
  driftFrame = null;
  save(normalizePan(driftPan));
  globalThis.dispatchEvent?.(new Event(CHANGE_EVENT));
}

/**
 * ‹ / › tapped: glide slowly that way, turning round at each edge. Tapping
 * the way it's already going stops it; the other way reverses it.
 */
function toggleDrift(direction: -1 | 1): void {
  if (drift === direction) {
    stopDrift();
    return;
  }
  if (drift === 0) {
    driftPan = load();
    driftLast = globalThis.performance?.now() ?? 0;
    driftFrame = globalThis.requestAnimationFrame(driftTick);
  }
  drift = direction;
  globalThis.dispatchEvent?.(new Event(CHANGE_EVENT));
}

/** Which part of a cropped backdrop is visible — shared by every stage, remembered. */
export function useAmbiencePan(): {
  drift: DriftDirection;
  toggleDrift: (direction: -1 | 1) => void;
} {
  const [direction, setDirection] = useState<DriftDirection>(drift);

  useEffect(() => {
    const sync = () => setDirection(drift);
    globalThis.addEventListener?.(CHANGE_EVENT, sync);
    return () => globalThis.removeEventListener?.(CHANGE_EVENT, sync);
  }, []);

  return { drift: direction, toggleDrift };
}
