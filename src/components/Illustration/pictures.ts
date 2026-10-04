import { GRAMMAR_PICTURE_ROWS, VOCAB_PICTURE_ROWS } from "../../data/illustrations";
import type { Picture, PictureMotion, PictureRow } from "../../types/illustration";

function toMap(rows: readonly PictureRow[]): Map<number, Picture> {
  const map = new Map<number, Picture>();
  for (const [id, , src, motion] of rows) {
    if (src && motion) map.set(id, { src, motion: motion as PictureMotion });
  }
  return map;
}

const VOCAB = toMap(VOCAB_PICTURE_ROWS);
const GRAMMAR = toMap(GRAMMAR_PICTURE_ROWS);

/** Picture for a vocabulary item, or null when it has none. */
export function vocabPicture(id: number): Picture | null {
  return VOCAB.get(id) ?? null;
}

/** Picture for a grammar item (its function), or null when it has none. */
export function grammarPicture(id: number): Picture | null {
  return GRAMMAR.get(id) ?? null;
}
