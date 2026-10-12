import { plainJapanese, plainReading, speechEnglish } from "../everydayData";
import { seededRandom, shuffle } from "../everydayQuiz";
import type { EverydayWord } from "../types";
import type { DiscoveryObject } from "./types";

/**
 * Find it / Listen rounds: the learner is given a word (written or spoken)
 * and taps the object in the scene. Pure state in → state out, so the round
 * logic is tested without a browser.
 */

/** "Stove burner, cooktop" → "stove burner"; "Roadway (for cars)" → "roadway". */
export function promptNoun(word: EverydayWord): string {
  const first = speechEnglish(word).split(/[,;]/)[0]!.trim();
  // Keep acronyms and names as written (ATM, IC); lower-case the rest.
  return first
    .split(" ")
    .map((w) => (/^[A-Z0-9]{2,}$/.test(w) ? w : w.toLowerCase()))
    .join(" ");
}

export interface FindPrompt {
  en: string;
  ja: string;
  /** Kana reading of `ja` for the voice. */
  jaReading: string;
}

export function findPrompt(obj: DiscoveryObject, word: EverydayWord): FindPrompt {
  if (obj.prompt) return obj.prompt;
  return {
    en: `Find the ${promptNoun(word)}.`,
    ja: `${plainJapanese(word)}を探してください。`,
    jaReading: `${plainReading(word)}をさがしてください。`,
  };
}

export interface RoundState {
  /** Object ids to find, in order. */
  queue: readonly string[];
  index: number;
  /** Answers found on the first tap. */
  firstTry: number;
  /** Targets that took more than one tap (for "Retry missed"). */
  missed: readonly string[];
  /** Wrong taps on the current target. */
  wrongNow: number;
}

/** A shuffled round over `ids`; the same seed gives the same order. */
export function newRound(ids: readonly string[], seed: string): RoundState {
  return { queue: shuffle(ids, seededRandom(seed)), index: 0, firstTry: 0, missed: [], wrongNow: 0 };
}

export function currentTarget(s: RoundState): string | null {
  return s.queue[s.index] ?? null;
}

export function roundDone(s: RoundState): boolean {
  return s.index >= s.queue.length;
}

export type TapResult = "correct" | "wrong" | "ignored";

/**
 * One tap. Correct → next target (first-try counted only with no wrong tap
 * before it). Wrong → stay on the target and remember it as missed.
 */
export function answerTap(s: RoundState, tappedId: string): { state: RoundState; result: TapResult } {
  const target = currentTarget(s);
  if (!target) return { state: s, result: "ignored" };
  if (tappedId === target) {
    return {
      result: "correct",
      state: {
        ...s,
        index: s.index + 1,
        firstTry: s.firstTry + (s.wrongNow === 0 ? 1 : 0),
        wrongNow: 0,
      },
    };
  }
  return {
    result: "wrong",
    state: {
      ...s,
      wrongNow: s.wrongNow + 1,
      missed: s.missed.includes(target) ? s.missed : [...s.missed, target],
    },
  };
}

/** Give up on the current target: counts as missed, moves on. */
export function skipTarget(s: RoundState): RoundState {
  const target = currentTarget(s);
  if (!target) return s;
  return {
    ...s,
    index: s.index + 1,
    wrongNow: 0,
    missed: s.missed.includes(target) ? s.missed : [...s.missed, target],
  };
}
