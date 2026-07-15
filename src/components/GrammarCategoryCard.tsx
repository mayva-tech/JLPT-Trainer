import type { GrammarItem } from "../types/grammar";

type Props = { item: GrammarItem };

/** ① Grammar category chip — mirrors CategoryCard for vocabulary. */
export function GrammarCategoryCard({ item }: Props) {
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
