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
  | "context"
  | "classification-strength"
  | "classification-politeness"
  | "classification-naturalness";

export type StyleSpeechTarget = {
  id: string;
  field: StyleSpeechField;
};

export type StyleSpeakJp = (
  text: string,
  reading: string | undefined,
  target: StyleSpeechTarget
) => void;

export type StyleSpeakEn = (text: string, target: StyleSpeechTarget) => void;

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

/** True when Play All / speak is currently on this classification chip. */
export function fieldSpeaking(
  speechTarget: StyleSpeechTarget | null | undefined,
  id: string,
  field: StyleSpeechField
): boolean {
  return (
    !!speechTarget && speechTarget.id === id && speechTarget.field === field
  );
}

/**
 * Karaoke highlight for a classification chip label. Uses live word bounds
 * when available; otherwise lights the whole label while that chip is active.
 */
export function fieldLabelHighlight(
  speechTarget: StyleSpeechTarget | null | undefined,
  highlight: SpeechHighlight | null | undefined,
  id: string,
  field: StyleSpeechField,
  text: string
): SpeechHighlight | null {
  if (!fieldSpeaking(speechTarget, id, field)) return null;
  if (highlight) return highlight;
  const end = text.length;
  return end > 0 ? { start: 0, end } : null;
}
