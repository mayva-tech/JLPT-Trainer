import type { OnomatopoeiaItem } from "../types/onomatopoeia";
import type { SpeechHighlight } from "../services/speechService";
import { getOnomatopoeiaCategory } from "../data/onomatopoeia";
import { FuriganaWrapText } from "./FuriganaWrapText";
import { HighlightedEnglish } from "./HighlightedEnglish";

export type OnomatopoeiaPart = "word" | "meaning" | "example" | "exampleEn";

type Props = {
  item: OnomatopoeiaItem;
  activePart?: OnomatopoeiaPart | null;
  jaHighlight?: SpeechHighlight | null;
  enHighlight?: SpeechHighlight | null;
  showFurigana?: boolean;
};

export function OnomatopoeiaCard({
  item,
  activePart = null,
  jaHighlight = null,
  enHighlight = null,
  showFurigana = true,
}: Props) {
  const category = getOnomatopoeiaCategory(item.category);

  return (
    <div className="safe-area ono-safe card-fade">
      <div className="ono-meta">
        <span className="ono-level">{item.jlptLevel}</span>
        {category ? (
          <span className="ono-category">
            {category.japanese} · {category.english}
          </span>
        ) : null}
      </div>

      <div
        className={
          activePart === "word" ? "ono-word ono-word--active" : "ono-word"
        }
        lang="ja"
      >
        <FuriganaWrapText
          surface={item.japanese}
          reading={item.reading}
          className="ono-jp"
          highlight={activePart === "word" ? jaHighlight : null}
          showFurigana={showFurigana}
        />
      </div>

      <div aria-hidden="true">
        <HighlightedEnglish
          text={item.meaning}
          className="ono-meaning"
          highlight={activePart === "meaning" ? enHighlight : null}
        />
      </div>

      <div className="ono-collocation" lang="ja">
        {item.collocation}
      </div>
      <div className="ono-nuance">{item.nuance}</div>

      <div
        className={
          activePart === "example" || activePart === "exampleEn"
            ? "ono-example ono-example--active"
            : "ono-example"
        }
      >
        <div lang="ja">
          <FuriganaWrapText
            surface={item.exampleJapanese}
            reading={item.exampleReading}
            className="ono-example-jp"
            highlight={activePart === "example" ? jaHighlight : null}
            showFurigana={showFurigana}
          />
        </div>
        <div aria-hidden="true">
          <HighlightedEnglish
            text={item.exampleEnglish}
            className="ono-example-en"
            highlight={activePart === "exampleEn" ? enHighlight : null}
          />
        </div>
      </div>
    </div>
  );
}
