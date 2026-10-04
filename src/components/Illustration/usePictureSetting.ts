import { useCallback, useState } from "react";

const KEY = "jlpt-trainer:player-pictures:v1";

function load(): boolean {
  try {
    return globalThis.localStorage?.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

/** Player pictures on/off — on by default, remembered across sessions. */
export function usePictureSetting(): [boolean, () => void] {
  const [on, setOn] = useState(load);
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
  }, []);
  return [on, toggle];
}
