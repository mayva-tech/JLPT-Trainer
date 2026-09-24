import { FuriganaWrapText } from "../../../components/FuriganaWrapText";
import { HighlightedEnglish } from "../../../components/HighlightedEnglish";
import type { SpeechHighlight } from "../../../services/speechService";
import type { RelatedWord } from "../../../types/wordRelation";

interface Props {
  word: RelatedWord;
  small?: boolean;
  activeJp?: boolean;
  activeEn?: boolean;
  highlight?: SpeechHighlight | null;
}

export function RelationWord({
  word,
  small = false,
  activeJp = false,
  activeEn = false,
  highlight = null,
}: Props) {
  const jpHighlight = activeJp ? highlight : null;
  const enHighlight = activeEn ? highlight : null;

  return (
    <div className={small ? "rt-word rt-word--small" : "rt-word"}>
      <div className="rt-word-head">
        <FuriganaWrapText
          surface={word.japanese}
          reading={word.reading}
          className={
            activeJp ? "rt-word-jp rt-word-jp--active" : "rt-word-jp"
          }
          highlight={jpHighlight}
          showFurigana
          reserveReadingSpace
        />
      </div>
      <div
        className={
          activeEn ? "rt-word-meaning rt-word-meaning--active" : "rt-word-meaning"
        }
      >
        <HighlightedEnglish
          text={word.meaning}
          className="rt-word-meaning-text"
          highlight={enHighlight}
          inline
        />
      </div>
      <div className="rt-word-pos">{word.partOfSpeech}</div>
    </div>
  );
}
