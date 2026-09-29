import type { GrammarItem } from "../types/grammar";
import type { SpeechHighlight } from "../services/speechService";
import { FuriganaWrapText } from "./FuriganaWrapText";
import { HighlightedEnglish } from "./HighlightedEnglish";
import { LessonNuance } from "./LessonNuance";

type Props = {
  item: GrammarItem;
  showFurigana?: boolean;
  jaHighlight?: SpeechHighlight | null;
  enHighlight?: SpeechHighlight | null;
  nuanceHighlight?: SpeechHighlight | null;
  nuanceActive?: boolean;
};

/** ② Grammar pattern + kanji furigana + meaning. */
export function GrammarPatternCard({
  item,
  showFurigana = true,
  jaHighlight = null,
  enHighlight = null,
  nuanceHighlight = null,
  nuanceActive = false,
}: Props) {
  return (
    <div className="safe-area card-fade">
      <div lang="ja">
        <FuriganaWrapText
          surface={item.pattern}
          reading={item.patternReading}
          className="grammar-pattern"
          highlight={jaHighlight}
          showFurigana={showFurigana}
        />
      </div>
      <div aria-hidden="true">
        <HighlightedEnglish
          text={item.meaning}
          className="grammar-meaning"
          highlight={enHighlight}
        />
      </div>
      <LessonNuance
        note={item.nuance}
        active={nuanceActive}
        highlight={nuanceHighlight}
      />
    </div>
  );
}
