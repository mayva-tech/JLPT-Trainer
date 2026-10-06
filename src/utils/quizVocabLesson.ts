import type { TocItemId } from "../data/toc";
import { N2_VOCAB_LESSON_COUNT } from "../config/vocabularyCourse";
import { formatLessonIdFromNumber } from "./vocabularyDisplay";
import { N3_VOCAB_LESSON_COUNT } from "../config/vocabularyCourseN3";
import { formatN3LessonId } from "../data/n3/lessonsN3";
import { getPlaylistLessonById } from "../data/playlists";

const VOCAB_QUIZ_ID_RE = /^quiz-vocab-(\d+)-(\d+)$/;
const N1_VOCAB_QUIZ_ID_RE = /^quiz-vocab-n1-(\d+)$/;
const N3_VOCAB_QUIZ_ID_RE = /^quiz-vocab-n3-(\d+)$/;
const PLAYLIST_VOCAB_QUIZ_ID_RE = /^quiz-vocab-pl-(n[1-5])-(\d+)$/;
const MAX_VOCAB_LESSON = N2_VOCAB_LESSON_COUNT;
const MAX_N1_VOCAB_LESSON = 3;

/**
 * Resolve a vocabulary quiz TOC id to its lesson id.
 * `quiz-vocab-1-10` → `lesson-01`, `quiz-vocab-491-500` → `lesson-50`.
 * `quiz-vocab-n1-01` → `n1-lesson-01` (curated N1 lessons reference
 * non-contiguous word ids, so they use an explicit lesson number instead of
 * the decade-range algorithm below).
 * Returns null for grammar / mixed / final / unrelated ids.
 */
export function getVocabularyLessonIdForQuiz(
  quizTocId: TocItemId | string | null
): string | null {
  if (!quizTocId) return null;

  const n1Match = N1_VOCAB_QUIZ_ID_RE.exec(quizTocId);
  if (n1Match) {
    const n1LessonNumber = Number(n1Match[1]);
    if (
      !Number.isInteger(n1LessonNumber) ||
      n1LessonNumber < 1 ||
      n1LessonNumber > MAX_N1_VOCAB_LESSON
    ) {
      return null;
    }
    return `n1-lesson-${String(n1LessonNumber).padStart(2, "0")}`;
  }

  // `quiz-vocab-n3-01` → `n3-lesson-01` (N3 course, ids 7001+).
  const n3Match = N3_VOCAB_QUIZ_ID_RE.exec(quizTocId);
  if (n3Match) {
    const n = Number(n3Match[1]);
    if (!Number.isInteger(n) || n < 1 || n > N3_VOCAB_LESSON_COUNT) return null;
    return formatN3LessonId(n);
  }

  // `quiz-vocab-pl-n5-03` → `pl-n5-03` (level playlists).
  const pl = PLAYLIST_VOCAB_QUIZ_ID_RE.exec(quizTocId);
  if (pl) {
    const id = `pl-${pl[1]}-${pl[2]}`;
    return getPlaylistLessonById(id) ? id : null;
  }

  const match = VOCAB_QUIZ_ID_RE.exec(quizTocId);
  if (!match) return null;

  const first = Number(match[1]);
  const last = Number(match[2]);

  if (!Number.isInteger(first) || !Number.isInteger(last)) return null;
  if (first < 1 || last !== first + 9) return null;
  if ((first - 1) % 10 !== 0) return null;

  const lessonNumber = Math.floor((first - 1) / 10) + 1;
  if (lessonNumber < 1 || lessonNumber > MAX_VOCAB_LESSON) return null;

  return formatLessonIdFromNumber(lessonNumber);
}
