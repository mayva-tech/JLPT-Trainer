import { looksFor, resolveLook, stepLookId, type HeadLook } from "./looks";
import type { Voice } from "./duo";
import { SUIT_LABEL } from "./suit";
import { playSuitOff, playSuitOn } from "./suitSfx";

/**
 * Each head's chosen look and mecha suit, shared by the talking head and the
 * Player's control bar (separate Nanami / Andrew buttons). Remembered across
 * sessions; components read it through useHeadLook / useSuitMode.
 */

const LOOK_KEY = "jlpt-trainer:talking-head-look:v1";
const SUIT_KEY = "jlpt-trainer:talking-head-suit:v1";

/** How long the reveal (shutter lifting off the face) is allowed to play. */
export const SUIT_REVEAL_MS = 1400;

export type LookIds = Partial<Record<Voice, string>>;
export type SuitState = Record<Voice, boolean>;

/** Last change, so the head can flash its name whichever control made it. */
export type HeadStyleChange = { id: number; voice: Voice; text: string };

export type HeadStyleState = {
  lookIds: LookIds;
  suit: SuitState;
  revealing: SuitState;
  change: HeadStyleChange | null;
};

const NONE: SuitState = { ja: false, en: false };

function loadLookIds(): LookIds {
  try {
    const raw = globalThis.localStorage?.getItem(LOOK_KEY);
    if (!raw) return {};
    const rec = JSON.parse(raw) as Record<string, unknown> | null;
    if (!rec || typeof rec !== "object") return {};
    const out: LookIds = {};
    if (typeof rec.en === "string") out.en = rec.en;
    if (typeof rec.ja === "string") out.ja = rec.ja;
    return out;
  } catch {
    return {};
  }
}

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

function save(key: string, value: unknown) {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(value));
  } catch {
    // private mode / quota
  }
}

let state: HeadStyleState | null = null;
const listeners = new Set<() => void>();
const revealTimers: Partial<Record<Voice, ReturnType<typeof setTimeout>>> = {};
let changeId = 0;

export function getHeadStyle(): HeadStyleState {
  state ??= { lookIds: loadLookIds(), suit: loadSuits(), revealing: NONE, change: null };
  return state;
}

function set(next: HeadStyleState) {
  state = next;
  listeners.forEach((l) => l());
}

export function subscribeHeadStyle(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function lookOf(voice: Voice, ids: LookIds = getHeadStyle().lookIds): HeadLook {
  return resolveLook(looksFor(voice), ids[voice]);
}

/** Next (step 1) or previous (step -1) look for one head. */
export function cycleHeadLook(voice: Voice, step: number): HeadLook {
  const cur = getHeadStyle();
  const looks = looksFor(voice);
  const nextId = stepLookId(looks, cur.lookIds[voice], step);
  const lookIds = { ...cur.lookIds, [voice]: nextId };
  save(LOOK_KEY, lookIds);
  const look = resolveLook(looks, nextId);
  // Under the suit the new look is only seen once the suit comes off.
  const text = cur.suit[voice] ? `${look.label} (under the suit)` : look.label;
  set({ ...cur, lookIds, change: { id: ++changeId, voice, text } });
  return look;
}

/** Mecha suit on/off for one head, with its sound and a one-time reveal. */
export function toggleHeadSuit(voice: Voice): boolean {
  const cur = getHeadStyle();
  const on = !cur.suit[voice];
  const suit = { ...cur.suit, [voice]: on };
  save(SUIT_KEY, suit);
  if (on) playSuitOn();
  else playSuitOff();
  const pending = revealTimers[voice];
  if (pending) clearTimeout(pending);
  if (on) {
    revealTimers[voice] = setTimeout(() => {
      const now = getHeadStyle();
      set({ ...now, revealing: { ...now.revealing, [voice]: false } });
    }, SUIT_REVEAL_MS);
  }
  set({
    ...cur,
    suit,
    revealing: { ...cur.revealing, [voice]: on },
    change: { id: ++changeId, voice, text: `${SUIT_LABEL} ${on ? "on" : "off"}` },
  });
  return on;
}

/** Tests: forget the in-memory copy so the next read reloads storage. */
export function __resetHeadStyle() {
  Object.values(revealTimers).forEach((t) => clearTimeout(t));
  state = null;
  listeners.clear();
}
