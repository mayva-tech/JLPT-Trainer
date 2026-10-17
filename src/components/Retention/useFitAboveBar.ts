import { useLayoutEffect, type RefObject } from "react";

/** Gap kept between the content and the stage edge / control bar. */
const MARGIN_PX = 8;
const MIN_ZOOM = 0.45;

/** Lowest point the content may reach: the stage bottom, or the control bar above it. */
function limitFor(el: HTMLElement): number | null {
  const stage = el.closest(".stage");
  if (!stage) return null;
  const s = stage.getBoundingClientRect();
  let bottom = s.bottom;
  const bar = document.querySelector<HTMLElement>(".nav-bar");
  if (bar) {
    const b = bar.getBoundingClientRect();
    const overStage = b.width > 0 && b.top < s.bottom && b.bottom > s.top && b.right > s.left && b.left < s.right;
    if (overStage) bottom = Math.min(bottom, b.top);
  }
  return bottom - MARGIN_PX;
}

/**
 * Zooms `ref`'s content down until it ends above the stage bottom and the
 * fixed control bar, so a long card is never cut off. Re-fits when `watch`
 * changes and when the stage resizes.
 */
export function useFitAboveBar(ref: RefObject<HTMLElement | null>, watch: unknown): void {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fits = () => {
      const limit = limitFor(el);
      return limit === null || el.getBoundingClientRect().bottom <= limit;
    };
    const apply = (zoom: number) => {
      el.style.zoom = zoom === 1 ? "" : String(zoom);
    };
    const fit = () => {
      apply(1);
      if (fits()) return;
      let lo = MIN_ZOOM;
      let hi = 1;
      for (let i = 0; i < 12; i++) {
        const mid = (lo + hi) / 2;
        apply(mid);
        if (fits()) lo = mid;
        else hi = mid;
      }
      apply(lo);
    };

    fit();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => fit());
    const stage = el.closest(".stage");
    if (stage) ro.observe(stage);
    const bar = document.querySelector(".nav-bar");
    if (bar) ro.observe(bar);
    return () => ro.disconnect();
  }, [ref, watch]);
}
