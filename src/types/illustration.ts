/** How a picture moves (all gentle, and switched off for reduced motion). */
export type PictureMotion =
  | "bob"
  | "float"
  | "wiggle"
  | "pulse"
  | "spin"
  | "shake"
  | "drift"
  | "bounce"
  | "rain";

/** A small picture beside a vocabulary word or grammar pattern. */
export interface Picture {
  /** One emoji, or `svg:<id>` for the hand-drawn animated set. */
  src: string;
  motion: PictureMotion;
}

/** Generated row: [id, word or pattern, picture | null, motion | null]. */
export type PictureRow = readonly [number, string, string | null, string | null];
