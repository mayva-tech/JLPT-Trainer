import { useLayoutEffect, useRef } from "react";
import type { RegisterPair } from "../types/register";
import type { SpeechHighlight } from "../services/speechService";
import { FitScale } from "./FitScale";
import { FuriganaWrapText } from "./FuriganaWrapText";
import { HighlightedEnglish } from "./HighlightedEnglish";
import type { ReadHookState } from "../services/autoModeRunner";
import { POLITE_HOOK_EN, POLITE_HOOK_JA } from "../utils/registerRetention";
import { registerIcon } from "../utils/registerIcon";
import { NUANCE_FOCUS_CLASS, NuanceFocus } from "./NuanceFocus";
import "./Retention/retention.css";

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
  /** Karaoke offsets into the whole note (mixed JA/EN, Player nuance rule). */
  noteHighlight?: SpeechHighlight | null;
  /**
   * "Can you say it politely?" hook (Play All): the formal side keeps its
   * space but stays hidden behind the banner and countdown ring.
   */
  hook?: ReadHookState | null;
  /** Note held back while Play runs, until the slow passes with furigana are over. */
  noteHidden?: boolean;
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
  // Stacked (portrait) columns are short: two lines must also fit the slot.
  const slot = jp.closest<HTMLElement>(".register-jp-slot");
  if (slot && jp.scrollHeight > slot.clientHeight + 1) return true;
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
  noteHighlight = null,
  hook = null,
  noteHidden = false,
}: Props) {
  const splitRef = useRef<HTMLDivElement>(null);
  const icon = registerIcon(pair);
  /** The note is being explained: the card steps back, the note comes forward. */
  const noteFocus =
    Boolean(pair.note) && !formalHidden && !noteHidden && activeSide === "note";

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
    <div
      className={[
        "safe-area register-safe register-safe--enter card-fade",
        hook ? "register-safe--hook" : "",
        noteFocus ? NUANCE_FOCUS_CLASS : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={
          activeSide === "meaning"
            ? "register-meaning register-meaning--active"
            : "register-meaning"
        }
        aria-hidden="true"
        data-head-avoid
      >
        <span className={`register-icon register-icon--${icon.motion}`}>{icon.emoji}</span>
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
          data-head-seats
        >
          <div className="register-label register-label--casual" data-head-avoid>
            Casual
          </div>
          <div lang="ja" className="register-jp-slot">
            <div className="register-jp-box" data-head-avoid data-head-word>
              <FuriganaWrapText
                surface={pair.casual.text}
                reading={pair.casual.reading}
                className="register-jp"
                highlight={activeSide === "casual" ? jaHighlight : null}
                showFurigana={showFurigana}
              />
            </div>
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
            hook ? "register-col--hook" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="register-label register-label--formal" data-head-avoid>
            Formal
          </div>
          {hook ? (
            <div className="register-hook-banner" aria-live="polite" data-head-avoid>
              <span className="ret-hook-en">{POLITE_HOOK_EN}</span>
              <span className="ret-hook-ja" lang="ja">
                {POLITE_HOOK_JA}
              </span>
              {hook.ms > 0 ? (
                <span
                  key={hook.key}
                  className="ret-ring"
                  style={{ animationDuration: `${hook.ms}ms` }}
                  aria-hidden="true"
                />
              ) : null}
            </div>
          ) : null}
          {formalHidden ? (
            <div className="register-hidden-cue">
              Press Reveal to show the formal form
            </div>
          ) : (
            <>
              {/* Keyed on the hook so the reveal after "Can you say it politely?"
                  types the formal form in, like the opening of the card. */}
              <div lang="ja" className="register-jp-slot" key={hook ? "hook" : "shown"}>
                <div className="register-jp-box" data-head-avoid>
                  <FuriganaWrapText
                    surface={pair.formal.text}
                    reading={pair.formal.reading}
                    className="register-jp"
                    highlight={activeSide === "formal" ? jaHighlight : null}
                    showFurigana={showFurigana}
                  />
                </div>
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
          className={[
            "lesson-nuance register-note meaning-reveal",
            activeSide === "note" ? "lesson-nuance--active" : "",
            noteFocus ? "lesson-nuance--held" : "",
            noteHidden ? "meaning-reveal--hidden" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span className="lesson-nuance-label">Nuance</span>
          <HighlightedEnglish
            text={pair.note}
            className="lesson-nuance-body"
            highlight={activeSide === "note" && !noteFocus ? noteHighlight : null}
            jpWordBreaks
            readingGlosses
          />
        </div>
      ) : null}
      {noteFocus && pair.note ? <NuanceFocus text={pair.note} highlight={noteHighlight} /> : null}
    </div>
  );
}
