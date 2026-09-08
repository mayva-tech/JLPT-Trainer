import type { StyleCategoryId, StyleExpression } from "../../types/speechStyle";
import { getStyleCategory } from "../../utils/speechStyles";
import {
  NATURALNESS_LABELS,
  POLITENESS_LABELS,
  STRENGTH_LABELS,
} from "./components/styleLabels";

/** Spoken before each expression in Play All (strength, politeness, naturalness). */
export function buildItemClassificationSpeech(item: StyleExpression): string {
  return [
    STRENGTH_LABELS[item.strength],
    POLITENESS_LABELS[item.politeness],
    NATURALNESS_LABELS[item.naturalness],
  ].join(". ");
}

export function buildCategorySpeech(categoryId: StyleCategoryId): string | null {
  return getStyleCategory(categoryId)?.english ?? null;
}
