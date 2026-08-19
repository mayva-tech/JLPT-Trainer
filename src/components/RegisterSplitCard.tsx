import { useLayoutEffect, useRef } from "react";
import type { RegisterPair } from "../types/register";
import type { SpeechHighlight } from "../services/speechService";
import { FitScale } from "./FitScale";
import { FuriganaWrapText } from "./FuriganaWrapText";
import { HighlightedEnglish } from "./HighlightedEnglish";

export type RegisterSideName = "casual" | "formal";
export type RegisterPlayPart = RegisterSideName | "meaning" | "note";

type Props = {
  pair: RegisterPair;
  /** Side currently being spoken, for the karaoke highlight and dimming. */
  activeSide?: RegisterPlayPart | null;
  jaHighlight?: SpeechHighlight | null;
  enHighlight?: SpeechHighlight | null;
  showFurigana?: boolean;
  showRomaji?: boolean;
  /** Hide the formal column until revealed — turns the card into a drill. */
  formalHidden?: boolean;
};

function countJpWordLines(root: HTMLElement): number {
  const words = root.querySelectorAll<HTMLElement>(".jp-word");
  if (words.length === 0) return 1;
  let lines = 0;
  let lastTop = Number.NaN;
  words.forEach((word) => {
    if (word.offsetTop !== lastTop) {
      lines += 1;
      lastTop = word.offsetTop;
    }
  });
  return Math.max(1, lines);
}

function jpColumnOverflows(jp: HTMLElement, maxLines: number): boolean {
  if (countJpWordLines(jp) > maxLines) return true;
  const cap = jp.clientWidth;
  for (const word of jp.querySelectorAll<HTMLElement>(".jp-word")) {
    if (word.scrollWidth > cap + 1) return true;
  }
  return false;
}

/** Shared size for both phrases; wrap at word units before shrinking. */
function fitSharedRegisterJp(split: HTMLElement) {
  split.style.setProperty("--fit-scale", "1");
  void split.offsetHeight;

  const columns = [
    ...split.querySelectorAll<HTMLElement>(".register-jp"),
  ];
  const overflows = () =>
    columns.some((column) => jpColumnOverflows(column, 2));
  if (!overflows()) return;

  let lo = 0.42;
  let hi = 1;
  for (let i = 0; i < 16; i++) {
    const mid = (lo + hi) / 2;
    split.style.setProperty("--fit-scale", String(mid));
    void split.offsetHeight;
    if (overflows()) hi = mid;
    else lo = mid;
  }
  split.style.setProperty("--fit-scale", String(lo));
}

/**
 * Two-column register comparison: casual left, formal right.
 * Same meaning on both sides, so the only variable on screen is politeness.
 */
export function RegisterSplitCard({
  pair,
  activeSide = null,
  jaHighlight = null,
  enHighlight = null,
  showFurigana = true,
  showRomaji = true,
  formalHidden = false,
}: Props) {
  const splitRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const split = splitRef.current;
    if (!split) return;

    const fit = () => fitSharedRegisterJp(split);
    fit();

    const ro = new ResizeObserver(fit);
    ro.observe(split);
    const stage = split.closest(".stage");
    if (stage) ro.observe(stage);
    return () => ro.disconnect();
  }, [
    pair.casual.text,
    pair.formal.text,
    showFurigana,
    formalHidden,
  ]);

  return (
    <div className="safe-area register-safe card-fade">
      <div
        className={
          activeSide === "meaning"
            ? "register-meaning register-meaning--active"
            : "register-meaning"
        }
        aria-hidden="true"
      >
        <FitScale maxLines={1} watch={pair.meaning} minScale={0.68}>
          <HighlightedEnglish
            text={pair.meaning}
            className="register-meaning-text"
            highlight={activeSide === "meaning" ? enHighlight : null}
          />
        </FitScale>
      </div>

      <div ref={splitRef} className="register-split">
        <div
          className={
            activeSide === "casual"
              ? "register-col register-col--casual register-col--active"
              : "register-col register-col--casual"
          }
        >
          <div className="register-label register-label--casual">Casual</div>
          <div lang="ja" className="register-jp-slot">
            <FuriganaWrapText
              surface={pair.casual.text}
              reading={pair.casual.reading}
              className="register-jp"
              highlight={activeSide === "casual" ? jaHighlight : null}
              showFurigana={showFurigana}
            />
          </div>
          {showRomaji ? (
            <div className="register-romaji" aria-hidden="true">
              {pair.casual.romaji}
            </div>
          ) : null}
        </div>

        <div className="register-divider" aria-hidden="true" />

        <div
          className={[
            "register-col",
            "register-col--formal",
            activeSide === "formal" ? "register-col--active" : "",
            formalHidden ? "register-col--hidden" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="register-label register-label--formal">Formal</div>
          {formalHidden ? (
            <div className="register-hidden-cue">
              Press Reveal to show the formal form
            </div>
          ) : (
            <>
              <div lang="ja" className="register-jp-slot">
                <FuriganaWrapText
                  surface={pair.formal.text}
                  reading={pair.formal.reading}
                  className="register-jp"
                  highlight={activeSide === "formal" ? jaHighlight : null}
                  showFurigana={showFurigana}
                />
              </div>
              {showRomaji ? (
                <div className="register-romaji" aria-hidden="true">
                  {pair.formal.romaji}
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      {pair.note && !formalHidden ? (
        <div
          className={
            activeSide === "note"
              ? "register-note register-note--active"
              : "register-note"
          }
        >
          {pair.note}
        </div>
      ) : null}
    </div>
  );
}
