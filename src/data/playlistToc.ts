import type { TocGroup, TocItem, TocItemId } from "./toc";
import { JLPT_LEVELS } from "../utils/wordLevel";
import { PLAYLIST_LEVEL_INFO, getPlaylistWordRange, playlistLessonsForLevel } from "./playlists";

const two = (n: number) => String(n).padStart(2, "0");

function label(prefix: string, lessonId: string, level: string, theme: string): string {
  const range = getPlaylistWordRange(lessonId);
  const words = range ? ` | Words ${range.firstWordNumber}–${range.lastWordNumber}` : "";
  return `${level} Vocabulary ${prefix}${range ? ` ${range.lessonNumber}` : ""}${words} · ${theme}`;
}

/** TOC groups for the level playlists: per level, lessons then quizzes. */
export function buildPlaylistTocGroups(): TocGroup[] {
  const groups: TocGroup[] = [];
  for (const level of JLPT_LEVELS) {
    const info = PLAYLIST_LEVEL_INFO[level];
    const lessons = playlistLessonsForLevel(level);
    if (lessons.length === 0) continue;
    const lower = level.toLowerCase();
    groups.push({
      id: `playlist-lessons-${lower}`,
      title: `${info.name} · Vocabulary Lessons`,
      items: lessons.map((lesson) => ({
        id: `word-pl-${lower}-${two(Number(lesson.id.split("-")[2]))}` as TocItemId,
        label: label("Lesson", lesson.id, level, lesson.subtitle),
        kind: "word" as const,
        lessonId: lesson.id,
      })),
    });
    groups.push({
      id: `playlist-quizzes-${lower}`,
      title: `${info.name} · Word Quizzes`,
      items: lessons.map((lesson): TocItem => {
        const id = `quiz-vocab-pl-${lower}-${two(Number(lesson.id.split("-")[2]))}` as TocItemId;
        return { id, label: label("Quiz", lesson.id, level, lesson.subtitle), kind: "quiz", quizId: id };
      }),
    });
  }
  return groups;
}
