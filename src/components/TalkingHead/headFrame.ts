import { useSyncExternalStore } from "react";

/**
 * How the two heads are framed on screen:
 *   figure  the full illustrated portraits (looks, costumes, props)
 *   badge   round profile badges with the name under them, a gold ring
 *           that pulses while that voice speaks — quieter, app-like
 *
 * Shared by the head itself and the Player's control bar; remembered.
 */

export type HeadFrame = "figure" | "badge";

const KEY = "jlpt-trainer:talking-head-frame:v1";
const listeners = new Set<() => void>();

function load(): HeadFrame {
  try {
    return globalThis.localStorage?.getItem(KEY) === "badge" ? "badge" : "figure";
  } catch {
    return "figure";
  }
}

let frame: HeadFrame = load();

export function getHeadFrame(): HeadFrame {
  return frame;
}

export function setHeadFrame(next: HeadFrame): void {
  if (next === frame) return;
  frame = next;
  try {
    globalThis.localStorage?.setItem(KEY, next);
  } catch {
    // private mode / quota: still switch for this session
  }
  for (const l of listeners) l();
}

export function toggleHeadFrame(): HeadFrame {
  setHeadFrame(frame === "badge" ? "figure" : "badge");
  return frame;
}

export function subscribeHeadFrame(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useHeadFrame(): HeadFrame {
  return useSyncExternalStore(subscribeHeadFrame, getHeadFrame, getHeadFrame);
}

/** Test seam. */
export function __resetHeadFrame(): void {
  frame = load();
}
