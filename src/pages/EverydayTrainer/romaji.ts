/**
 * Kana → Hepburn romaji for Everyday Japanese cards.
 *
 * Romaji is derived from the reading instead of typed by hand, so it can
 * never drift from the kana. Conventions (modified Hepburn):
 *   - long vowels take a macron: おう/おお → ō, うう → ū, ー → ā ī ū ē ō
 *   - えい stays "ei", いい stays "ii"
 *   - っ doubles the next consonant (っち → tchi)
 *   - ん before a vowel or y is written n' (てんいん → ten'in)
 *   - spaces in the reading are kept as word breaks
 */

const BASE: Record<string, string> = {
  あ: "a", い: "i", う: "u", え: "e", お: "o",
  か: "ka", き: "ki", く: "ku", け: "ke", こ: "ko",
  さ: "sa", し: "shi", す: "su", せ: "se", そ: "so",
  た: "ta", ち: "chi", つ: "tsu", て: "te", と: "to",
  な: "na", に: "ni", ぬ: "nu", ね: "ne", の: "no",
  は: "ha", ひ: "hi", ふ: "fu", へ: "he", ほ: "ho",
  ま: "ma", み: "mi", む: "mu", め: "me", も: "mo",
  や: "ya", ゆ: "yu", よ: "yo",
  ら: "ra", り: "ri", る: "ru", れ: "re", ろ: "ro",
  わ: "wa", ゐ: "i", ゑ: "e", を: "o",
  が: "ga", ぎ: "gi", ぐ: "gu", げ: "ge", ご: "go",
  ざ: "za", じ: "ji", ず: "zu", ぜ: "ze", ぞ: "zo",
  だ: "da", ぢ: "ji", づ: "zu", で: "de", ど: "do",
  ば: "ba", び: "bi", ぶ: "bu", べ: "be", ぼ: "bo",
  ぱ: "pa", ぴ: "pi", ぷ: "pu", ぺ: "pe", ぽ: "po",
  ゔ: "vu",
  ぁ: "a", ぃ: "i", ぅ: "u", ぇ: "e", ぉ: "o",
  ゃ: "ya", ゅ: "yu", ょ: "yo", ゎ: "wa",
};

/** Two-kana sounds, including the katakana-only ones (ティ, ファ, チェ…). */
const PAIRS: Record<string, string> = {
  きゃ: "kya", きゅ: "kyu", きょ: "kyo",
  しゃ: "sha", しゅ: "shu", しょ: "sho", しぇ: "she",
  ちゃ: "cha", ちゅ: "chu", ちょ: "cho", ちぇ: "che",
  にゃ: "nya", にゅ: "nyu", にょ: "nyo",
  ひゃ: "hya", ひゅ: "hyu", ひょ: "hyo",
  みゃ: "mya", みゅ: "myu", みょ: "myo",
  りゃ: "rya", りゅ: "ryu", りょ: "ryo",
  ぎゃ: "gya", ぎゅ: "gyu", ぎょ: "gyo",
  じゃ: "ja", じゅ: "ju", じょ: "jo", じぇ: "je",
  ぢゃ: "ja", ぢゅ: "ju", ぢょ: "jo",
  びゃ: "bya", びゅ: "byu", びょ: "byo",
  ぴゃ: "pya", ぴゅ: "pyu", ぴょ: "pyo",
  てぃ: "ti", でぃ: "di", とぅ: "tu", どぅ: "du", でゅ: "dyu",
  ふぁ: "fa", ふぃ: "fi", ふぇ: "fe", ふぉ: "fo",
  うぃ: "wi", うぇ: "we", うぉ: "wo",
  ゔぁ: "va", ゔぃ: "vi", ゔぇ: "ve", ゔぉ: "vo",
  つぁ: "tsa", つぃ: "tsi", つぇ: "tse", つぉ: "tso",
};

const MACRON: Record<string, string> = { a: "ā", i: "ī", u: "ū", e: "ē", o: "ō" };

function toHiragana(text: string): string {
  return text.replace(/[ァ-ヶ]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60),
  );
}

function romanizeWord(kana: string): string {
  const chars = [...toHiragana(kana)];
  const tokens: string[] = [];
  let doubleNext = false;

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]!;
    const pair = chars[i + 1] ? PAIRS[ch + chars[i + 1]] : undefined;

    if (ch === "っ") {
      doubleNext = true;
      continue;
    }
    if (ch === "ー") {
      const last = tokens.pop() ?? "";
      const vowel = last.slice(-1);
      tokens.push(MACRON[vowel] ? last.slice(0, -1) + MACRON[vowel] : last);
      continue;
    }
    if (ch === "ん") {
      tokens.push("n");
      continue;
    }

    let syllable = pair ?? BASE[ch] ?? ch;
    if (pair) i += 1;
    if (doubleNext) {
      syllable = syllable.startsWith("ch") ? `t${syllable}` : syllable[0] + syllable;
      doubleNext = false;
    }

    // Long vowels: おう / おお → ō, うう → ū (only for a bare う / お kana).
    const prev = tokens[tokens.length - 1];
    if (prev && !pair) {
      if ((ch === "う" || ch === "お") && prev.endsWith("o") && prev !== "n") {
        tokens[tokens.length - 1] = prev.slice(0, -1) + "ō";
        continue;
      }
      if (ch === "う" && prev.endsWith("u") && prev !== "n") {
        tokens[tokens.length - 1] = prev.slice(0, -1) + "ū";
        continue;
      }
    }

    if (prev === "n" && /^[aiueoy]/.test(syllable)) {
      tokens[tokens.length - 1] = "n'";
    }
    tokens.push(syllable);
  }
  return tokens.join("");
}

/** "でんし レンジ" → "denshi renji". */
export function kanaToRomaji(reading: string): string {
  return reading
    .trim()
    .split(/\s+/)
    .map(romanizeWord)
    .join(" ");
}
