import { FuriganaWrapText } from "../../../components/FuriganaWrapText";
import { HighlightedEnglish } from "../../../components/HighlightedEnglish";
import type { SpeechHighlight } from "../../../services/speechService";
import type { RelationExample } from "../../../types/wordRelation";
import type { RelationPlayPart } from "../relationPlayback";

interface Props {
  example: RelationExample;
  activePart: RelationPlayPart | null;
  highlight: SpeechHighlight | null;
}

export function RelationExampleBlock({ example, activePart, highlight }: Props) {
  const activeJp = activePart === "example-jp";
  const activeEn = activePart === "example-en";

  return (
    <div
      className={
        activeJp || activeEn ? "rt-example rt-example--active" : "rt-example"
      }
    >
      <span className="rt-example-label">Example</span>
      <FuriganaWrapText
        surface={example.japanese}
        reading={example.reading}
        className={activeJp ? "rt-example-jp rt-example-jp--active" : "rt-example-jp"}
        highlight={activeJp ? highlight : null}
        showFurigana
      />
      <HighlightedEnglish
        text={example.english}
        className={activeEn ? "rt-example-en rt-example-en--active" : "rt-example-en"}
        highlight={activeEn ? highlight : null}
      />
    </div>
  );
}
