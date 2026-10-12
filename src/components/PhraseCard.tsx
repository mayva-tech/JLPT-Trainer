import type { VocabularyItem } from "../types/vocabulary";
import type { SpeechHighlight } from "../services/speechService";
import { FuriganaWrapText } from "./FuriganaWrapText";
import { HighlightedEnglish } from "./HighlightedEnglish";
import { LessonNuance } from "./LessonNuance";
import { PhrasePitchLine } from "./PitchAccent/PitchAccentLine";

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

export function PhraseCard({
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
        <FuriganaWrapText
          surface={item.phrase}
          reading={item.phraseReading}
          className="phrase-main"
          highlight={jaHighlight}
          showFurigana={showFurigana}
        />
      </div>
      <PhrasePitchLine
        phrase={item.phrase}
        reading={item.phraseReading}
        speaking={jaHighlight != null}
        className="pa--card"
      />
      <div
        aria-hidden="true"
        className={meaningHidden ? "meaning-reveal meaning-reveal--hidden" : "meaning-reveal"}
      >
        <HighlightedEnglish
          text={item.phraseMeaning}
          className="phrase-meaning"
          highlight={enHighlight}
        />
      </div>
      <LessonNuance
        note={item.phraseNuance}
        active={nuanceActive}
        highlight={nuanceHighlight}
        pending={nuanceHidden}
      />
    </div>
  );
}
