import {
  groupComparisonsByCategory,
  type StyleComparison,
} from "../../../utils/speechStyles";
import {
  NATURALNESS_LABELS,
  POLITENESS_LABELS,
  STRENGTH_LABELS,
} from "./styleLabels";

interface StyleComparisonListProps {
  comparisons: StyleComparison[];
  onSpeakJp: (text: string, reading?: string) => void;
  activePlayId?: string | null;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  showCategoryHeaders?: boolean;
}

function miniClassName(
  itemId: string,
  activePlayId: string | null,
  selectedId: string | null
): string {
  const parts = ["ss-mini"];
  if (selectedId === itemId) parts.push("ss-mini--selected");
  if (activePlayId === itemId) parts.push("ss-mini--playing");
  return parts.join(" ");
}

function ComparisonBlock({
  comparison,
  onSpeakJp,
  activePlayId,
  selectedId,
  onSelect,
}: {
  comparison: StyleComparison;
  onSpeakJp: (text: string, reading?: string) => void;
  activePlayId: string | null;
  selectedId: string | null;
  onSelect?: (id: string) => void;
}) {
  const title = comparison.members.map((m) => m.japanese).join("・");
  const gloss =
    comparison.members.map((m) => m.english).join(" / ") || comparison.group;

  return (
    <section className="ss-comparison">
      <h3 className="ss-comparison-title" lang="ja">
        {title}
      </h3>
      <p className="ss-comparison-gloss">{gloss}</p>
      <div className="ss-comparison-grid">
        {comparison.members.map((item) => (
          <div
            key={item.id}
            className={miniClassName(item.id, activePlayId, selectedId)}
            data-strength={item.strength}
            role="button"
            tabIndex={0}
            aria-pressed={selectedId === item.id}
            onClick={() => onSelect?.(item.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect?.(item.id);
              }
            }}
          >
            <p className="ss-mini-jp" lang="ja">
              {item.japanese}
              <button
                type="button"
                className="ss-speak"
                aria-label={`Speak Japanese: ${item.japanese}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onSpeakJp(item.japanese, item.reading);
                }}
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
              <span className="ss-meta-chip" data-value={item.naturalness}>
                {NATURALNESS_LABELS[item.naturalness]}
              </span>
            </span>
            <p className="ss-mini-en">{item.english}</p>
            {item.example.japanese ? (
              <div className="ss-mini-example">
                <p className="ss-mini-example-jp" lang="ja">
                  {item.example.japanese}
                  <button
                    type="button"
                    className="ss-speak"
                    aria-label="Speak Japanese example"
                    onClick={(event) => {
                      event.stopPropagation();
                      onSpeakJp(item.example.japanese, item.example.reading);
                    }}
                  >
                    🔊
                  </button>
                </p>
                {item.example.reading ? (
                  <p className="ss-mini-example-reading" lang="ja">
                    {item.example.reading}
                  </p>
                ) : null}
                {item.example.english ? (
                  <p className="ss-mini-example-en">{item.example.english}</p>
                ) : null}
              </div>
            ) : null}
            {item.warning ? (
              <p className="ss-mini-warning">{item.warning}</p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function StyleComparisonList({
  comparisons,
  onSpeakJp,
  activePlayId = null,
  selectedId = null,
  onSelect,
  showCategoryHeaders = true,
}: StyleComparisonListProps) {
  if (comparisons.length === 0) {
    return (
      <p className="ss-empty">
        No comparison groups match those filters. Try widening gender, level, or
        the rough / anime toggles.
      </p>
    );
  }

  const grouped = groupComparisonsByCategory(comparisons);

  return (
    <div className="ss-comparisons">
      {grouped.map(({ category, comparisons: sectionComparisons }) => (
        <section key={category.id} className="ss-category-section">
          {showCategoryHeaders ? (
            <header className="ss-category-head">
              <div className="ss-category-head-main">
                <h2 className="ss-category-title">
                  <span lang="ja">{category.japanese}</span>
                  <span className="ss-category-en">{category.english}</span>
                </h2>
                <span className="ss-category-count">
                  {sectionComparisons.length}
                </span>
              </div>
              <p className="ss-category-desc">{category.description}</p>
            </header>
          ) : null}
          <div className="ss-comparison-section">
            {sectionComparisons.map((comparison) => (
              <ComparisonBlock
                key={comparison.group}
                comparison={comparison}
                onSpeakJp={onSpeakJp}
                activePlayId={activePlayId}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
