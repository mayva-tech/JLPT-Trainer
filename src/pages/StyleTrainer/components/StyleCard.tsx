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
  onSpeak: (text: string) => void;
}

export function StyleCard({ item, onSpeak }: StyleCardProps) {
  return (
    <article className="ss-card" data-strength={item.strength}>
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
          aria-label={`Speak ${item.japanese}`}
          onClick={() => onSpeak(item.japanese)}
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
          {item.warning}
        </p>
      ) : null}

      <div className="ss-detail">
        <p className="ss-example-jp" lang="ja">
          {item.example.japanese}
          <button
            type="button"
            className="ss-speak"
            aria-label="Speak example"
            onClick={() => onSpeak(item.example.japanese)}
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
