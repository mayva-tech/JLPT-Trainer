import type { VocabularyItem } from "../types/vocabulary";

type Props = {
  item: VocabularyItem;
  /** TOC lesson theme shown under the category chip (e.g. Shopping • Supermarket). */
  description?: string;
};

export function CategoryCard({ item, description }: Props) {
  const underCategory = description?.trim() || item.subcategory;
  return (
    <div className="safe-area card-fade" aria-hidden="true">
      <div className="category-chip">{item.category}</div>
      <div
        className="category-word-preview"
        style={{
          fontFamily: "var(--font-en)",
          fontSize: "3.5cqw",
          color: "var(--accent)",
        }}
      >
        {underCategory}
      </div>
    </div>
  );
}
