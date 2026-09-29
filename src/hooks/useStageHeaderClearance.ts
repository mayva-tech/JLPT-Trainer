import { useLayoutEffect, type RefObject } from "react";

const HEADER_SELECTOR = ".vocabulary-range-label";
/** Breathing room between the header chips and the first furigana row. */
const GAP_PX = 6;

/**
 * Publishes `--header-clear` (px from the stage top to just below the header)
 * so `.safe-area` can start beneath a header that wraps onto extra lines.
 */
export function useStageHeaderClearance(stageRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const update = () => {
      const header = stage.querySelector<HTMLElement>(HEADER_SELECTOR);
      const clear = header
        ? Math.ceil(
            header.getBoundingClientRect().bottom -
              stage.getBoundingClientRect().top +
              GAP_PX
          )
        : 0;
      const next = `${clear}px`;
      if (stage.style.getPropertyValue("--header-clear") !== next) {
        stage.style.setProperty("--header-clear", next);
      }
    };

    update();
    const resize = new ResizeObserver(update);
    resize.observe(stage);
    const header = stage.querySelector<HTMLElement>(HEADER_SELECTOR);
    if (header) resize.observe(header);
    return () => resize.disconnect();
  });
}
