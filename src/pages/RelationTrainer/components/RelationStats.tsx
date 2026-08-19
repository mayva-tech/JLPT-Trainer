import type { RelationStats as Stats } from "../../../utils/wordRelations";

interface Props {
  stats: Stats;
}

export function RelationStats({ stats }: Props) {
  const items = [
    { value: stats.total, label: "Total / 合計" },
    { value: stats.synonyms, label: "類義語" },
    { value: stats.antonyms, label: "反対語" },
    { value: stats.learned, label: "Learned / 覚えた" },
    { value: stats.learning, label: "Learning / 学習中" },
    { value: stats.remaining, label: "Remaining / 残り" },
  ];

  return (
    <div className="rt-stats" aria-label="Progress statistics">
      {items.map((item) => (
        <div key={item.label} className="rt-stat">
          <span className="rt-stat-value">{item.value}</span>
          <span className="rt-stat-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
