import { PHONE_CATEGORIES, PHONE_LEVELS } from "../../../data/phoneCalls";
import {
  phoneCountByCategory,
  phoneCountByLevel,
  type PhoneCategoryFilter,
  type PhoneLevelFilter,
  type PhoneStats as PhoneStatsType,
} from "../../../utils/phoneCalls";
import type { PhoneLevel } from "../../../types/phoneCall";

/* ---- PhoneLevelBadge ---- */

export function PhoneLevelBadge({ level }: { level: PhoneLevel }) {
  return (
    <span className="pt-level" data-level={level}>
      {level}
    </span>
  );
}

/* ---- PhoneStats ---- */

export function PhoneStats({ stats }: { stats: PhoneStatsType }) {
  return (
    <div className="pt-stats">
      <div className="pt-stat">
        <span className="pt-stat-value">{stats.total}</span>
        <span className="pt-stat-label">Total</span>
      </div>
      <div className="pt-stat">
        <span className="pt-stat-value">{stats.practised}</span>
        <span className="pt-stat-label">Practised</span>
      </div>
      <div className="pt-stat">
        <span className="pt-stat-value">{stats.mastered}</span>
        <span className="pt-stat-label">Mastered</span>
      </div>
      <div className="pt-stat">
        <span className="pt-stat-value">{stats.remaining}</span>
        <span className="pt-stat-label">Remaining</span>
      </div>
      <div className="pt-stat">
        <span className="pt-stat-value">{stats.favourites}</span>
        <span className="pt-stat-label">★ Favourites</span>
      </div>
    </div>
  );
}

/* ---- PhoneFilters ---- */

interface PhoneFiltersProps {
  search: string;
  onSearch: (value: string) => void;
  level: PhoneLevelFilter;
  onLevel: (value: PhoneLevelFilter) => void;
  category: PhoneCategoryFilter;
  onCategory: (value: PhoneCategoryFilter) => void;
  favouritesOnly: boolean;
  onFavouritesOnly: (value: boolean) => void;
  total: number;
  onRandom: () => void;
}

export function PhoneFilters({
  search,
  onSearch,
  level,
  onLevel,
  category,
  onCategory,
  favouritesOnly,
  onFavouritesOnly,
  total,
  onRandom,
}: PhoneFiltersProps) {
  return (
    <div className="pt-filters">
      <div className="pt-search">
        <input
          type="text"
          className="pt-search-input"
          placeholder="Search scenarios, phrases, vocabulary…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
        {search && (
          <button
            type="button"
            className="pt-search-clear"
            aria-label="Clear search"
            onClick={() => onSearch("")}
          >
            ×
          </button>
        )}
      </div>

      <div className="pt-chips" role="group" aria-label="Filter by level">
        {PHONE_LEVELS.map((l) => (
          <button
            key={l}
            type="button"
            className="pt-chip"
            data-level={l}
            aria-pressed={level === l}
            onClick={() => onLevel(level === l ? "all" : l)}
          >
            {l}
            <span className="pt-chip-count">{phoneCountByLevel[l]}</span>
          </button>
        ))}
      </div>

      <div className="pt-chips" role="group" aria-label="Filter by category">
        {PHONE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className="pt-chip"
            aria-pressed={category === cat.id}
            onClick={() => onCategory(category === cat.id ? "all" : cat.id)}
          >
            <span lang="ja">{cat.japanese}</span>
            <span className="pt-chip-count">{phoneCountByCategory[cat.id]}</span>
          </button>
        ))}
      </div>

      <div className="pt-filter-foot">
        <p className="pt-result-count">
          {total} scenario{total !== 1 ? "s" : ""}
        </p>
        <div className="pt-filter-actions">
          <button
            type="button"
            className="pt-btn"
            aria-pressed={favouritesOnly}
            onClick={() => onFavouritesOnly(!favouritesOnly)}
          >
            {favouritesOnly ? "★ Favourites" : "☆ Favourites"}
          </button>
          <button
            type="button"
            className="pt-btn pt-btn--primary"
            onClick={onRandom}
            disabled={total === 0}
          >
            Random
          </button>
        </div>
      </div>
    </div>
  );
}
