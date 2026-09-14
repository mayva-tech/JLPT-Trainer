import {
  LANGUAGE_STAT_KEYS,
  LANGUAGE_STAT_LABELS,
} from "../utils/languageStats";
import type { LanguageStats } from "../types";

type Props = {
  stats: LanguageStats;
};

export function LanguageStatsBars({ stats }: Props) {
  return (
    <div className="ppq-lang-stats">
      {LANGUAGE_STAT_KEYS.map((key) => {
        const value = stats[key];
        const labels = LANGUAGE_STAT_LABELS[key];
        return (
          <div className="ppq-lang-row" key={key}>
            <div className="ppq-lang-label">
              <span>
                {labels.japanese} {labels.english}
              </span>
              <span>{value}</span>
            </div>
            <div
              className="ppq-lang-track"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={value}
              aria-label={`${labels.english} ${value}`}
            >
              <div
                className="ppq-lang-fill"
                style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
