import type { TocGroup, TocItemId } from "../data/toc";
import { tocGroups } from "../data/toc";

type Props = {
  selectedId: TocItemId | null;
  onSelect: (id: TocItemId) => void;
};

/** Short groups stacked in the first column to free space for quiz columns. */
const COMPACT_COLUMN_IDS = new Set(["introduction", "ending", "reference"]);

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
  const compactGroups = tocGroups.filter((g) => COMPACT_COLUMN_IDS.has(g.id));
  const mainGroups = tocGroups.filter((g) => !COMPACT_COLUMN_IDS.has(g.id));

  return (
    <div className="safe-area toc-safe">
      <div className="toc-panel card-fade">
        <div className="category-chip">Table of Contents</div>
        <h1 className="toc-title">JLPT Trainer</h1>
        <p className="toc-subtitle">Select a section for recording</p>

        <div className="toc-groups">
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
          {mainGroups.map((group) => (
            <TocGroupSection
              key={group.id}
              group={group}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
