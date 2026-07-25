import type { GrammarItem } from "../types/grammar";

type Props = {
  item: GrammarItem;
  /** Batch range, e.g. `1–10`. */
  rangeLabel?: string;
  /** TOC batch themes under the range, e.g. `Degree & Limit, Judgement & Evaluation`. */
  description?: string;
};

/** ① Grammar category chip — range + category themes (no “Families”). */
export function GrammarCategoryCard({
  item,
  rangeLabel,
  description,
}: Props) {
  const themes = description?.trim() || item.subcategory;
  const chip = rangeLabel?.trim() || item.category;
  return (
    <div className="safe-area card-fade" aria-hidden="true">
      <div className="category-chip">{chip}</div>
      {themes ? (
        <div
          className="category-word-preview"
          style={{
            fontFamily: "var(--font-en)",
            fontSize: "3.5cqw",
            color: "var(--accent)",
          }}
        >
          {themes}
        </div>
      ) : null}
    </div>
  );
}
