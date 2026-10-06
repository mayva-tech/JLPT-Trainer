import { useEffect, useState } from "react";
import type { TocGroup, TocItem, TocItemId } from "../data/toc";
import { tocGroups } from "../data/toc";
import { formatWeakWordsTocLabel } from "../utils/weakWordsDiscoverability";

type Props = {
  selectedId: TocItemId | null;
  onSelect: (id: TocItemId) => void;
  /** Live weak-item count for runtime Weak Words label only. */
  weakWordsCount?: number;
};

type TocPage = 1 | 2 | 3 | 4 | 5 | 6;

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

/**
 * TOC pages by JLPT level (the YouTube playlists), then practice pages.
 * Page 1 also holds the compact column and any group not placed elsewhere.
 */
const PAGES: readonly { page: TocPage; label: string; groupIds: readonly string[] }[] = [
  { page: 1, label: "N5–N4", groupIds: ["playlist-lessons-n5", "playlist-quizzes-n5", "playlist-lessons-n4", "playlist-quizzes-n4"] },
  { page: 2, label: "N3", groupIds: ["playlist-lessons-n3", "playlist-quizzes-n3", "grammar-n3", "quiz-grammar-n3"] },
  { page: 3, label: "N2", groupIds: ["playlist-lessons-n2", "playlist-quizzes-n2", "grammar", "quiz-grammar"] },
  { page: 4, label: "N1", groupIds: ["playlist-lessons-n1", "playlist-quizzes-n1", "grammar-n1"] },
  { page: 5, label: "Register", groupIds: ["register"] },
  { page: 6, label: "オノマトペ", groupIds: ["onomatopoeia"] },
];

const PAGE_OF_GROUP = new Map<string, TocPage>(
  PAGES.flatMap((p) => p.groupIds.map((id) => [id, p.page] as const))
);

function groupsForPage(page: TocPage): TocGroup[] {
  const ids = PAGES.find((p) => p.page === page)?.groupIds ?? [];
  return ids
    .map((id) => tocGroups.find((g) => g.id === id))
    .filter((g): g is TocGroup => Boolean(g));
}

function pageForSelectedId(selectedId: TocItemId | null): TocPage {
  if (!selectedId) return 1;
  const group = tocGroups.find((g) => g.items.some((item) => item.id === selectedId));
  return (group && PAGE_OF_GROUP.get(group.id)) ?? 1;
}

function tocItemLabel(item: TocItem, weakWordsCount: number): string {
  if (item.id === "weak-words") {
    return formatWeakWordsTocLabel(weakWordsCount);
  }
  return item.label;
}

function TocGroupSection({
  group,
  selectedId,
  onSelect,
  weakWordsCount,
}: {
  group: TocGroup;
  selectedId: TocItemId | null;
  onSelect: (id: TocItemId) => void;
  weakWordsCount: number;
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
                {tocItemLabel(item, weakWordsCount)}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function TableOfContents({
  selectedId,
  onSelect,
  weakWordsCount = 0,
}: Props) {
  const [page, setPage] = useState<TocPage>(() =>
    pageForSelectedId(selectedId)
  );

  useEffect(() => {
    setPage(pageForSelectedId(selectedId));
  }, [selectedId]);

  const compactGroups = COMPACT_COLUMN_ORDER.map((id) =>
    tocGroups.find((g) => g.id === id)
  ).filter((g): g is TocGroup => Boolean(g));
  const page1MainGroups = [
    ...groupsForPage(1),
    ...tocGroups.filter((g) => !COMPACT_COLUMN_IDS.has(g.id) && !PAGE_OF_GROUP.has(g.id)),
  ];

  return (
    <div className="safe-area toc-safe">
      <div className="toc-panel card-fade">
        <div className="category-chip">Table of Contents</div>
        <h1 className="toc-title">JLPT Trainer</h1>
        <p className="toc-subtitle">Select a section for recording</p>

        <div className="toc-page-nav" role="tablist" aria-label="TOC pages">
          {PAGES.map((p) => (
            <button
              key={p.page}
              type="button"
              role="tab"
              aria-selected={page === p.page}
              className={page === p.page ? "toc-page-btn toc-page-btn--active" : "toc-page-btn"}
              onClick={() => setPage(p.page)}
            >
              Page {p.page} · {p.label}
            </button>
          ))}
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
                  weakWordsCount={weakWordsCount}
                />
              ))}
            </div>
            {page1MainGroups.map((group) => (
              <TocGroupSection
                key={group.id}
                group={group}
                selectedId={selectedId}
                onSelect={onSelect}
                weakWordsCount={weakWordsCount}
              />
            ))}
          </div>
        ) : null}

        {page !== 1 ? (
          <div className={page >= 5 ? "toc-groups toc-groups--page3" : "toc-groups toc-groups--page2"}>
            {groupsForPage(page).map((group) => (
              <TocGroupSection
                key={group.id}
                group={group}
                selectedId={selectedId}
                onSelect={onSelect}
                weakWordsCount={weakWordsCount}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
