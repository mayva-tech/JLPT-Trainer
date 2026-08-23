import type { StyleComparison } from "../../../utils/speechStyles";
import {
  NATURALNESS_LABELS,
  POLITENESS_LABELS,
  STRENGTH_LABELS,
} from "./styleLabels";

interface StyleComparisonListProps {
  comparisons: StyleComparison[];
  onSpeak: (text: string) => void;
}

export function StyleComparisonList({
  comparisons,
  onSpeak,
}: StyleComparisonListProps) {
  if (comparisons.length === 0) {
    return (
      <p className="ss-empty">
        No comparison groups match those filters. Try widening gender, level, or
        the rough / anime toggles.
      </p>
    );
  }

  return (
    <div className="ss-comparisons">
      {comparisons.map((comparison) => {
        const title = comparison.members.map((m) => m.japanese).join("・");
        const gloss =
          comparison.members.map((m) => m.english).join(" / ") ||
          comparison.group;

        return (
          <section key={comparison.group} className="ss-comparison">
            <h3 className="ss-comparison-title" lang="ja">
              {title}
            </h3>
            <p className="ss-comparison-gloss">{gloss}</p>
            <div className="ss-comparison-grid">
              {comparison.members.map((item) => (
                <div
                  key={item.id}
                  className="ss-mini"
                  data-strength={item.strength}
                >
                  <p className="ss-mini-jp" lang="ja">
                    {item.japanese}
                    <button
                      type="button"
                      className="ss-speak"
                      aria-label={`Speak ${item.japanese}`}
                      onClick={() => onSpeak(item.japanese)}
                    >
                      🔊
                    </button>
                  </p>
                  <p className="ss-mini-reading" lang="ja">
                    {item.reading}
                  </p>
                  <span className="ss-strength" data-strength={item.strength}>
                    {STRENGTH_LABELS[item.strength]}
                  </span>
                  <span className="ss-meta">
                    <span className="ss-meta-chip" data-value={item.politeness}>
                      {POLITENESS_LABELS[item.politeness]}
                    </span>
                    <span
                      className="ss-meta-chip"
                      data-value={item.naturalness}
                    >
                      {NATURALNESS_LABELS[item.naturalness]}
                    </span>
                  </span>
                  <p className="ss-mini-en">{item.english}</p>
                  {item.warning ? (
                    <p className="ss-mini-warning">{item.warning}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
