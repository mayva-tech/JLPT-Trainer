import type { GrammarItem } from "../types/grammar";
import type { SpeechHighlight } from "../services/speechService";
import { FuriganaWrapText } from "./FuriganaWrapText";
import { FitScale } from "./FitScale";

type Props = {
  item: GrammarItem;
  phase: "listen" | "repeat";
  highlight?: SpeechHighlight | null;
  showFurigana?: boolean;
};

/** ⑤ Shadowing — listen then repeat the example sentence. */
export function GrammarShadowingCard({
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
      <FitScale
        maxLines={2}
        watch={`${item.sentence}|${item.sentenceReading}|${showFurigana}|${phase}`}
      >
        <FuriganaWrapText
          surface={item.sentence}
          reading={item.sentenceReading}
          className="shadowing-phrase"
          highlight={highlight}
          showFurigana={showFurigana}
        />
      </FitScale>
      {phase === "repeat" && (
        <div className="shadowing-ellipsis" aria-hidden="true">
          ・・・
        </div>
      )}
    </div>
  );
}
