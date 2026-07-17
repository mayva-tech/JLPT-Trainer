import { alignFurigana } from "./alignFurigana";

/**
 * Build the string sent to speech synthesis.
 * Uses the lesson reading so ambiguous kanji (間→ま, not あいだ) pronounce correctly.
 * Karaoke highlighting still uses the surface text indices.
 */
export function buildJapaneseSpeakText(
  surface: string,
  spacedReading?: string | null
): string {
  const reading = spacedReading?.trim();
  if (!reading) return surface;

  const segments = alignFurigana(surface, reading);
  const spoken = segments
    .map((seg) => seg.reading ?? seg.text)
    .join("")
    .trim();

  return spoken || surface;
}
