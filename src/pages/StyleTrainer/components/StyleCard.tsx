import type { StyleExpression } from "../../../types/speechStyle";
import {
  NATURALNESS_LABELS,
  POLITENESS_LABELS,
  RELATIONSHIP_LABELS,
  SPEAKER_LABELS,
  STRENGTH_LABELS,
} from "./styleLabels";

interface StyleCardProps {
  item: StyleExpression;
  onSpeakJp: (text: string, reading?: string) => void;
  active?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

function cardClassName(active: boolean, selected: boolean): string {
  const parts = ["ss-card"];
  if (selected) parts.push("ss-card--selected");
  if (active) parts.push("ss-card--playing");
  return parts.join(" ");
}

export function StyleCard({
  item,
  onSpeakJp,
  active = false,
  selected = false,
  onSelect,
}: StyleCardProps) {
  return (
    <article
      className={cardClassName(active, selected)}
      data-strength={item.strength}
      aria-pressed={selected}
      onClick={() => onSelect?.(item.id)}
    >
      <div className="ss-card-head">
        <span className="ss-strength" data-strength={item.strength}>
          {STRENGTH_LABELS[item.strength]}
        </span>
        <span className="ss-meta">
          <span className="ss-meta-chip">{item.jlptLevel}</span>
          <span className="ss-meta-chip" data-value={item.politeness}>
            {POLITENESS_LABELS[item.politeness]}
          </span>
          <span className="ss-meta-chip" data-value={item.naturalness}>
            {NATURALNESS_LABELS[item.naturalness]}
          </span>
        </span>
      </div>

      <p className="ss-jp" lang="ja">
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
      <p className="ss-reading" lang="ja">
        {item.reading}
        <span className="ss-romaji">{item.romaji}</span>
      </p>
      <p className="ss-english">{item.english}</p>

      {item.warning ? (
        <p className="ss-warning">
          <span className="ss-warning-label">Warning</span>
          <span className="ss-warning-body">
            {item.warning}
          </span>
        </p>
      ) : null}

      <div className="ss-detail">
        <p className="ss-example-jp" lang="ja">
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
        <p className="ss-example-reading" lang="ja">
          {item.example.reading}
        </p>
        <p className="ss-example-en">{item.example.english}</p>

        <dl className="ss-usage">
          <div>
            <dt>Speakers</dt>
            <dd>
              {item.speakers.map((s) => SPEAKER_LABELS[s]).join(" · ")}
            </dd>
          </div>
          <div>
            <dt>Relationships</dt>
            <dd>
              {item.relationships
                .map((r) => RELATIONSHIP_LABELS[r])
                .join(" · ")}
            </dd>
          </div>
          {item.alternative ? (
            <div>
              <dt>Alternative</dt>
              <dd lang="ja">{item.alternative}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </article>
  );
}
