import { Fragment } from "react";
import {
  formatVocabularyLessonSubheader,
  getVocabularyDisplayRange,
} from "../utils/vocabularyDisplay";

type CategoryLineProps = {
  /** Leading label (e.g. Vocabulary Lesson 3, Grammar 1–10). Omit for category-only. */
  primary?: string;
  /** Category text (e.g. Daily Life) — reminds which group the items belong to. */
  category?: string;
  /** Theme under the category (e.g. Shopping • Supermarket). */
  theme?: string;
  className?: string;
};

/** Single-line `primary · CATEGORY · theme` header shared by lesson, grammar and quiz. */
export function StageCategoryLine({
  primary,
  category,
  theme,
  className = "vocabulary-range-label__primary",
}: CategoryLineProps) {
  const parts = [
    primary?.trim()
      ? { key: "primary", text: primary.trim(), cls: undefined }
      : null,
    category?.trim()
      ? {
          key: "category",
          text: category.trim(),
          cls: "vocabulary-range-label__category",
        }
      : null,
    theme?.trim()
      ? { key: "theme", text: theme.trim(), cls: "vocabulary-range-label__theme" }
      : null,
  ].filter((p): p is { key: string; text: string; cls: string | undefined } =>
    Boolean(p)
  );
  if (parts.length === 0) return null;

  return (
    <div className={className} aria-hidden="true">
      {parts.map((part, i) => (
        <Fragment key={part.key}>
          {i > 0 ? <span className="vocabulary-range-label__sep">·</span> : null}
          <span className={part.cls}>{part.text}</span>
        </Fragment>
      ))}
    </div>
  );
}

type StageHeaderProps = CategoryLineProps & {
  secondary?: string | null;
};

export function StageCategoryLabel({
  primary,
  category,
  theme,
  secondary,
}: StageHeaderProps) {
  return (
    <div className="vocabulary-range-label" aria-hidden="true">
      <StageCategoryLine primary={primary} category={category} theme={theme} />
      {secondary ? (
        <div className="vocabulary-range-label__secondary">{secondary}</div>
      ) : null}
    </div>
  );
}

type Props = {
  lessonId: string;
  kind: "lesson" | "quiz";
  category?: string;
  theme?: string;
};

/** Secondary lesson/quiz numbering shown under the main topic title. */
export function VocabularyRangeLabel({ lessonId, kind, category, theme }: Props) {
  const range = getVocabularyDisplayRange(lessonId);
  if (!range) return null;

  const primary =
    kind === "quiz"
      ? `Vocabulary Quiz ${range.lessonNumber}`
      : `Vocabulary Lesson ${range.lessonNumber}`;

  return (
    <StageCategoryLabel
      primary={primary}
      category={category}
      theme={theme}
      secondary={formatVocabularyLessonSubheader(lessonId)}
    />
  );
}
