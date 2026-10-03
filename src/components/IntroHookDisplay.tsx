import { HighlightedEnglish } from "./HighlightedEnglish";
import { HighlightedJapanese } from "./HighlightedJapanese";
import type { SpeechHighlight } from "../services/speechService";

type Props = {
  english: string;
  japanese: string;
  activeLang: "en" | "ja" | null;
  enHighlight: SpeechHighlight | null;
  jaHighlight: SpeechHighlight | null;
};

/** Stage display for the bilingual intro hook (EN then JA). */
export function IntroHookDisplay({
  english,
  japanese,
  activeLang,
  enHighlight,
  jaHighlight,
}: Props) {
  return (
    <div className="safe-area safe-area--hook">
      <div className="hook-display card-fade">
        <div className="category-chip">Intro Hook</div>
        <HighlightedEnglish
          text={english}
          className={
            activeLang === "en"
              ? "hook-line hook-line--en hook-line--active"
              : "hook-line hook-line--en"
          }
          highlight={enHighlight}
        />
        <HighlightedJapanese
          text={japanese}
          className={
            activeLang === "ja"
              ? "hook-line hook-line--ja hook-line--active"
              : "hook-line hook-line--ja"
          }
          highlight={jaHighlight}
        />
        {/* Required by Kanjium's CC BY-SA 4.0 licence (pitch-accent data). */}
        <p className="hook-credit">
          Pitch accent notation provided by Uros O. through his free database Kanjium (CC BY-SA 4.0).
        </p>
      </div>
    </div>
  );
}
