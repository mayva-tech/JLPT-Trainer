import type { VocabularyItem } from "../types/vocabulary";
import type { SpeechHighlight } from "../services/speechService";
import { FuriganaWrapText } from "./FuriganaWrapText";
import { HighlightedEnglish } from "./HighlightedEnglish";
import { LessonNuance } from "./LessonNuance";
import { FitScale } from "./FitScale";

type Props = {
  item: VocabularyItem;
  jaHighlight?: SpeechHighlight | null;
  enHighlight?: SpeechHighlight | null;
  nuanceHighlight?: SpeechHighlight | null;
  nuanceActive?: boolean;
  showFurigana?: boolean;
  /** English meaning held back until the Japanese is spoken. */
  meaningHidden?: boolean;
  /** Nuance held back until the slow pass with furigana is over. */
  nuanceHidden?: boolean;
};

export function SentenceCard({
  item,
  jaHighlight = null,
  enHighlight = null,
  nuanceHighlight = null,
  nuanceActive = false,
  showFurigana = true,
  meaningHidden = false,
  nuanceHidden = false,
}: Props) {
  return (
    <div className="safe-area card-fade">
      <div lang="ja">
        <FitScale
          maxLines={2}
          watch={`${item.sentence}|${item.sentenceReading}|${showFurigana}`}
        >
          <FuriganaWrapText
            surface={item.sentence}
            reading={item.sentenceReading}
            className="sentence-main"
            highlight={jaHighlight}
            showFurigana={showFurigana}
          />
        </FitScale>
      </div>
      <div
        aria-hidden="true"
        className={meaningHidden ? "meaning-reveal meaning-reveal--hidden" : "meaning-reveal"}
      >
        <FitScale maxLines={1} watch={item.sentenceMeaning}>
          <HighlightedEnglish
            text={item.sentenceMeaning}
            className="sentence-meaning"
            highlight={enHighlight}
          />
        </FitScale>
      </div>
      <LessonNuance
        note={item.sentenceNuance}
        active={nuanceActive}
        highlight={nuanceHighlight}
        pending={nuanceHidden}
      />
    </div>
  );
}
