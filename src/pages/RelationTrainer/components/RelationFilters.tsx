import {
  WORD_RELATION_LEVELS,
  WORD_RELATION_TYPE_LABELS,
} from "../../../data/wordRelations";
import {
  wordRelationCountByLevel,
  wordRelationCountByType,
  type LevelFilter,
  type RelationSort,
  type TypeFilter,
} from "../../../utils/wordRelations";

interface Props {
  search: string;
  onSearch: (value: string) => void;
  level: LevelFilter;
  onLevel: (value: LevelFilter) => void;
  type: TypeFilter;
  onType: (value: TypeFilter) => void;
  sort: RelationSort;
  onSort: (value: RelationSort) => void;
  showSort: boolean;
  total: number;
}

const SORT_OPTIONS: { value: RelationSort; label: string }[] = [
  { value: "level", label: "Level" },
  { value: "japanese", label: "Japanese" },
  { value: "english", label: "English" },
  { value: "random", label: "Random" },
];

export function RelationFilters({
  search,
  onSearch,
  level,
  onLevel,
  type,
  onType,
  sort,
  onSort,
  showSort,
  total,
}: Props) {
  const totalAll = WORD_RELATION_LEVELS.reduce(
    (sum, item) => sum + wordRelationCountByLevel[item],
    0
  );

  return (
    <div className="rt-filters">
      <div className="rt-search">
        <label htmlFor="rt-search" className="rt-visually-hidden">
          Search relations
        </label>
        <input
          id="rt-search"
          className="rt-search-input"
          type="search"
          placeholder="Search Japanese, reading, or English…"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
        />
        {search ? (
          <button
            type="button"
            className="rt-search-clear"
            aria-label="Clear search"
            onClick={() => onSearch("")}
          >
            ×
          </button>
        ) : null}
      </div>

      <div className="rt-chips" role="group" aria-label="JLPT level">
        <button
          type="button"
          className="rt-chip"
          aria-pressed={level === "all"}
          onClick={() => onLevel("all")}
        >
          All
          <span className="rt-chip-count">{totalAll}</span>
        </button>
        {WORD_RELATION_LEVELS.map((item) => (
          <button
            key={item}
            type="button"
            className="rt-chip"
            data-level={item}
            aria-pressed={level === item}
            onClick={() => onLevel(item)}
          >
            {item}
            <span className="rt-chip-count">{wordRelationCountByLevel[item]}</span>
          </button>
        ))}
      </div>

      <div className="rt-chips" role="group" aria-label="Relationship type">
        <button
          type="button"
          className="rt-chip"
          aria-pressed={type === "all"}
          onClick={() => onType("all")}
        >
          All types
          <span className="rt-chip-count">{totalAll}</span>
        </button>
        {(Object.keys(WORD_RELATION_TYPE_LABELS) as Array<
          keyof typeof WORD_RELATION_TYPE_LABELS
        >).map((key) => {
          const label = WORD_RELATION_TYPE_LABELS[key];
          return (
            <button
              key={key}
              type="button"
              className="rt-chip"
              data-type={key}
              aria-pressed={type === key}
              onClick={() => onType(key)}
            >
              {label.symbol} {label.japanese}
              <span className="rt-chip-en">{label.english}</span>
              <span className="rt-chip-count">{wordRelationCountByType[key]}</span>
            </button>
          );
        })}
      </div>

      <div className="rt-filter-foot">
        <p className="rt-result-count">
          {total} {total === 1 ? "relation" : "relations"}
        </p>
        {showSort ? (
          <label className="rt-sort">
            Sort
            <select
              value={sort}
              onChange={(event) => onSort(event.target.value as RelationSort)}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
    </div>
  );
}
