import type { HeadLook, HeadVoice } from "./looks";
import { AndrewSuit, NanamiSuit } from "./suitArt";

/**
 * Mecha suit as a look. While the suit is on it stands in for the chosen
 * look (hair and clothing go under the helmet); the chosen look returns as
 * soon as it comes off. Artwork lives in ./suitArt.
 */

/** Stable per-voice components, so React never remounts the suit art. */
const SUIT_LAYERS = { ja: NanamiSuit, en: AndrewSuit } as const;

export const SUIT_LOOK_ID = "mecha-suit";
export const SUIT_LABEL = "Mecha suit";

const cache = new Map<string, HeadLook>();

/**
 * The suit worn over the given look. Brow colour comes from the look, so the
 * face still matches the hair it had before suiting up. Cached per voice and
 * brow colour — same object, same component, no flicker between renders.
 */
export function suitLookFor(voice: HeadVoice, base: HeadLook): HeadLook {
  const key = `${voice}:${base.browColor}`;
  let look = cache.get(key);
  if (!look) {
    look = {
      id: SUIT_LOOK_ID,
      label: SUIT_LABEL,
      browColor: base.browColor,
      Layers: SUIT_LAYERS[voice],
    };
    cache.set(key, look);
  }
  return look;
}
