import {
  formatVocabularyLessonSubheader,
  getVocabularyDisplayRange,
} from "../utils/vocabularyDisplay";

type Props = {
  lessonId: string;
  kind: "lesson" | "quiz";
};

/** Secondary lesson/quiz numbering shown under the main topic title. */
export function VocabularyRangeLabel({ lessonId, kind }: Props) {
  const range = getVocabularyDisplayRange(lessonId);
  if (!range) return null;

  const primary =
    kind === "quiz"
      ? `Vocabulary Quiz ${range.lessonNumber}`
      : `Vocabulary Lesson ${range.lessonNumber}`;

  return (
    <div className="vocabulary-range-label" aria-hidden="true">
      <div className="vocabulary-range-label__primary">{primary}</div>
      <div className="vocabulary-range-label__secondary">
        {formatVocabularyLessonSubheader(lessonId)}
      </div>
    </div>
  );
}
