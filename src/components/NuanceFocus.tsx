import type { SpeechHighlight } from "../services/speechService";
import { HighlightedEnglish } from "./HighlightedEnglish";

/** Class on the card's `.safe-area` while its nuance is being explained. */
export const NUANCE_FOCUS_CLASS = "safe-area--nuance-focus";

/**
 * The Nuance box, enlarged into the middle of the stage while it is spoken.
 *
 * The small box under a card is hard to read on a phone, and it is the one
 * thing on screen that the voice is explaining. While it plays, the card
 * dims and steps back (NUANCE_FOCUS_CLASS on the safe area) and this copy
 * sits centred at reading size with the karaoke. The small box keeps its
 * place (hidden), so nothing reflows when the focus ends.
 */
export function NuanceFocus({
  text,
  highlight,
}: {
  text: string;
  highlight: SpeechHighlight | null;
}) {
  return (
    <div className="lesson-nuance lesson-nuance--active nuance-focus" data-head-avoid>
      <span className="lesson-nuance-label">Nuance</span>
      <HighlightedEnglish
        text={text}
        className="lesson-nuance-body"
        highlight={highlight}
        jpWordBreaks
        readingGlosses
      />
    </div>
  );
}
