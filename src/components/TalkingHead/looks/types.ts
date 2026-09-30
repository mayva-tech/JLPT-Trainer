import type { ComponentType } from "react";

/**
 * Where a look's artwork sits in the portrait's paint order.
 *
 * The face base (face shape, ears, neck, cheeks), the eyes, the nose and the
 * mouth are owned by the head itself and never change between looks — a look
 * only paints the layers around them:
 *
 * - `back`   behind everything, tilts with the head (long hair, buns, tails)
 * - `outfit` clothing and shoulders, planted (does not tilt)
 * - `face`   over the face base, under brows/eyes (hair cap, fringe, beard)
 * - `lip`    just under the mouth (moustache)
 * - `top`    over everything on the head (hats, glasses, earrings, hair on top)
 * - `collar` planted, painted last (shirt collars, ties, necklines over the neck)
 */
export type LookLayer = "back" | "outfit" | "face" | "lip" | "top" | "collar";

export interface LookLayerProps {
  layer: LookLayer;
}

export interface HeadLook {
  /** Stable id — persisted, so never rename an existing one. */
  id: string;
  /** Short name shown when the look changes. */
  label: string;
  /** Eyebrow colour; brow shape stays fixed per character. */
  browColor: string;
  /** Renders one layer, or null when the look has nothing on that layer. */
  Layers: ComponentType<LookLayerProps>;
}

export type HeadVoice = "en" | "ja";
