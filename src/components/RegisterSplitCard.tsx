import type { RegisterPair } from "../types/register";
import type { SpeechHighlight } from "../services/speechService";
import { FuriganaWrapText } from "./FuriganaWrapText";

export type RegisterSideName = "casual" | "formal";

type Props = {
  pair: RegisterPair;
  /** Side currently being spoken, for the karaoke highlight and dimming. */
  activeSide?: RegisterSideName | null;
  jaHighlight?: SpeechHighlight | null;
  showFurigana?: boolean;
  showRomaji?: boolean;
  /** Hide the formal column until revealed — turns the card into a drill. */
  formalHidden?: boolean;
};

/**
 * Two-column register comparison: casual left, formal right.
 * Same meaning on both sides, so the only variable on screen is politeness.
 */
export function RegisterSplitCard({
  pair,
  activeSide = null,
  jaHighlight = null,
  showFurigana = true,
  showRomaji = true,
  formalHidden = false,
}: Props) {
  return (
    <div className="safe-area register-safe card-fade">
      <div className="register-meaning">{pair.meaning}</div>

      <div className="register-split">
        <div
          className={
            activeSide === "casual"
              ? "register-col register-col--casual register-col--active"
              : "register-col register-col--casual"
          }
        >
          <div className="register-label register-label--casual">Casual</div>
          <div lang="ja">
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
              <div lang="ja">
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
        <div className="register-note">{pair.note}</div>
      ) : null}
    </div>
  );
}
