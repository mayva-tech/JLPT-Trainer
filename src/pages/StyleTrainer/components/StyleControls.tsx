import {
  STYLE_CATEGORIES,
  STYLE_LEVELS,
  STYLE_POLITENESS,
} from "../../../data/speechStyles";
import {
  styleCountByCategory,
  styleCountByGender,
  styleCountByLevel,
  styleTotal,
  type CategoryFilter,
  type GenderFilter,
  type LevelFilter,
  type PolitenessFilter,
  type StyleStats,
} from "../../../utils/speechStyles";
import { POLITENESS_LABELS } from "./styleLabels";

/* ---- StyleStatsBar ---- */

export function StyleStatsBar({ stats }: { stats: StyleStats }) {
  return (
    <div className="ss-stats">
      <div className="ss-stat">
        <span className="ss-stat-value">{stats.total}</span>
        <span className="ss-stat-label">Total</span>
      </div>
      <div className="ss-stat">
        <span className="ss-stat-value">{stats.feminine}</span>
        <span className="ss-stat-label">Feminine</span>
      </div>
      <div className="ss-stat">
        <span className="ss-stat-value">{stats.neutral}</span>
        <span className="ss-stat-label">Neutral</span>
      </div>
      <div className="ss-stat">
        <span className="ss-stat-value">{stats.masculine}</span>
        <span className="ss-stat-label">Masculine</span>
      </div>
      <div className="ss-stat">
        <span className="ss-stat-value">{stats.modern}</span>
        <span className="ss-stat-label">Modern</span>
      </div>
      <div className="ss-stat">
        <span className="ss-stat-value">{stats.fiction}</span>
        <span className="ss-stat-label">Fiction</span>
      </div>
    </div>
  );
}

/* ---- StyleFilters ---- */

interface StyleFiltersProps {
  search: string;
  onSearch: (value: string) => void;
  gender: GenderFilter;
  onGender: (value: GenderFilter) => void;
  level: LevelFilter;
  onLevel: (value: LevelFilter) => void;
  category: CategoryFilter;
  onCategory: (value: CategoryFilter) => void;
  politeness: PolitenessFilter;
  onPoliteness: (value: PolitenessFilter) => void;
  modernOnly: boolean;
  onModernOnly: (value: boolean) => void;
  showRough: boolean;
  onShowRough: (value: boolean) => void;
  showAnime: boolean;
  onShowAnime: (value: boolean) => void;
  total: number;
}

export function StyleFilters({
  search,
  onSearch,
  gender,
  onGender,
  level,
  onLevel,
  category,
  onCategory,
  politeness,
  onPoliteness,
  modernOnly,
  onModernOnly,
  showRough,
  onShowRough,
  showAnime,
  onShowAnime,
  total,
}: StyleFiltersProps) {
  return (
    <div className="ss-filters">
      <div className="ss-search">
        <label htmlFor="ss-search" className="ss-visually-hidden">
          Search expressions
        </label>
        <input
          id="ss-search"
          type="search"
          className="ss-search-input"
          placeholder="Search 俺, おれ, ore, blunt…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
        {search ? (
          <button
            type="button"
            className="ss-search-clear"
            aria-label="Clear search"
            onClick={() => onSearch("")}
          >
            ×
          </button>
        ) : null}
      </div>

      <div className="ss-chips" role="group" aria-label="Gender lean">
        <button
          type="button"
          className="ss-chip"
          aria-pressed={gender === "all"}
          onClick={() => onGender("all")}
        >
          All
          <span className="ss-chip-count">{styleTotal}</span>
        </button>
        {(
          [
            ["feminine", "Feminine"],
            ["neutral", "Neutral"],
            ["masculine", "Masculine"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className="ss-chip"
            data-gender={id}
            aria-pressed={gender === id}
            onClick={() => onGender(id)}
          >
            {label}
            <span className="ss-chip-count">{styleCountByGender[id]}</span>
          </button>
        ))}
      </div>

      <div className="ss-chips" role="group" aria-label="JLPT level">
        <button
          type="button"
          className="ss-chip"
          aria-pressed={level === "all"}
          onClick={() => onLevel("all")}
        >
          All levels
        </button>
        {STYLE_LEVELS.map((l) => (
          <button
            key={l}
            type="button"
            className="ss-chip"
            aria-pressed={level === l}
            onClick={() => onLevel(l)}
          >
            {l}
            <span className="ss-chip-count">{styleCountByLevel[l]}</span>
          </button>
        ))}
      </div>

      <div className="ss-chips" role="group" aria-label="Category">
        <button
          type="button"
          className="ss-chip"
          aria-pressed={category === "all"}
          onClick={() => onCategory("all")}
        >
          All categories
        </button>
        {STYLE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className="ss-chip"
            aria-pressed={category === cat.id}
            onClick={() => onCategory(cat.id)}
            title={cat.description}
          >
            {cat.japanese}
            <span className="ss-chip-count">
              {styleCountByCategory[cat.id]}
            </span>
          </button>
        ))}
      </div>

      <div className="ss-chips" role="group" aria-label="Politeness">
        <button
          type="button"
          className="ss-chip"
          aria-pressed={politeness === "all"}
          onClick={() => onPoliteness("all")}
        >
          All formality
        </button>
        {STYLE_POLITENESS.map((p) => (
          <button
            key={p}
            type="button"
            className="ss-chip"
            aria-pressed={politeness === p}
            onClick={() => onPoliteness(p)}
          >
            {POLITENESS_LABELS[p]}
          </button>
        ))}
      </div>

      <div className="ss-toggles">
        <label className="ss-toggle">
          <input
            type="checkbox"
            checked={modernOnly}
            onChange={(e) => onModernOnly(e.target.checked)}
          />
          Modern &amp; common only
        </label>
        <label className="ss-toggle">
          <input
            type="checkbox"
            checked={showRough}
            onChange={(e) => onShowRough(e.target.checked)}
          />
          Show rough Japanese
        </label>
        <label className="ss-toggle">
          <input
            type="checkbox"
            checked={showAnime}
            onChange={(e) => onShowAnime(e.target.checked)}
          />
          Show anime Japanese
        </label>
      </div>

      <div className="ss-filter-foot">
        <p className="ss-result-count">{total} matching</p>
      </div>
    </div>
  );
}
