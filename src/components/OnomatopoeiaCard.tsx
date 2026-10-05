import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import type { OnomatopoeiaItem, OnomatopoeiaPart } from "../types/onomatopoeia";
import type { SpeechHighlight } from "../services/speechService";
import { getOnomatopoeiaCategory } from "../data/onomatopoeia";
import { FuriganaWrapText } from "./FuriganaWrapText";
import { HighlightedEnglish } from "./HighlightedEnglish";
import { OnoWordFx } from "./OnoFx/OnoWordFx";
import { PitchAccentLine } from "./PitchAccent/PitchAccentLine";

export type { OnomatopoeiaPart };

type Props = {
  item: OnomatopoeiaItem;
  activePart?: OnomatopoeiaPart | null;
  jaHighlight?: SpeechHighlight | null;
  enHighlight?: SpeechHighlight | null;
  showFurigana?: boolean;
};

const MIN_FIT = 0.45;
const NAV_GAP_PX = 8;

/**
 * Scale the card's type (via --ono-fit, not CSS zoom, so the talking head and
 * karaoke still read true rects) down until every line sits on the stage and
 * above the fixed control bar.
 */
function useOnoFit(
  ref: RefObject<HTMLDivElement | null>,
  itemId: OnomatopoeiaItem["id"],
  showFurigana: boolean
) {
  useLayoutEffect(() => {
    const safe = ref.current;
    if (!safe) return;
    const stage = safe.closest<HTMLElement>(".stage") ?? safe;

    const apply = (fit: number) => {
      if (fit === 1) safe.style.removeProperty("--ono-fit");
      else safe.style.setProperty("--ono-fit", fit.toFixed(3));
      void safe.offsetHeight;
    };
    // The card may use the stage below the safe area (the talking heads move
    // off Japanese text on their own), but never the area under the nav bar.
    const fits = () => {
      const navTop =
        document.querySelector<HTMLElement>(".nav-bar")?.getBoundingClientRect().top ??
        Infinity;
      const floor = Math.min(stage.getBoundingClientRect().bottom, navTop) - NAV_GAP_PX;
      const last = safe.lastElementChild?.getBoundingClientRect().bottom ?? 0;
      return last <= floor && safe.scrollWidth <= safe.clientWidth + 1;
    };
    const fit = () => {
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

    fit();
    let frame = 0;
    const refit = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };
    const resize = new ResizeObserver(refit);
    resize.observe(stage);
    void document.fonts?.ready.then(refit);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      safe.style.removeProperty("--ono-fit");
    };
  }, [ref, itemId, showFurigana]);
}

function partClass(
  base: string,
  active: boolean
): string {
  return active ? `${base} ${base}--active` : base;
}

export function OnomatopoeiaCard({
  item,
  activePart = null,
  jaHighlight = null,
  enHighlight = null,
  showFurigana = true,
}: Props) {
  const category = getOnomatopoeiaCategory(item.category);

  // The word's effect plays when the card appears, again each time the word
  // itself is spoken, and whenever the learner taps the word.
  const [plays, setPlays] = useState(0);
  useEffect(() => {
    if (activePart === "word") setPlays((n) => n + 1);
  }, [activePart]);
  const replay = () => setPlays((n) => n + 1);

  const safeRef = useRef<HTMLDivElement>(null);
  useOnoFit(safeRef, item.id, showFurigana);

  return (
    <div ref={safeRef} className="safe-area ono-safe card-fade">
      <div className="ono-meta">
        <span className="ono-level">{item.jlptLevel}</span>
        {category ? (
          <span className="ono-category">
            <span
              lang="ja"
              className={
                activePart === "categoryJa" ? "ono-inline ono-inline--active" : "ono-inline"
              }
            >
              {category.japanese}
            </span>
            <span aria-hidden="true"> · </span>
            <span
              lang="en"
              className={
                activePart === "categoryEn" ? "ono-inline ono-inline--active" : "ono-inline"
              }
            >
              {category.english}
            </span>
          </span>
        ) : null}
      </div>

      <div
        className={partClass("ono-word", activePart === "word")}
        lang="ja"
        onClick={replay}
        title="Tap to replay the effect"
      >
        <OnoWordFx word={item.japanese} playKey={`${item.id}-${plays}`}>
          <FuriganaWrapText
            surface={item.japanese}
            reading={item.reading}
            className="ono-jp"
            highlight={activePart === "word" ? jaHighlight : null}
            showFurigana={showFurigana}
          />
        </OnoWordFx>
      </div>
      <PitchAccentLine
        word={item.japanese}
        reading={item.reading}
        speaking={activePart === "word"}
        className="pa--card"
      />

      <div
        className={partClass("ono-meaning-wrap", activePart === "meaning")}
        aria-hidden="true"
      >
        <HighlightedEnglish
          text={item.meaning}
          className="ono-meaning"
          highlight={activePart === "meaning" ? enHighlight : null}
        />
      </div>

      <div
        className={partClass("ono-collocation", activePart === "collocation")}
        lang="ja"
      >
        {item.collocation}
      </div>
      <div className={partClass("ono-nuance", activePart === "nuance")}>
        {item.nuance}
      </div>

      <div
        className={partClass(
          "ono-example",
          activePart === "example" || activePart === "exampleEn"
        )}
      >
        <div lang="ja">
          <FuriganaWrapText
            surface={item.exampleJapanese}
            reading={item.exampleReading}
            className="ono-example-jp"
            highlight={activePart === "example" ? jaHighlight : null}
            showFurigana={showFurigana}
          />
        </div>
        <div aria-hidden="true">
          <HighlightedEnglish
            text={item.exampleEnglish}
            className="ono-example-en"
            highlight={activePart === "exampleEn" ? enHighlight : null}
          />
        </div>
      </div>
    </div>
  );
}
