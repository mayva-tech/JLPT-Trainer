import { useEffect, useState } from "react";
import type { OnomatopoeiaItem, OnomatopoeiaPart } from "../types/onomatopoeia";
import type { SpeechHighlight } from "../services/speechService";
import { getOnomatopoeiaCategory } from "../data/onomatopoeia";
import { FuriganaWrapText } from "./FuriganaWrapText";
import { HighlightedEnglish } from "./HighlightedEnglish";
import { OnoWordFx } from "./OnoFx/OnoWordFx";
import { PitchAccentLine } from "./PitchAccent/PitchAccentLine";

export type { OnomatopoeiaPart };

type Props = {
  item: OnomatopoeiaItem;
  activePart?: OnomatopoeiaPart | null;
  jaHighlight?: SpeechHighlight | null;
  enHighlight?: SpeechHighlight | null;
  showFurigana?: boolean;
};

function partClass(
  base: string,
  active: boolean
): string {
  return active ? `${base} ${base}--active` : base;
}

export function OnomatopoeiaCard({
  item,
  activePart = null,
  jaHighlight = null,
  enHighlight = null,
  showFurigana = true,
}: Props) {
  const category = getOnomatopoeiaCategory(item.category);

  // The word's effect plays when the card appears, again each time the word
  // itself is spoken, and whenever the learner taps the word.
  const [plays, setPlays] = useState(0);
  useEffect(() => {
    if (activePart === "word") setPlays((n) => n + 1);
  }, [activePart]);
  const replay = () => setPlays((n) => n + 1);

  return (
    <div className="safe-area ono-safe card-fade">
      <div className="ono-meta">
        <span className="ono-level">{item.jlptLevel}</span>
        {category ? (
          <span className="ono-category">
            <span
              lang="ja"
              className={
                activePart === "categoryJa" ? "ono-inline ono-inline--active" : "ono-inline"
              }
            >
              {category.japanese}
            </span>
            <span aria-hidden="true"> · </span>
            <span
              lang="en"
              className={
                activePart === "categoryEn" ? "ono-inline ono-inline--active" : "ono-inline"
              }
            >
              {category.english}
            </span>
          </span>
        ) : null}
      </div>

      <div
        className={partClass("ono-word", activePart === "word")}
        lang="ja"
        onClick={replay}
        title="Tap to replay the effect"
      >
        <OnoWordFx word={item.japanese} playKey={`${item.id}-${plays}`}>
          <FuriganaWrapText
            surface={item.japanese}
            reading={item.reading}
            className="ono-jp"
            highlight={activePart === "word" ? jaHighlight : null}
            showFurigana={showFurigana}
          />
        </OnoWordFx>
      </div>
      <PitchAccentLine
        word={item.japanese}
        reading={item.reading}
        speaking={activePart === "word"}
        className="pa--card"
      />

      <div
        className={partClass("ono-meaning-wrap", activePart === "meaning")}
        aria-hidden="true"
      >
        <HighlightedEnglish
          text={item.meaning}
          className="ono-meaning"
          highlight={activePart === "meaning" ? enHighlight : null}
        />
      </div>

      <div
        className={partClass("ono-collocation", activePart === "collocation")}
        lang="ja"
      >
        {item.collocation}
      </div>
      <div className={partClass("ono-nuance", activePart === "nuance")}>
        {item.nuance}
      </div>

      <div
        className={partClass(
          "ono-example",
          activePart === "example" || activePart === "exampleEn"
        )}
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
