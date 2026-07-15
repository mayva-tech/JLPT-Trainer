import type { GrammarItem } from "../types/grammar";

type Props = { item: GrammarItem };

/** ③ Formation rule. */
export function GrammarFormationCard({ item }: Props) {
  return (
    <div className="safe-area card-fade">
      <div className="category-chip">Formation</div>
      <div className="grammar-formation">{item.formation}</div>
    </div>
  );
}
