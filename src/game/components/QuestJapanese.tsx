import { FuriganaWrapText } from "../../components/FuriganaWrapText";
import { HighlightedJapanese } from "../../components/HighlightedJapanese";
import type { SpeechHighlight } from "../../services/speechService";

type Props = {
  text: string;
  reading?: string | null;
  className: string;
  highlight?: SpeechHighlight | null;
  showFurigana?: boolean;
  /** Inline tip/choice spans — avoid block flex centering. */
  inline?: boolean;
};

/**
 * Quest JA line: optional furigana above kanji when a reading is available.
 */
export function QuestJapanese({
  text,
  reading,
  className,
  highlight = null,
  showFurigana = false,
  inline = false,
}: Props) {
  const trimmedReading = reading?.trim() ?? "";
  if (showFurigana && trimmedReading) {
    return (
      <FuriganaWrapText
        surface={text}
        reading={trimmedReading}
        className={className}
        highlight={highlight}
        showFurigana
      />
    );
  }
  return (
    <HighlightedJapanese
      text={text}
      className={className}
      highlight={highlight}
      inline={inline}
    />
  );
}
