import { alignFurigana } from "../../utils/alignFurigana";

/** Phrase ends where a subtitle may wrap: particles and punctuation
 * (not て: 集まって｜います stays together; commas still split long て-chains). */
const BREAK_AFTER = /(?:[のにがをはでともへやよね、。！？」』]|から|まで|より)$/u;

export interface PhrasePiece {
  text: string;
  /** Furigana for kanji pieces. */
  reading?: string;
  /** UTF-16 offsets in the sentence (match speech highlight ranges). */
  start: number;
  end: number;
}

/**
 * Splits a sentence into furigana pieces grouped by phrase, so a Short's
 * subtitle wraps only between phrases (駅の / 前に / 人が / 集まっています。)
 * and never inside one. Pieces keep the sentence's own character offsets
 * so karaoke highlights from the voice line up.
 */
export function phraseChunks(surface: string, reading: string): PhrasePiece[][] {
  const segments = alignFurigana(surface, reading);
  const phrases: PhrasePiece[][] = [];
  let current: PhrasePiece[] = [];
  let text = "";
  let at = 0;
  for (const seg of segments) {
    const piece: PhrasePiece = {
      text: seg.text,
      reading: seg.reading,
      start: at,
      end: at + seg.text.length,
    };
    at = piece.end;
    // Kana runs may hold a phrase end in the middle (…が集 | まっています):
    // split them at each break point.
    if (!piece.reading) {
      let from = 0;
      for (let i = 1; i <= piece.text.length; i++) {
        const head = text + piece.text.slice(from, i);
        if (BREAK_AFTER.test(head) && i < piece.text.length) {
          const part = piece.text.slice(from, i);
          current.push({ text: part, start: piece.start + from, end: piece.start + i });
          phrases.push(current);
          current = [];
          text = "";
          from = i;
        }
      }
      const rest = piece.text.slice(from);
      if (rest) {
        current.push({ text: rest, start: piece.start + from, end: piece.end });
        text += rest;
      }
    } else {
      current.push(piece);
      text += piece.text;
    }
    if (BREAK_AFTER.test(text)) {
      phrases.push(current);
      current = [];
      text = "";
    }
  }
  if (current.length) phrases.push(current);
  return phrases;
}
