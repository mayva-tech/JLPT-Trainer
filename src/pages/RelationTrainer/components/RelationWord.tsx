import { FuriganaWrapText } from "../../../components/FuriganaWrapText";
import type { RelatedWord } from "../../../types/wordRelation";

interface Props {
  word: RelatedWord;
  small?: boolean;
  activeJp?: boolean;
  activeEn?: boolean;
}

export function RelationWord({
  word,
  small = false,
  activeJp = false,
  activeEn = false,
}: Props) {
  return (
    <div className={small ? "rt-word rt-word--small" : "rt-word"}>
      <div className="rt-word-head">
        <FuriganaWrapText
          surface={word.japanese}
          reading={word.reading}
          className={
            activeJp ? "rt-word-jp rt-word-jp--active" : "rt-word-jp"
          }
          showFurigana
          reserveReadingSpace
        />
      </div>
      <div
        className={
          activeEn ? "rt-word-meaning rt-word-meaning--active" : "rt-word-meaning"
        }
      >
        {word.meaning}
      </div>
      <div className="rt-word-pos">{word.partOfSpeech}</div>
    </div>
  );
}
