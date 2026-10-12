import type { GrammarItem } from "../types/grammar";
import type { SpeechHighlight } from "../services/speechService";
import { FuriganaWrapText } from "./FuriganaWrapText";
import { HighlightedEnglish } from "./HighlightedEnglish";
import { LessonNuance } from "./LessonNuance";
import { Illustration } from "./Illustration/Illustration";
import { grammarPicture } from "./Illustration/pictures";

type Props = {
  item: GrammarItem;
  showFurigana?: boolean;
  jaHighlight?: SpeechHighlight | null;
  enHighlight?: SpeechHighlight | null;
  nuanceHighlight?: SpeechHighlight | null;
  nuanceActive?: boolean;
  /** Small animated picture of the pattern's function (player "絵" setting). */
  showPicture?: boolean;
  /** Nuance held back until the slow pass with furigana is over. */
  nuanceHidden?: boolean;
};

/** ② Grammar pattern + kanji furigana + meaning. */
export function GrammarPatternCard({
  item,
  showFurigana = true,
  jaHighlight = null,
  enHighlight = null,
  nuanceHighlight = null,
  nuanceActive = false,
  showPicture = false,
  nuanceHidden = false,
}: Props) {
  return (
    <div className="safe-area card-fade">
      {showPicture && <Illustration picture={grammarPicture(item.id)} className="lesson-picture" />}
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
        pending={nuanceHidden}
      />
    </div>
  );
}
