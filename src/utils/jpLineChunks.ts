/**
 * Where a Japanese line may wrap: after a particle or punctuation, before the
 * next content word — 三年前に | 日本へ | 来ました。 — never inside a word
 * (来|ました) or between a stem and its ending (読んで|いる).
 */

const ENDS_WITH_PUNCT = /[、。，．！？!?…」』）)]$/u;
const OPENS_QUOTE = /^[「『（(]/u;
const ENDS_WITH_HIRAGANA = /[\u3041-\u309f]$/u;
const STARTS_WITH_HIRAGANA = /^[\u3041-\u309f]/u;
const STARTS_WITH_CONTENT = /^[\p{Script=Han}\p{Script=Katakana}ー々〆0-9０-９A-Za-zＡ-Ｚａ-ｚ〜～]/u;
/** Particles that close a phrase even when the next word is written in kana. */
const ENDS_WITH_PARTICLE =
  /(?:は|が|を|も|へ|や|よ|ね|から|まで|より|けど|けれど|けれども|ので|のに|には|では|とは|にも|でも|って)$/u;

export function breaksBefore(prev: string, next: string): boolean {
  const before = prev.trimEnd();
  const after = next.trimStart();
  if (!before || !after) return true;
  if (ENDS_WITH_PUNCT.test(before) || OPENS_QUOTE.test(after)) return true;
  if (!ENDS_WITH_HIRAGANA.test(before)) return false;
  if (STARTS_WITH_CONTENT.test(after)) return true;
  return STARTS_WITH_HIRAGANA.test(after) && ENDS_WITH_PARTICLE.test(before);
}

/** Consecutive words grouped into chunks a line must not break inside. */
export function chunkJapaneseWords<T>(words: readonly T[], text: (word: T) => string): T[][] {
  const chunks: T[][] = [];
  let prev = "";
  for (const word of words) {
    const current = text(word);
    const last = chunks.at(-1);
    if (!last || breaksBefore(prev, current)) chunks.push([word]);
    else last.push(word);
    prev = current;
  }
  return chunks;
}
