import type { VocabularyItem } from "../types/vocabulary";
import type { SpeechHighlight } from "../services/speechService";
import { FuriganaWrapText } from "./FuriganaWrapText";

type Props = {
  item: VocabularyItem;
  phase: "listen" | "repeat";
  highlight?: SpeechHighlight | null;
  showFurigana?: boolean;
};

/** Shadowing uses the same sentence text + wrap rules as the Sentence step. */
export function ShadowingCard({
  item,
  phase,
  highlight = null,
  showFurigana = false,
}: Props) {
  return (
    <div className="safe-area card-fade" key={phase}>
      <div className="shadowing-cue" aria-hidden="true">
        {phase === "listen" ? "Listen..." : "Repeat..."}
      </div>
      <FuriganaWrapText
        surface={item.sentence}
        reading={item.sentenceReading}
        className="shadowing-phrase"
        highlight={highlight}
        showFurigana={showFurigana}
      />
      {phase === "repeat" && (
        <div className="shadowing-ellipsis" aria-hidden="true">
          ・・・
        </div>
      )}
    </div>
  );
}
