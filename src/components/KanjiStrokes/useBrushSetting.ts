import { useCallback, useEffect, useState } from "react";

const KEY = "jlpt-trainer:brush-strokes:v1";
/** Keeps every mounted toggle (Player, Synonyms) on the same value. */
const CHANGE_EVENT = "jlpt-trainer:brush-change";

function load(): boolean {
  try {
    return globalThis.localStorage?.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

/**
 * Brush-stroke writing of the target word (Player word step, Synonyms
 * pairs) — on by default, remembered across sessions.
 */
export function useBrushSetting(): [boolean, () => void] {
  const [on, setOn] = useState(load);

  useEffect(() => {
    const sync = () => setOn(load());
    globalThis.addEventListener?.(CHANGE_EVENT, sync);
    return () => globalThis.removeEventListener?.(CHANGE_EVENT, sync);
  }, []);

  const toggle = useCallback(() => {
    setOn((prev) => {
      const next = !prev;
      try {
        globalThis.localStorage?.setItem(KEY, next ? "on" : "off");
      } catch {
        // private mode / quota
      }
      return next;
    });
    queueMicrotask(() => globalThis.dispatchEvent?.(new Event(CHANGE_EVENT)));
  }, []);
  return [on, toggle];
}
