import type { VocabularyItem } from "../types/vocabulary";
import type { SpeechHighlight } from "../services/speechService";
import { HighlightedEnglish } from "./HighlightedEnglish";
import { LessonNuance } from "./LessonNuance";
import { FuriganaWrapText } from "./FuriganaWrapText";
import { JlptLevelBadge } from "./JlptLevelBadge";

type Props = {
  item: VocabularyItem;
  jaHighlight?: SpeechHighlight | null;
  enHighlight?: SpeechHighlight | null;
  nuanceHighlight?: SpeechHighlight | null;
  nuanceActive?: boolean;
  showFurigana?: boolean;
};

export function WordCard({
  item,
  jaHighlight = null,
  enHighlight = null,
  nuanceHighlight = null,
  nuanceActive = false,
  showFurigana = true,
}: Props) {
  return (
    <div className="safe-area card-fade">
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
