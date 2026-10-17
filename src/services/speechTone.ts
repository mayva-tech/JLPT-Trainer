import { useSyncExternalStore } from "react";

/**
 * Lively voices: per-line prosody for Nanami and Andrew.
 *
 * The browser voices only take a rate and a pitch per utterance (no speaking
 * styles), so "emotion" here is a small lift of both, picked per line:
 *
 *   opening   the first line after a silence (the start of a talk): faster, brighter
 *   excited   hooks and lines ending in "!": quick and bright
 *   question  lines ending in "?": a little higher
 *   outro     wrap-ups: unhurried, a touch warmer (lower)
 *   explain   nuance notes: calm, a touch lower
 *   neutral   everything else, untouched
 *
 * Learning content stays clean on purpose. Punctuation and silence only
 * shape Andrew's English; Nanami's Japanese changes tone only where a caller
 * asks for it (hook lines, notes), never on a vocabulary word or an example
 * sentence. Speed is only lifted at the normal pace (a learner who picked
 * Slow or Fast keeps exactly that), and never slowed, because karaoke timing
 * already assumes the normal pace is the slowest the voice really goes.
 *
 * Switchable (Player bar "Lively", remembered); off = every line neutral.
 */

export type SpeechTone = "neutral" | "opening" | "excited" | "question" | "outro" | "explain";

export interface Prosody {
  /** Multiplier on the utterance rate (applied only at the normal pace). */
  rate: number;
  /** Web Speech pitch (1 = the voice's own). */
  pitch: number;
}

export const TONE_PROSODY: Readonly<Record<SpeechTone, Prosody>> = {
  neutral: { rate: 1, pitch: 1 },
  opening: { rate: 1.15, pitch: 1.12 },
  excited: { rate: 1.1, pitch: 1.1 },
  question: { rate: 1.04, pitch: 1.07 },
  outro: { rate: 1, pitch: 0.97 },
  explain: { rate: 1, pitch: 0.96 },
};

/** Silence after which the next English line counts as the start of a talk. */
export const OPENING_GAP_MS = 4000;

/** Rates treated as "normal pace" (Normal 0.80 … Natural 0.92). */
const LIFT_MIN_RATE = 0.79;
const LIFT_MAX_RATE = 0.93;
/** A lifted rate never goes past this (just under the 1.25× preset). */
const LIFT_CAP = 0.95;

/* ── Setting ────────────────────────────────────────────────────── */

const KEY = "jlpt-trainer:lively-voices:v1";
const listeners = new Set<() => void>();

function load(): boolean {
  try {
    return globalThis.localStorage?.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

let lively = load();

export function getLivelyVoices(): boolean {
  return lively;
}

export function setLivelyVoices(on: boolean): void {
  if (on === lively) return;
  lively = on;
  try {
    globalThis.localStorage?.setItem(KEY, on ? "on" : "off");
  } catch {
    // private mode: still applies for this session
  }
  for (const l of listeners) l();
}

export function subscribeLivelyVoices(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useLivelyVoices(): boolean {
  return useSyncExternalStore(subscribeLivelyVoices, getLivelyVoices, getLivelyVoices);
}

/* ── Choosing a tone ────────────────────────────────────────────── */

/** Tone from the line itself — English only (see the module note). */
export function inferTone(text: string, lang: "ja" | "en"): SpeechTone {
  if (lang !== "en") return "neutral";
  const end = text.trim().replace(/["'”’)\]]+$/u, "");
  if (/\?$/u.test(end)) return "question";
  if (/!$/u.test(end)) return "excited";
  return "neutral";
}

let lastSpokeAt = Number.NEGATIVE_INFINITY;

/** Called by the speech service whenever a voice starts or stops. */
export function markSpeechActivity(at: number = Date.now()): void {
  lastSpokeAt = at;
}

/** True after a silence long enough that the next line starts a talk. */
export function isTalkOpening(at: number = Date.now()): boolean {
  return at - lastSpokeAt > OPENING_GAP_MS;
}

/**
 * One-shot tone for the next speak call (runners set it right before they
 * speak a hook line; the service takes it and clears it).
 */
let nextTone: SpeechTone | null = null;

export function setNextSpeechTone(tone: SpeechTone | null): void {
  nextTone = tone;
}

export function takeNextSpeechTone(): SpeechTone | null {
  const t = nextTone;
  nextTone = null;
  return t;
}

/**
 * The tone a whole speak call starts with: an explicit one, else "opening"
 * for an English line after a silence, else null (each segment infers its own).
 */
export function callTone(explicit: SpeechTone | null | undefined, lang: "ja" | "en"): SpeechTone | null {
  if (explicit) return explicit;
  if (lang === "en" && isTalkOpening()) return "opening";
  return null;
}

/** Tone of segment `index` of a call (an opening lifts only its first segment). */
export function segmentTone(call: SpeechTone | null, index: number, segmentText: string, lang: "ja" | "en"): SpeechTone {
  if (call === "opening") return index === 0 ? "opening" : inferTone(segmentText, lang);
  return call ?? inferTone(segmentText, lang);
}

/** Rate and pitch for an utterance at `baseRate` in `tone`. */
export function prosodyFor(tone: SpeechTone, baseRate: number): { rate: number; pitch: number } {
  if (!lively || tone === "neutral") return { rate: baseRate, pitch: 1 };
  const p = TONE_PROSODY[tone];
  const atNormalPace = baseRate >= LIFT_MIN_RATE && baseRate <= LIFT_MAX_RATE;
  const rate = atNormalPace && p.rate > 1 ? Math.min(LIFT_CAP, Math.max(baseRate, baseRate * p.rate)) : baseRate;
  return { rate, pitch: p.pitch };
}

/** Test seam. */
export function __resetSpeechTone(): void {
  lively = load();
  lastSpokeAt = Number.NEGATIVE_INFINITY;
  nextTone = null;
}
