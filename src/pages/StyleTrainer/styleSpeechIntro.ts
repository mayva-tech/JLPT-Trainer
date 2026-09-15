import type { StyleCategoryId, StyleExpression } from "../../types/speechStyle";
import { getStyleCategory } from "../../utils/speechStyles";
import type { StyleSpeechField } from "./styleSpeech";
import {
  NATURALNESS_LABELS,
  POLITENESS_LABELS,
  STRENGTH_LABELS,
} from "./components/styleLabels";

export type ClassificationSpeechPart = {
  field: StyleSpeechField;
  text: string;
};

/** Strength / politeness / naturalness labels spoken one-by-one in Play All. */
export function buildItemClassificationParts(
  item: StyleExpression
): ClassificationSpeechPart[] {
  return [
    {
      field: "classification-strength",
      text: STRENGTH_LABELS[item.strength],
    },
    {
      field: "classification-politeness",
      text: POLITENESS_LABELS[item.politeness],
    },
    {
      field: "classification-naturalness",
      text: NATURALNESS_LABELS[item.naturalness],
    },
  ];
}

/** Spoken before each expression in Play All (strength, politeness, naturalness). */
export function buildItemClassificationSpeech(item: StyleExpression): string {
  return buildItemClassificationParts(item)
    .map((part) => part.text)
    .join(". ");
}

export function buildCategorySpeech(categoryId: StyleCategoryId): string | null {
  return getStyleCategory(categoryId)?.english ?? null;
}
