import { useCallback, useEffect, useState, type RefObject } from "react";

function load(key: string): boolean {
  try {
    return globalThis.localStorage?.getItem(key) === "open";
  } catch {
    return false;
  }
}

/**
 * Open/closed state of a foldable button bar, remembered per bar. Bars start
 * folded so the stage gets the full height.
 */
export function useFoldedBar(key: string): [boolean, () => void] {
  const [open, setOpen] = useState(() => load(key));
  const toggle = useCallback(() => {
    setOpen((was) => {
      const next = !was;
      try {
        globalThis.localStorage?.setItem(key, next ? "open" : "folded");
      } catch {
        // storage unavailable: still toggles for this session
      }
      return next;
    });
  }, [key]);
  return [open, toggle];
}

/**
 * Lets a mouse wheel scroll a one-row bar sideways (most mice have no
 * horizontal wheel). Only takes the wheel while the row can still move.
 */
export function useWheelSideScroll(ref: RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      const next = Math.min(max, Math.max(0, el.scrollLeft + event.deltaY));
      if (next === el.scrollLeft) return;
      event.preventDefault();
      el.scrollLeft = next;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [ref, active]);
}
