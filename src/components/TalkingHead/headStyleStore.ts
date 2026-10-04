import { looksFor, resolveLook, stepLookId, type HeadLook } from "./looks";
import type { Voice } from "./duo";
import { COSTUMES, costumeById, stepCostume, type Costume, type CostumeId } from "./costumes";
import { playCostumeOff, playCostumeOn } from "./costumeSfx";

/**
 * Each head's chosen look and costume, shared by the talking head and the
 * Player's control bar (separate Nanami / Andrew buttons). Remembered across
 * sessions; components read it through useHeadLook / useHeadCostume.
 */

const LOOK_KEY = "jlpt-trainer:talking-head-look:v1";
const COSTUME_KEY = "jlpt-trainer:talking-head-costume:v1";
/** Before costumes: the mecha suit alone, "on"/"off" or `{ ja, en }` booleans. */
const OLD_SUIT_KEY = "jlpt-trainer:talking-head-suit:v1";

/** How long the reveal (mecha shutter or poof cloud) is allowed to play. */
export const COSTUME_REVEAL_MS = 1400;

export type LookIds = Partial<Record<Voice, string>>;
export type CostumeState = Record<Voice, CostumeId | null>;
export type RevealState = Record<Voice, boolean>;

/** Last change, so the head can flash its name whichever control made it. */
export type HeadStyleChange = { id: number; voice: Voice; text: string };

export type HeadStyleState = {
  lookIds: LookIds;
  /** Costume each head is wearing, or null for its own clothes. */
  costume: CostumeState;
  /** Last costume each head wore — what toggling brings back. */
  lastCostume: Record<Voice, CostumeId>;
  revealing: RevealState;
  change: HeadStyleChange | null;
};

const VOICES: readonly Voice[] = ["ja", "en"];
const NO_REVEAL: RevealState = { ja: false, en: false };

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

type SavedHead = { on: CostumeId | null; last: CostumeId };

function readHead(rec: unknown): SavedHead {
  const r = (rec && typeof rec === "object" ? rec : {}) as { on?: string | null; last?: string };
  return {
    on: costumeById(r.on)?.id ?? null,
    last: costumeById(r.last)?.id ?? costumeById(r.on)?.id ?? COSTUMES[0].id,
  };
}

/**
 * Saved per head as `{ ja: {on, last}, en: {on, last} }`. Also reads a single
 * `{on, last}` (both heads) and the older mecha-suit key.
 */
function loadCostumes(): Record<Voice, SavedHead> {
  const none = (): Record<Voice, SavedHead> => ({
    ja: { on: null, last: COSTUMES[0].id },
    en: { on: null, last: COSTUMES[0].id },
  });
  try {
    const raw = globalThis.localStorage?.getItem(COSTUME_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Record<string, unknown> | null;
      if (p && typeof p === "object" && ("ja" in p || "en" in p)) {
        return { ja: readHead(p.ja), en: readHead(p.en) };
      }
      const both = readHead(p);
      return { ja: { ...both }, en: { ...both } };
    }
    const old = globalThis.localStorage?.getItem(OLD_SUIT_KEY);
    if (old === "on") return { ja: { on: "mecha", last: "mecha" }, en: { on: "mecha", last: "mecha" } };
    if (old && old !== "off") {
      const p = JSON.parse(old) as Partial<Record<Voice, boolean>>;
      const out = none();
      for (const v of VOICES) if (p[v] === true) out[v] = { on: "mecha", last: "mecha" };
      return out;
    }
  } catch {
    // corrupt or unavailable — fall through
  }
  return none();
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
  if (!state) {
    const saved = loadCostumes();
    state = {
      lookIds: loadLookIds(),
      costume: { ja: saved.ja.on, en: saved.en.on },
      lastCostume: { ja: saved.ja.last, en: saved.en.last },
      revealing: NO_REVEAL,
      change: null,
    };
  }
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

/** The costume a head is wearing, or null. */
export function costumeOf(voice: Voice, worn: CostumeState = getHeadStyle().costume): Costume | null {
  return costumeById(worn[voice]);
}

/** Next (step 1) or previous (step -1) look for one head. */
export function cycleHeadLook(voice: Voice, step: number): HeadLook {
  const cur = getHeadStyle();
  const looks = looksFor(voice);
  const nextId = stepLookId(looks, cur.lookIds[voice], step);
  const lookIds = { ...cur.lookIds, [voice]: nextId };
  save(LOOK_KEY, lookIds);
  const look = resolveLook(looks, nextId);
  // Under a costume the new look is only seen once it comes off.
  const text = cur.costume[voice] ? `${look.label} (under the costume)` : look.label;
  set({ ...cur, lookIds, change: { id: ++changeId, voice, text } });
  return look;
}

/**
 * Put a costume on one head (null: back to its own clothes), with that
 * costume's sound and a one-time reveal. Picking what it already wears does
 * nothing.
 */
export function wearHeadCostume(voice: Voice, id: CostumeId | null): Costume | null {
  const cur = getHeadStyle();
  const prev = cur.costume[voice];
  if (prev === id) return costumeById(id);
  const costume = { ...cur.costume, [voice]: id };
  const lastCostume = { ...cur.lastCostume, [voice]: id ?? cur.lastCostume[voice] };
  save(COSTUME_KEY, {
    ja: { on: costume.ja, last: lastCostume.ja },
    en: { on: costume.en, last: lastCostume.en },
  });
  if (id) playCostumeOn(id);
  else if (prev) playCostumeOff(prev);
  const pending = revealTimers[voice];
  if (pending) clearTimeout(pending);
  if (id) {
    revealTimers[voice] = setTimeout(() => {
      const now = getHeadStyle();
      set({ ...now, revealing: { ...now.revealing, [voice]: false } });
    }, COSTUME_REVEAL_MS);
  }
  const worn = costumeById(id);
  set({
    ...cur,
    costume,
    lastCostume,
    revealing: { ...cur.revealing, [voice]: Boolean(id) },
    change: { id: ++changeId, voice, text: worn ? worn.label : "Normal clothes" },
  });
  return worn;
}

/** Costume off, or the last one worn back on. */
export function toggleHeadCostume(voice: Voice): Costume | null {
  const cur = getHeadStyle();
  return wearHeadCostume(voice, cur.costume[voice] ? null : cur.lastCostume[voice]);
}

/** Next (step 1) or previous (step -1) costume, from the one worn or last worn. */
export function cycleHeadCostume(voice: Voice, step: number): Costume {
  const cur = getHeadStyle();
  const from = cur.costume[voice] ?? cur.lastCostume[voice];
  return wearHeadCostume(voice, stepCostume(from, step)) as Costume;
}

/** Tests: forget the in-memory copy so the next read reloads storage. */
export function __resetHeadStyle() {
  Object.values(revealTimers).forEach((t) => clearTimeout(t));
  state = null;
  listeners.clear();
}
