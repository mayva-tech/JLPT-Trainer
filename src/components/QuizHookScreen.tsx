import { HighlightedJapanese } from "./HighlightedJapanese";
import { HighlightedEnglish } from "./HighlightedEnglish";
import type { SpeechHighlight } from "../services/speechService";

type Props = {
  phase: "pre" | "after";
  japanese: string;
  english: string;
  jaHighlight: SpeechHighlight | null;
  enHighlight: SpeechHighlight | null;
  commentActiveLang?: "ja" | "en" | null;
};

/** Pre/after quiz comment hook screen. */
export function QuizHookScreen({
  phase,
  japanese,
  english,
  jaHighlight,
  enHighlight,
  commentActiveLang = null,
}: Props) {
  const chip = phase === "pre" ? "Pre Quiz" : "After Quiz";
  return (
    <div className="safe-area safe-area--hook">
      <div className="hook-display card-fade">
        <div className="category-chip">{chip}</div>
        <HighlightedJapanese
          text={japanese}
          className={
            commentActiveLang === "ja"
              ? "hook-line hook-line--ja hook-line--active"
              : "hook-line hook-line--ja"
          }
          highlight={commentActiveLang === "ja" ? jaHighlight : null}
        />
        <HighlightedEnglish
          text={english}
          className={
            commentActiveLang === "en"
              ? "hook-line hook-line--en hook-line--active"
              : "hook-line hook-line--en"
          }
          highlight={commentActiveLang === "en" ? enHighlight : null}
        />
      </div>
    </div>
  );
}
