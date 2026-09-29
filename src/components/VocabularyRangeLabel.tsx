import { useLayoutEffect, useRef } from "react";
import {
  formatVocabularyLessonSubheader,
  getVocabularyDisplayRange,
} from "../utils/vocabularyDisplay";

/** Level + playback speed chips (level colours match the Synonyms trainer). */
type StageChipsProps = {
  /** JLPT level of the current item, e.g. `N2`. */
  level?: string;
  /** Current TTS speed label, e.g. `Normal` / `1.25×` / `Slow`. */
  speed?: string;
};

export function StageLevelChip({ level }: { level?: string }) {
  if (!level) return null;
  return (
    <span className="stage-chip stage-chip--level" data-level={level}>
      {level}
    </span>
  );
}

export function StageSpeedChip({ speed }: { speed?: string }) {
  if (!speed) return null;
  return (
    <span className="stage-chip stage-chip--speed" data-speed={speed}>
      {speed}
    </span>
  );
}

type CategoryLineProps = StageChipsProps & {
  /** Leading label (e.g. Vocabulary Lesson 3, Grammar 1–10). Omit for category-only. */
  primary?: string;
  /** Category text (e.g. Daily Life) — reminds which group the items belong to. */
  category?: string;
  /** Theme under the category (e.g. Shopping • Supermarket). */
  theme?: string;
  className?: string;
};

/**
 * Single-line `primary · CATEGORY · theme` header shared by lesson, grammar
 * and quiz. `level` / `speed` chips render inline only when passed here.
 */
export function StageCategoryLine({
  primary,
  category,
  theme,
  level,
  speed,
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
  const lineRef = useRef<HTMLDivElement>(null);
  const partsKey = parts.map((p) => p.text).join("|");

  useLayoutEffect(() => {
    const line = lineRef.current;
    if (!line) return;
    const mark = () => {
      let prevTop: number | null = null;
      for (const el of line.querySelectorAll<HTMLElement>(
        ".vocabulary-range-label__part"
      )) {
        el.classList.remove("vocabulary-range-label__part--line-start");
      }
      for (const el of line.querySelectorAll<HTMLElement>(
        ".vocabulary-range-label__part"
      )) {
        const top = el.offsetTop;
        if (prevTop !== null && top > prevTop + 2) {
          el.classList.add("vocabulary-range-label__part--line-start");
        }
        prevTop = top;
      }
    };
    mark();
    // Width-only: hiding a separator changes height, which must not re-trigger.
    let lastWidth = line.clientWidth;
    const ro = new ResizeObserver(() => {
      if (line.clientWidth === lastWidth) return;
      lastWidth = line.clientWidth;
      mark();
    });
    ro.observe(line);
    return () => ro.disconnect();
  }, [partsKey]);

  if (parts.length === 0 && !level && !speed) return null;

  return (
    <div className={className} aria-hidden="true" ref={lineRef}>
      <StageLevelChip level={level} />
      {parts.map((part, i) => (
        // Separator rides with the next item so a wrap never leaves "·" dangling.
        <span
          key={part.key}
          className={`vocabulary-range-label__part vocabulary-range-label__part--${part.key}`}
        >
          {i > 0 ? <span className="vocabulary-range-label__sep">·</span> : null}
          <span className={part.cls}>{part.text}</span>
        </span>
      ))}
      <StageSpeedChip speed={speed} />
    </div>
  );
}

type StageHeaderProps = Omit<CategoryLineProps, "className"> & {
  secondary?: string | null;
};

/** Title line, then a meta row: `[N2]  Words 11–20  [Normal]`. */
export function StageCategoryLabel({
  primary,
  category,
  theme,
  secondary,
  level,
  speed,
}: StageHeaderProps) {
  const showMeta = Boolean(secondary || level || speed);
  return (
    <div className="vocabulary-range-label" aria-hidden="true">
      <StageCategoryLine primary={primary} category={category} theme={theme} />
      {showMeta ? (
        <div className="vocabulary-range-label__secondary">
          <StageLevelChip level={level} />
          {secondary ? <span>{secondary}</span> : null}
          <StageSpeedChip speed={speed} />
        </div>
      ) : null}
    </div>
  );
}

type Props = StageChipsProps & {
  lessonId: string;
  kind: "lesson" | "quiz";
  category?: string;
  theme?: string;
};

/** Secondary lesson/quiz numbering shown under the main topic title. */
export function VocabularyRangeLabel({
  lessonId,
  kind,
  category,
  theme,
  level,
  speed,
}: Props) {
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
      level={level}
      speed={speed}
    />
  );
}
