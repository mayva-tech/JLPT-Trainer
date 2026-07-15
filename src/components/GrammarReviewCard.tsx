import type { GrammarItem } from "../types/grammar";
import type { SpeechHighlight } from "../services/speechService";
import { HighlightedJapanese } from "./HighlightedJapanese";
import { HighlightedEnglish } from "./HighlightedEnglish";

type Props = {
  item: GrammarItem;
  jaHighlight?: SpeechHighlight | null;
  enHighlight?: SpeechHighlight | null;
};

/** ⑥ Review — pattern + meaning recap. */
export function GrammarReviewCard({
  item,
  jaHighlight = null,
  enHighlight = null,
}: Props) {
  return (
    <div className="safe-area card-fade">
      <HighlightedJapanese
        text={item.pattern}
        className="grammar-pattern grammar-pattern--review"
        highlight={jaHighlight}
      />
      <div aria-hidden="true">
        <HighlightedEnglish
          text={item.meaning}
          className="grammar-meaning grammar-meaning--review"
          highlight={enHighlight}
        />
      </div>
    </div>
  );
}
