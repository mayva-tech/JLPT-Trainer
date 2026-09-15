import { HighlightedEnglish } from "../../../components/HighlightedEnglish";
import type { SpeechHighlight } from "../../../services/speechService";
import {
  fieldLabelHighlight,
  fieldSpeaking,
  type StyleSpeechField,
  type StyleSpeechTarget,
} from "../styleSpeech";

type Props = {
  id: string;
  field: StyleSpeechField;
  text: string;
  /** `ss-strength` or `ss-meta-chip` (+ optional data attrs via className/dataValue). */
  variant: "strength" | "chip";
  speechTarget?: StyleSpeechTarget | null;
  highlight?: SpeechHighlight | null;
  dataStrength?: string;
  dataValue?: string;
};

/**
 * Classification badge/chip whose label gets EN karaoke highlight while spoken.
 */
export function StyleClassificationLabel({
  id,
  field,
  text,
  variant,
  speechTarget = null,
  highlight = null,
  dataStrength,
  dataValue,
}: Props) {
  const speaking = fieldSpeaking(speechTarget, id, field);
  const labelHighlight = fieldLabelHighlight(
    speechTarget,
    highlight,
    id,
    field,
    text
  );

  const className =
    variant === "strength"
      ? ["ss-strength", speaking ? "ss-strength--speaking" : ""]
          .filter(Boolean)
          .join(" ")
      : ["ss-meta-chip", speaking ? "ss-meta-chip--speaking" : ""]
          .filter(Boolean)
          .join(" ");

  return (
    <span
      className={className}
      data-strength={dataStrength}
      data-value={dataValue}
    >
      <HighlightedEnglish
        text={text}
        className="ss-classification-label"
        highlight={labelHighlight}
      />
    </span>
  );
}
