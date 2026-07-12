import type { TocItemId } from "../data/toc";
import { tocGroups } from "../data/toc";

type Props = {
  selectedId: TocItemId | null;
  onSelect: (id: TocItemId) => void;
};

export function TableOfContents({ selectedId, onSelect }: Props) {
  return (
    <div className="safe-area toc-safe">
      <div className="toc-panel card-fade">
        <div className="category-chip">Table of Contents</div>
        <h1 className="toc-title">JLPT Trainer</h1>
        <p className="toc-subtitle">Select a section for recording</p>

        <div className="toc-groups">
          {tocGroups.map((group) => (
            <section key={group.id} className="toc-group">
              <h2 className="toc-group-title">{group.title}</h2>
              <ul className="toc-list">
                {group.items.map((item) => {
                  const active = item.id === selectedId;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={
                          active ? "toc-item toc-item--active" : "toc-item"
                        }
                        onClick={() => onSelect(item.id)}
                      >
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
