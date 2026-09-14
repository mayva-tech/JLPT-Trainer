import type { SpeechHighlight } from "../../services/speechService";

export type StyleSpeechField =
  | "headword"
  | "example"
  | "focus"
  | "shift-jp"
  | "english"
  | "example-en"
  | "warning"
  | "summary"
  | "note"
  | "speaker"
  | "context";

export type StyleSpeechTarget = {
  id: string;
  field: StyleSpeechField;
};

export type StyleSpeakJp = (
  text: string,
  reading: string | undefined,
  target: StyleSpeechTarget
) => void;

export type StyleSpeechUi = {
  onTarget: (target: StyleSpeechTarget | null) => void;
  onHighlight: (highlight: SpeechHighlight | null) => void;
};

export function fieldHighlight(
  speechTarget: StyleSpeechTarget | null | undefined,
  highlight: SpeechHighlight | null | undefined,
  id: string,
  field: StyleSpeechField
): SpeechHighlight | null {
  if (!speechTarget || speechTarget.id !== id || speechTarget.field !== field) {
    return null;
  }
  return highlight ?? null;
}
