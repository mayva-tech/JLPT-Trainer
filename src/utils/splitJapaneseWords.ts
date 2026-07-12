/**
 * Split Japanese text into wrap units (words), never mid-character.
 * Breaks after punctuation and after common particles / verb endings.
 */
export function splitJapaneseWords(text: string): string[] {
  // Only high-confidence particle breaks (avoid か/の/や — too many false splits)
  const particleBreak = new Set(["を", "に", "で", "は", "が", "と", "も", "へ"]);
  const punctuation = new Set(["、", "。", "！", "？"]);

  // Longer first so "ました" wins over "した"
  const endings = [
    "ください",
    "ました",
    "でした",
    "ます",
    "です",
    "から",
    "まで",
    "より",
    "など",
    "して",
    "した",
    "する",
  ];

  const units: string[] = [];
  let buf = "";

  const flush = () => {
    if (!buf) return;
    // Attach lone punctuation to the previous unit
    if (units.length > 0 && [...buf].every((c) => punctuation.has(c))) {
      units[units.length - 1] += buf;
    } else {
      units.push(buf);
    }
    buf = "";
  };

  for (const ch of text) {
    if (/\s/.test(ch)) {
      flush();
      continue;
    }

    buf += ch;

    if (
      punctuation.has(ch) ||
      particleBreak.has(ch) ||
      endings.some((e) => buf.endsWith(e))
    ) {
      flush();
    }
  }
  flush();

  return units.length > 0 ? units : [text];
}
