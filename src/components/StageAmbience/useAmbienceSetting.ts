import { useCallback, useEffect, useState } from "react";

const KEY = "jlpt-trainer:player-ambience:v1";
/** Keeps every mounted toggle (Player and the app shell) on the same value. */
const CHANGE_EVENT = "jlpt-trainer:ambience-change";

function load(): boolean {
  try {
    return globalThis.localStorage?.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

/** Theme backgrounds on/off — on by default, remembered across sessions. */
export function useAmbienceSetting(): [boolean, () => void] {
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
