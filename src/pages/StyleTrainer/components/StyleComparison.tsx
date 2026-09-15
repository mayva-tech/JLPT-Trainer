import { FuriganaWrapText } from "../../../components/FuriganaWrapText";
import { HighlightedEnglish } from "../../../components/HighlightedEnglish";
import type { SpeechHighlight } from "../../../services/speechService";
import {
  groupComparisonsByCategory,
  type StyleComparison,
} from "../../../utils/speechStyles";
import {
  fieldHighlight,
  type StyleSpeakEn,
  type StyleSpeakJp,
  type StyleSpeechTarget,
} from "../styleSpeech";
import {
  NATURALNESS_LABELS,
  POLITENESS_LABELS,
  STRENGTH_LABELS,
} from "./styleLabels";

interface StyleComparisonListProps {
  comparisons: StyleComparison[];
  onSpeakJp: StyleSpeakJp;
  onSpeakEn: StyleSpeakEn;
  speechTarget?: StyleSpeechTarget | null;
  highlight?: SpeechHighlight | null;
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
  onSpeakEn,
  speechTarget,
  highlight,
  activePlayId,
  selectedId,
  onSelect,
}: {
  comparison: StyleComparison;
  onSpeakJp: StyleSpeakJp;
  onSpeakEn: StyleSpeakEn;
  speechTarget: StyleSpeechTarget | null;
  highlight: SpeechHighlight | null;
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
            <div className="ss-mini-jp" lang="ja">
              <FuriganaWrapText
                surface={item.japanese}
                reading={item.reading}
                className="ss-mini-jp-line"
                highlight={fieldHighlight(
                  speechTarget,
                  highlight,
                  item.id,
                  "headword"
                )}
              />
              <button
                type="button"
                className="ss-speak"
                aria-label={`Speak Japanese: ${item.japanese}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onSpeakJp(item.japanese, item.reading, {
                    id: item.id,
                    field: "headword",
                  });
                }}
              >
                🔊
              </button>
            </div>
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
            <div className="ss-mini-en-row">
              <HighlightedEnglish
                text={item.english}
                className="ss-mini-en"
                highlight={fieldHighlight(
                  speechTarget,
                  highlight,
                  item.id,
                  "english"
                )}
              />
              <button
                type="button"
                className="ss-speak"
                aria-label={`Speak English: ${item.english}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onSpeakEn(item.english, {
                    id: item.id,
                    field: "english",
                  });
                }}
              >
                🔊
              </button>
            </div>
            {item.example.japanese ? (
              <div className="ss-mini-example">
                <div className="ss-mini-example-jp" lang="ja">
                  <FuriganaWrapText
                    surface={item.example.japanese}
                    reading={item.example.reading}
                    className="ss-mini-example-line"
                    highlight={fieldHighlight(
                      speechTarget,
                      highlight,
                      item.id,
                      "example"
                    )}
                  />
                  <button
                    type="button"
                    className="ss-speak"
                    aria-label="Speak Japanese example"
                    onClick={(event) => {
                      event.stopPropagation();
                      onSpeakJp(item.example.japanese, item.example.reading, {
                        id: item.id,
                        field: "example",
                      });
                    }}
                  >
                    🔊
                  </button>
                </div>
                {item.example.english ? (
                  <div className="ss-mini-example-en-row">
                    <HighlightedEnglish
                      text={item.example.english}
                      className="ss-mini-example-en"
                      highlight={fieldHighlight(
                        speechTarget,
                        highlight,
                        item.id,
                        "example-en"
                      )}
                    />
                    <button
                      type="button"
                      className="ss-speak"
                      aria-label="Speak English example"
                      onClick={(event) => {
                        event.stopPropagation();
                        onSpeakEn(item.example.english, {
                          id: item.id,
                          field: "example-en",
                        });
                      }}
                    >
                      🔊
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
            {item.warning ? (
              <HighlightedEnglish
                text={item.warning}
                className="ss-mini-warning"
                highlight={fieldHighlight(
                  speechTarget,
                  highlight,
                  item.id,
                  "warning"
                )}
              />
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
  onSpeakEn,
  speechTarget = null,
  highlight = null,
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
                onSpeakEn={onSpeakEn}
                speechTarget={speechTarget}
                highlight={highlight}
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
