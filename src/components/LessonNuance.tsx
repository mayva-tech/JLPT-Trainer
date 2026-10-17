import { useLayoutEffect, useRef } from "react";
import type { SpeechHighlight } from "../services/speechService";
import { HighlightedEnglish } from "./HighlightedEnglish";
import { NUANCE_FOCUS_CLASS, NuanceFocus } from "./NuanceFocus";

type Props = {
  note?: string;
  active?: boolean;
  highlight?: SpeechHighlight | null;
  /** Kept hidden (space reserved) until the card's English meaning comes in. */
  pending?: boolean;
};

const FIT_CLASS = "safe-area--nuance-fit";
const MIN_FIT = 0.4;
const NAV_GAP_PX = 8;
const SIZE_VARS = [
  "--lesson-jp-word",
  "--lesson-jp-line",
  "--lesson-en-word",
  "--lesson-en-line",
] as const;

/** Amber Nuance box under a lesson card; renders nothing when there is no note. */
export function LessonNuance({ note, active = false, highlight = null, pending = false }: Props) {
  const text = note?.trim();
  const ref = useRef<HTMLDivElement>(null);

  // Keep the box on screen for the whole step (JP, EN and nuance playback):
  // tighten furigana line spacing, then shrink the JP/EN above it if needed.
  useLayoutEffect(() => {
    const box = ref.current;
    const safe = box?.closest<HTMLElement>(".safe-area");
    if (!box || !safe) return;

    const stage = safe.closest<HTMLElement>(".stage") ?? safe;
    const stageStyle = getComputedStyle(stage);
    const bases = SIZE_VARS.map(
      (name) => [name, stageStyle.getPropertyValue(name).trim()] as const
    ).filter(([, base]) => base);

    // Scale the stage's lesson type sizes (not CSS zoom, which skews the
    // rects the talking head uses to find clear space).
    const apply = (fit: number) => {
      for (const [name, base] of bases) {
        if (fit === 1) safe.style.removeProperty(name);
        else safe.style.setProperty(name, `calc(${base} * ${fit.toFixed(3)})`);
      }
      void safe.offsetHeight;
    };

    const fit = () => {
      // The fixed control bar can overlap the stage on short screens.
      const navTop =
        document.querySelector<HTMLElement>(".nav-bar")?.getBoundingClientRect().top ??
        Infinity;
      const fits = () =>
        safe.scrollHeight <= safe.clientHeight + 1 &&
        box.getBoundingClientRect().bottom <= navTop - NAV_GAP_PX;
      apply(1);
      if (fits()) return;
      let lo = MIN_FIT;
      let hi = 1;
      for (let i = 0; i < 10; i++) {
        const mid = (lo + hi) / 2;
        apply(mid);
        if (fits()) lo = mid;
        else hi = mid;
      }
      apply(lo);
    };

    safe.classList.add(FIT_CLASS);
    fit();

    let frame = 0;
    const refit = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };
    const resize = new ResizeObserver(refit);
    resize.observe(stage);
    // Furigana on/off changes the card height without resizing the stage.
    const furigana = new MutationObserver((records) => {
      if (
        records.some(
          (r) => r.target instanceof HTMLElement && r.target.classList.contains("furigana-wrap")
        )
      ) {
        refit();
      }
    });
    furigana.observe(safe, { attributes: true, attributeFilter: ["class"], subtree: true });
    void document.fonts?.ready.then(refit);

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      furigana.disconnect();
      safe.classList.remove(FIT_CLASS);
      for (const [name] of bases) safe.style.removeProperty(name);
    };
  }, [text]);

  // While the nuance is spoken, the card steps back and the box is shown
  // enlarged in the middle (NuanceFocus). Pending boxes stay in place only.
  const focused = Boolean(text) && active && !pending;
  useLayoutEffect(() => {
    const safe = ref.current?.closest<HTMLElement>(".safe-area");
    if (!safe || !focused) return;
    safe.classList.add(NUANCE_FOCUS_CLASS);
    return () => safe.classList.remove(NUANCE_FOCUS_CLASS);
  }, [focused]);

  if (!text) return null;
  return (
    <>
      <div
        ref={ref}
        className={[
          "lesson-nuance meaning-reveal",
          active ? "lesson-nuance--active" : "",
          focused ? "lesson-nuance--held" : "",
          pending ? "meaning-reveal--hidden" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className="lesson-nuance-label">Nuance</span>
        <HighlightedEnglish
          text={text}
          className="lesson-nuance-body"
          highlight={active && !focused ? highlight : null}
          jpWordBreaks
          readingGlosses
        />
      </div>
      {focused ? <NuanceFocus text={text} highlight={highlight} /> : null}
    </>
  );
}
