import { HighlightedEnglish } from "./HighlightedEnglish";
import { HighlightedJapanese } from "./HighlightedJapanese";
import type { SpeechHighlight } from "../services/speechService";

type Props = {
  japanese: string;
  english: string;
  activeLang: "ja" | "en" | null;
  jaHighlight: SpeechHighlight | null;
  enHighlight: SpeechHighlight | null;
};

/** Stage display for the bilingual ending CTA (JA then EN). */
export function EndingCtaDisplay({
  japanese,
  english,
  activeLang,
  jaHighlight,
  enHighlight,
}: Props) {
  return (
    <div className="safe-area safe-area--hook">
      <div className="hook-display card-fade">
        <div className="category-chip">Ending CTA</div>
        <HighlightedJapanese
          text={japanese}
          className={
            activeLang === "ja"
              ? "hook-line hook-line--ja hook-line--active"
              : "hook-line hook-line--ja"
          }
          highlight={jaHighlight}
        />
        <HighlightedEnglish
          text={english}
          className={
            activeLang === "en"
              ? "hook-line hook-line--en hook-line--active"
              : "hook-line hook-line--en"
          }
          highlight={enHighlight}
        />
      </div>
    </div>
  );
}
