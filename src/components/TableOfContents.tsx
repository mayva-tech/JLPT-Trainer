import { useEffect, useState } from "react";
import type { TocGroup, TocItemId } from "../data/toc";
import { tocGroups } from "../data/toc";

type Props = {
  selectedId: TocItemId | null;
  onSelect: (id: TocItemId) => void;
};

type TocPage = 1 | 2 | 3 | 4;

/**
 * Left column on page 1: intro/ending/glossary, then interview lists
 * stacked under glossary.
 */
const COMPACT_COLUMN_ORDER = [
  "introduction",
  "ending",
  "reference",
  "practice",
  "practice-mix",
] as const;

const COMPACT_COLUMN_IDS = new Set<string>(COMPACT_COLUMN_ORDER);

/** Curated N1 browsing lenses — shown on TOC page 2. */
const N1_GROUP_IDS = new Set(["vocabulary-n1", "grammar-n1", "quiz-vocab-n1"]);

/** Casual ⇄ Formal register practice — TOC page 3. */
const REGISTER_GROUP_IDS = new Set(["register"]);

/** オノマトペ corpus — TOC page 4. */
const ONOMATOPOEIA_GROUP_IDS = new Set(["onomatopoeia"]);

function pageForSelectedId(selectedId: TocItemId | null): TocPage {
  if (!selectedId) return 1;
  for (const group of tocGroups) {
    if (group.items.some((item) => item.id === selectedId)) {
      if (N1_GROUP_IDS.has(group.id)) return 2;
      if (REGISTER_GROUP_IDS.has(group.id)) return 3;
      if (ONOMATOPOEIA_GROUP_IDS.has(group.id)) return 4;
      return 1;
    }
  }
  return 1;
}

function TocGroupSection({
  group,
  selectedId,
  onSelect,
}: {
  group: TocGroup;
  selectedId: TocItemId | null;
  onSelect: (id: TocItemId) => void;
}) {
  return (
    <section className="toc-group">
      <h2 className="toc-group-title">{group.title}</h2>
      <ul className="toc-list">
        {group.items.map((item) => {
          const active = item.id === selectedId;
          return (
            <li key={item.id}>
              <button
                type="button"
                className={active ? "toc-item toc-item--active" : "toc-item"}
                onClick={() => onSelect(item.id)}
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function TableOfContents({ selectedId, onSelect }: Props) {
  const [page, setPage] = useState<TocPage>(() =>
    pageForSelectedId(selectedId)
  );

  useEffect(() => {
    setPage(pageForSelectedId(selectedId));
  }, [selectedId]);

  const compactGroups = COMPACT_COLUMN_ORDER.map((id) =>
    tocGroups.find((g) => g.id === id)
  ).filter((g): g is TocGroup => Boolean(g));
  const page1MainGroups = tocGroups.filter(
    (g) =>
      !COMPACT_COLUMN_IDS.has(g.id) &&
      !N1_GROUP_IDS.has(g.id) &&
      !REGISTER_GROUP_IDS.has(g.id) &&
      !ONOMATOPOEIA_GROUP_IDS.has(g.id)
  );
  const page2Groups = tocGroups.filter((g) => N1_GROUP_IDS.has(g.id));
  const page3Groups = tocGroups.filter((g) => REGISTER_GROUP_IDS.has(g.id));
  const page4Groups = tocGroups.filter((g) =>
    ONOMATOPOEIA_GROUP_IDS.has(g.id)
  );

  return (
    <div className="safe-area toc-safe">
      <div className="toc-panel card-fade">
        <div className="category-chip">Table of Contents</div>
        <h1 className="toc-title">JLPT Trainer</h1>
        <p className="toc-subtitle">Select a section for recording</p>

        <div className="toc-page-nav" role="tablist" aria-label="TOC pages">
          <button
            type="button"
            role="tab"
            aria-selected={page === 1}
            className={
              page === 1 ? "toc-page-btn toc-page-btn--active" : "toc-page-btn"
            }
            onClick={() => setPage(1)}
          >
            Page 1 · N2
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={page === 2}
            className={
              page === 2 ? "toc-page-btn toc-page-btn--active" : "toc-page-btn"
            }
            onClick={() => setPage(2)}
          >
            Page 2 · N1
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={page === 3}
            className={
              page === 3 ? "toc-page-btn toc-page-btn--active" : "toc-page-btn"
            }
            onClick={() => setPage(3)}
          >
            Page 3 · Register
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={page === 4}
            className={
              page === 4 ? "toc-page-btn toc-page-btn--active" : "toc-page-btn"
            }
            onClick={() => setPage(4)}
          >
            Page 4 · オノマトペ
          </button>
        </div>

        {page === 1 ? (
          <div className="toc-groups toc-groups--page1">
            <div className="toc-column toc-column--compact">
              {compactGroups.map((group) => (
                <TocGroupSection
                  key={group.id}
                  group={group}
                  selectedId={selectedId}
                  onSelect={onSelect}
                />
              ))}
            </div>
            {page1MainGroups.map((group) => (
              <TocGroupSection
                key={group.id}
                group={group}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            ))}
          </div>
        ) : null}

        {page === 2 ? (
          <div className="toc-groups toc-groups--page2">
            {page2Groups.map((group) => (
              <TocGroupSection
                key={group.id}
                group={group}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            ))}
          </div>
        ) : null}

        {page === 3 ? (
          <div className="toc-groups toc-groups--page3">
            {page3Groups.map((group) => (
              <TocGroupSection
                key={group.id}
                group={group}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            ))}
          </div>
        ) : null}

        {page === 4 ? (
          <div className="toc-groups toc-groups--page3">
            {page4Groups.map((group) => (
              <TocGroupSection
                key={group.id}
                group={group}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
