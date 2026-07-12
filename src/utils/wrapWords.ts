/**
 * Split text into words for line wrapping (not mid-character).
 * Uses Intl.Segmenter when available; falls back to space / punctuation breaks.
 */
export function splitIntoWords(
  text: string,
  locale = "ja"
): { text: string; start: number; isWordLike: boolean }[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(locale, { granularity: "word" });
    const out: { text: string; start: number; isWordLike: boolean }[] = [];
    for (const { segment, index, isWordLike } of segmenter.segment(text)) {
      out.push({ text: segment, start: index, isWordLike: !!isWordLike });
    }
    return out;
  }

  // Fallback: keep CJK runs / latin runs together; split on whitespace & punctuation
  const out: { text: string; start: number; isWordLike: boolean }[] = [];
  const re =
    /(\s+)|([A-Za-z0-9]+(?:'[A-Za-z0-9]+)*)|([^\sA-Za-z0-9])/gu;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const piece = match[0];
    out.push({
      text: piece,
      start: match.index,
      isWordLike: !/^\s+$/.test(piece) && !/^[、。！？．，,.!?;:…・「」『』（）()]+$/.test(piece),
    });
  }
  return out;
}

/** Group consecutive non-word-like segments with the preceding word (punctuation sticks to word). */
export function groupWrapUnits(
  words: { text: string; start: number; isWordLike: boolean }[]
): { text: string; start: number; end: number }[] {
  const units: { text: string; start: number; end: number }[] = [];
  let i = 0;
  while (i < words.length) {
    const first = words[i]!;
    let text = first.text;
    let end = first.start + first.text.length;
    i++;

    // Attach following whitespace/punctuation to this unit so lines break between words
    while (i < words.length && !words[i]!.isWordLike) {
      const next = words[i]!;
      text += next.text;
      end = next.start + next.text.length;
      i++;
    }

    units.push({ text, start: first.start, end });
  }
  return units;
}

type RangedSeg<T> = { seg: T; start: number; end: number };

/**
 * Pack furigana segments into wrap groups without splitting or duplicating a segment.
 * Prefers breaks at word boundaries; falls back to one segment per group so long
 * lines can still wrap.
 */
export function packSegmentsIntoWrapGroups<T extends { text: string }>(
  segments: T[],
  surface: string,
  locale = "ja"
): RangedSeg<T>[][] {
  const wordEnds = new Set(
    groupWrapUnits(splitIntoWords(surface, locale)).map((u) => u.end)
  );

  const ranged: RangedSeg<T>[] = [];
  let offset = 0;
  for (const seg of segments) {
    const start = offset;
    const end = offset + seg.text.length;
    offset = end;
    ranged.push({ seg, start, end });
  }

  if (ranged.length === 0) return [];

  const groups: RangedSeg<T>[][] = [];
  let current: RangedSeg<T>[] = [];
  for (const item of ranged) {
    current.push(item);
    if (wordEnds.has(item.end)) {
      groups.push(current);
      current = [];
    }
  }
  if (current.length) groups.push(current);

  // No word-aligned breaks → allow wrap between segments
  if (groups.length <= 1 && ranged.length > 1) {
    return ranged.map((r) => [r]);
  }
  return groups;
}
