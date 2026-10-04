/**
 * Global reaction bus — how answer checks tell the talking head to react.
 *
 * Mirrors speechBus: quizzes, game modes and quests only call
 * `reportAnswer` / `reportSessionEnd` (one line each), and the single mounted
 * `<TalkingHead />` decides how to show it. Streak and miss-run tracking lives
 * here so every caller gets consistent milestones without its own counters.
 *
 * Nothing here speaks, so it can never collide with the feedback TTS that
 * usually follows an answer; `reportAnswer` only adds a short answer sound
 * (see answerSfx), which is over before that speech starts.
 */

import { playAnswerSound } from "./answerSfx";

export type HeadReactionKind =
  | "correct"
  | "wrong"
  | "almost"
  | "streak"
  | "celebrate"
  | "encourage";

export interface HeadReactionEvent {
  kind: HeadReactionKind;
  /** Streak length for "streak"; otherwise 0. */
  count: number;
  /** Increments per event, so identical back-to-back reactions still replay. */
  id: number;
}

type Listener = (event: HeadReactionEvent) => void;

const listeners = new Set<Listener>();
let nextId = 1;
let streak = 0;
let misses = 0;

/** Correct answers in a row that trigger a streak reaction: 3, then every 5. */
export function isStreakMilestone(n: number): boolean {
  return n === 3 || (n >= 5 && n % 5 === 0);
}

export function subscribeToReactions(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Announce a reaction directly. Never throws into the caller. */
export function emitReaction(kind: HeadReactionKind, count = 0): void {
  const event: HeadReactionEvent = { kind, count, id: nextId++ };
  for (const listener of listeners) {
    try {
      listener(event);
    } catch {
      // A broken listener is a UI problem, not a reason to break a quiz.
    }
  }
}

/**
 * Report one answered question. `"almost"` is for graded answers that are
 * acceptable but not natural (e.g. an awkward conversation choice) — it
 * breaks a streak without counting as a miss.
 */
export function reportAnswer(result: boolean | "almost"): void {
  playAnswerSound(result);
  if (result === "almost") {
    streak = 0;
    emitReaction("almost");
    return;
  }
  if (result) {
    streak += 1;
    misses = 0;
    if (isStreakMilestone(streak)) emitReaction("streak", streak);
    else emitReaction("correct");
    return;
  }
  streak = 0;
  misses += 1;
  // Three misses in a row: stop piling on — cheer the learner up instead.
  if (misses % 3 === 0) emitReaction("encourage");
  else emitReaction("wrong");
}

/** Report a finished session; `accuracy` is 0–1. Resets the counters. */
export function reportSessionEnd(accuracy: number): void {
  streak = 0;
  misses = 0;
  if (!Number.isFinite(accuracy)) return;
  if (accuracy >= 0.8) emitReaction("celebrate");
  else if (accuracy < 0.5) emitReaction("encourage");
  else emitReaction("correct");
}

/** Test seam — drops listeners and counters. */
export function __resetReactionBus(): void {
  listeners.clear();
  streak = 0;
  misses = 0;
  nextId = 1;
}
