import type { VocabularyItem } from "../types/vocabulary";

type Props = { item: VocabularyItem };

export function CategoryCard({ item }: Props) {
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
        {item.subcategory}
      </div>
    </div>
  );
}
