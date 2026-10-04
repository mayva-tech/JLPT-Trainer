import type { VocabularyItem } from "../types/vocabulary";
import type { SpeechHighlight } from "../services/speechService";
import { HighlightedEnglish } from "./HighlightedEnglish";
import { LessonNuance } from "./LessonNuance";
import { FuriganaWrapText } from "./FuriganaWrapText";
import { JlptLevelBadge } from "./JlptLevelBadge";
import { PitchAccentLine } from "./PitchAccent/PitchAccentLine";
import { Illustration } from "./Illustration/Illustration";
import { vocabPicture } from "./Illustration/pictures";

type Props = {
  item: VocabularyItem;
  jaHighlight?: SpeechHighlight | null;
  enHighlight?: SpeechHighlight | null;
  nuanceHighlight?: SpeechHighlight | null;
  nuanceActive?: boolean;
  showFurigana?: boolean;
  /** Small animated picture of the word above it (player "絵" setting). */
  showPicture?: boolean;
};

export function WordCard({
  item,
  jaHighlight = null,
  enHighlight = null,
  nuanceHighlight = null,
  nuanceActive = false,
  showFurigana = true,
  showPicture = false,
}: Props) {
  return (
    <div className="safe-area card-fade">
      {showPicture && <Illustration picture={vocabPicture(item.id)} className="lesson-picture" />}
      <div className="word-headline">
        <FuriganaWrapText
          surface={item.word}
          reading={item.reading}
          className="word-main"
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
      />
      <div aria-hidden="true">
        <HighlightedEnglish
          text={item.meaning}
          className="word-meaning"
          highlight={enHighlight}
        />
      </div>
      <LessonNuance
        note={item.wordNuance}
        active={nuanceActive}
        highlight={nuanceHighlight}
      />
    </div>
  );
}
