import type { VocabularyItem } from "../../types/vocabulary";
import type { JlptLevel } from "../../types/level";
import { shortAngle, type ShortAngleKind } from "./shortAngle";

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

/** Required credit when a Short animates KanjiVG strokes (CC BY-SA 3.0). */
export const KANJIVG_CREDIT = "Stroke order: KanjiVG (kanjivg.tagaini.net), CC BY-SA 3.0";

export interface ShortMeta {
  /** Hook type of this Short (trap / twin / math / read), for analytics. */
  hookType: ShortAngleKind;
  /** Readable hook name ("Kanji math"). */
  hookLabel: string;
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

export function buildShortMeta(
  item: VocabularyItem,
  ctx: ShortContext,
  options: { strokeCredit?: boolean } = {}
): ShortMeta {
  const sense = firstSense(item.meaning);
  const angle = shortAngle(item);
  const tail = ` | JLPT ${ctx.level} #${ctx.wordNumber} #shorts`;
  const fits = (h: string | null): h is string => Boolean(h) && [...h!].length + tail.length <= TITLE_MAX;
  let head = `${item.word} (${item.reading}) = "${sense}"`;
  if (fits(angle.titleHead)) head = angle.titleHead;
  else if (fits(angle.titleHeadShort)) head = angle.titleHeadShort;
  if ([...head].length + tail.length > TITLE_MAX) {
    head = `${item.word} = "${sense}"`;
  }
  if ([...head].length + tail.length > TITLE_MAX) {
    const room = TITLE_MAX - tail.length - [...item.word].length - 6;
    head = `${item.word} = "${[...sense].slice(0, Math.max(8, room)).join("")}…"`;
  }
  const title = head + tail;

  const hashtags = shortHashtags(ctx.level);
  const lines: string[] = [];
  if (angle.descLine) lines.push(angle.descLine, "");
  lines.push(`${item.word}【${item.reading}】— ${item.meaning}`, "");
  if (item.sentence?.trim()) {
    lines.push(`📝 ${item.sentence}`, `   ${item.sentenceMeaning}`, "");
  }
  lines.push(
    `JLPT ${ctx.level} vocabulary · word #${ctx.wordNumber}`,
    `Full lesson: JLPT ${ctx.level} Vocabulary #${ctx.lessonNumber} | ${ctx.lessonTheme}`,
    "",
    `💬 ${angle.bait}`,
    ""
  );
  if (options.strokeCredit) lines.push(KANJIVG_CREDIT, "");
  lines.push(hashtags.join(" "));

  return {
    hookType: angle.kind,
    hookLabel: angle.label,
    title,
    description: lines.join("\n"),
    hashtags,
    pinnedComment: angle.pinnedComment,
  };
}
