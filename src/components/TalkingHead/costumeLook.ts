import type { HeadLook, HeadVoice } from "./looks";
import type { Costume } from "./costumes";

/**
 * A costume as a look. While a costume is on it stands in for the chosen
 * look (hair and clothing go under it); the chosen look returns as soon as
 * it comes off. Artwork lives in ./costumes.
 */

const cache = new Map<string, HeadLook>();

/**
 * The costume worn over the given look. Brow colour comes from the look, so
 * the face still matches the hair it had before. Cached per costume, voice
 * and brow colour — same object, same component, so React never remounts
 * the costume art between renders.
 */
export function costumeLookFor(costume: Costume, voice: HeadVoice, base: HeadLook): HeadLook {
  const key = `${costume.id}:${voice}:${base.browColor}`;
  let look = cache.get(key);
  if (!look) {
    look = {
      id: `costume-${costume.id}`,
      label: costume.label,
      browColor: base.browColor,
      Layers: costume.Layers[voice],
    };
    cache.set(key, look);
  }
  return look;
}
