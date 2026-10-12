import type { VocabularyItem } from "../../types/vocabulary";
import type { JlptLevel } from "../../types/level";
import { AUDIENCE_LINE, buildHashtags, firstSense, TITLE_MAX } from "../../utils/social/socialText";
import { shortAngle, type ShortAngleKind } from "./shortAngle";
import { BAIT_SHOWN, LETTERS, MESSAGE_HOOK_LABEL, SENDER, messageFor, type HookStyle } from "./shortMessage";

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
  /** Hook type of this Short (trap / twin / math / read / message), for analytics. */
  hookType: ShortAngleKind | "message";
  /** Readable hook name ("Kanji math"). */
  hookLabel: string;
  title: string;
  description: string;
  hashtags: string[];
  pinnedComment: string;
}

export { firstSense };

export function shortHashtags(level: JlptLevel): string[] {
  return buildHashtags({ level, kind: "vocabulary", shortForm: true });
}

export function buildShortMeta(
  item: VocabularyItem,
  ctx: ShortContext,
  options: { strokeCredit?: boolean; hookStyle?: HookStyle } = {}
): ShortMeta {
  const sense = firstSense(item.meaning);
  const classic = shortAngle(item);
  const msg = messageFor(item, options.hookStyle);
  // The message hook keeps the meaning out of the title: it is the question.
  const angle = msg
    ? {
        ...classic,
        kind: "message" as const,
        label: MESSAGE_HOOK_LABEL,
        titleHead: `${SENDER.en} texted you 「${item.word}」— what does she mean?`,
        titleHeadShort: `「${item.word}」in a text — what does it mean?`,
        descLine: `📱 ${SENDER.en} texted: ${msg.text}\n❓ What does 「${item.word}」 mean here? ${msg.choices
          .map((c, i) => `${LETTERS[i]}) ${c}`)
          .join("  ")}`,
        bait: BAIT_SHOWN,
        pinnedComment: `Which one did ${SENDER.en} mean by 「${item.word}」? ${msg.choices
          .map((c, i) => `${LETTERS[i]}) ${c}`)
          .join("  ")} — answer below 👇`,
      }
    : classic;
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
    "",
    AUDIENCE_LINE,
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
