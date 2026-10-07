import type { VocabularyItem } from "../../types/vocabulary";
import type { JlptLevel } from "../../types/level";

/**
 * Upload text for one Short: title, description, hashtags, and a comment
 * to pin. Everything comes from the word's own data, so 2,000 Shorts can
 * be labelled consistently without typing.
 */

export interface ShortContext {
  level: JlptLevel;
  /** Word number across the level (N5 word #23). */
  wordNumber: number;
  lessonNumber: number;
  lessonTheme: string;
}

export interface ShortMeta {
  title: string;
  description: string;
  hashtags: string[];
  pinnedComment: string;
}

const TITLE_MAX = 100;

/** First sense only: "to rise; to go up" → "to rise". */
export function firstSense(meaning: string): string {
  const first = meaning.split(/[;；]/)[0] ?? meaning;
  return first.replace(/\s*\([^)]*\)\s*$/, "").trim() || meaning.trim();
}

export function shortHashtags(level: JlptLevel): string[] {
  return [
    "#learnjapanese",
    "#japanese",
    "#jlpt",
    `#jlpt${level.toLowerCase()}`,
    "#japanesevocabulary",
    "#nihongo",
    "#shorts",
  ];
}

export function buildShortMeta(item: VocabularyItem, ctx: ShortContext): ShortMeta {
  const sense = firstSense(item.meaning);
  const tail = ` | JLPT ${ctx.level} #${ctx.wordNumber} #shorts`;
  let head = `${item.word} (${item.reading}) = "${sense}"`;
  if ([...head].length + tail.length > TITLE_MAX) {
    head = `${item.word} = "${sense}"`;
  }
  if ([...head].length + tail.length > TITLE_MAX) {
    const room = TITLE_MAX - tail.length - [...item.word].length - 6;
    head = `${item.word} = "${[...sense].slice(0, Math.max(8, room)).join("")}…"`;
  }
  const title = head + tail;

  const hashtags = shortHashtags(ctx.level);
  const lines = [
    `${item.word}【${item.reading}】— ${item.meaning}`,
    "",
  ];
  if (item.sentence?.trim()) {
    lines.push(`📝 ${item.sentence}`, `   ${item.sentenceMeaning}`, "");
  }
  lines.push(
    `JLPT ${ctx.level} vocabulary · word #${ctx.wordNumber}`,
    `Full lesson: JLPT ${ctx.level} Vocabulary #${ctx.lessonNumber} | ${ctx.lessonTheme}`,
    "",
    "💬 Make your own sentence with this word in the comments!",
    "",
    hashtags.join(" ")
  );

  return {
    title,
    description: lines.join("\n"),
    hashtags,
    pinnedComment: `✍️ Your turn: write a sentence with 「${item.word}」 below 👇`,
  };
}
