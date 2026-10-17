import type { VocabularyItem } from "../types/vocabulary";
import type { SpeechHighlight } from "../services/speechService";
import { HighlightedEnglish } from "./HighlightedEnglish";
import { FuriganaWrapText } from "./FuriganaWrapText";
import { JlptLevelBadge } from "./JlptLevelBadge";
import { PitchAccentLine, type PitchReveal } from "./PitchAccent/PitchAccentLine";

type Props = {
  item: VocabularyItem;
  jaHighlight?: SpeechHighlight | null;
  enHighlight?: SpeechHighlight | null;
  showFurigana?: boolean;
  /** Pitch line held back until Nanami reads the word. */
  pitchReveal?: PitchReveal | null;
};

export function ReviewCard({
  item,
  jaHighlight = null,
  enHighlight = null,
  showFurigana = true,
  pitchReveal = null,
}: Props) {
  return (
    <div className="safe-area card-fade">
      <div className="word-headline">
        <FuriganaWrapText
          surface={item.word}
          reading={item.reading}
          className="review-word"
          highlight={jaHighlight}
          showFurigana={showFurigana}
        />
        <JlptLevelBadge level={item.jlpt} />
      </div>
      <PitchAccentLine
        word={item.word}
        reading={item.reading}
        speaking={jaHighlight != null}
        className="pa--card"
        reveal={pitchReveal}
      />
      <div aria-hidden="true">
        <HighlightedEnglish
          text={item.meaning}
          className="review-meaning"
          highlight={enHighlight}
        />
      </div>
    </div>
  );
}
