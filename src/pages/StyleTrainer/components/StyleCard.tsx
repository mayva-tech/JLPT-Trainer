import { FuriganaWrapText } from "../../../components/FuriganaWrapText";
import { HighlightedEnglish } from "../../../components/HighlightedEnglish";
import type { SpeechHighlight } from "../../../services/speechService";
import type { StyleExpression } from "../../../types/speechStyle";
import {
  fieldHighlight,
  type StyleSpeakJp,
  type StyleSpeechTarget,
} from "../styleSpeech";
import {
  NATURALNESS_LABELS,
  POLITENESS_LABELS,
  RELATIONSHIP_LABELS,
  SPEAKER_LABELS,
  STRENGTH_LABELS,
} from "./styleLabels";

interface StyleCardProps {
  item: StyleExpression;
  onSpeakJp: StyleSpeakJp;
  speechTarget?: StyleSpeechTarget | null;
  highlight?: SpeechHighlight | null;
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
  speechTarget = null,
  highlight = null,
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

      <div className="ss-jp" lang="ja">
        <FuriganaWrapText
          surface={item.japanese}
          reading={item.reading}
          className="ss-jp-line"
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
      {item.romaji ? <p className="ss-romaji-line">{item.romaji}</p> : null}
      <HighlightedEnglish
        text={item.english}
        className="ss-english"
        highlight={fieldHighlight(
          speechTarget,
          highlight,
          item.id,
          "english"
        )}
      />

      {item.warning ? (
        <div className="ss-warning">
          <span className="ss-warning-label">Warning</span>
          <HighlightedEnglish
            text={item.warning}
            className="ss-warning-body"
            highlight={fieldHighlight(
              speechTarget,
              highlight,
              item.id,
              "warning"
            )}
          />
        </div>
      ) : null}

      <div className="ss-detail">
        <div className="ss-example-jp" lang="ja">
          <FuriganaWrapText
            surface={item.example.japanese}
            reading={item.example.reading}
            className="ss-example-line"
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
        <HighlightedEnglish
          text={item.example.english}
          className="ss-example-en"
          highlight={fieldHighlight(
            speechTarget,
            highlight,
            item.id,
            "example-en"
          )}
        />

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
