import type { SpeechHighlight } from "../../../services/speechService";
import type { StyleCategoryGroup } from "../../../utils/speechStyles";
import {
  type StyleSpeakJp,
  type StyleSpeechTarget,
} from "../styleSpeech";
import { StyleCard } from "./StyleCard";

interface StyleBrowseListProps {
  groups: StyleCategoryGroup[];
  onSpeakJp: StyleSpeakJp;
  speechTarget?: StyleSpeechTarget | null;
  highlight?: SpeechHighlight | null;
  activePlayId?: string | null;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  showCategoryHeaders?: boolean;
}

export function StyleBrowseList({
  groups,
  onSpeakJp,
  speechTarget = null,
  highlight = null,
  activePlayId = null,
  selectedId = null,
  onSelect,
  showCategoryHeaders = true,
}: StyleBrowseListProps) {
  return (
    <div className="ss-browse-sections">
      {groups.map(({ category, items }) => (
        <section key={category.id} className="ss-category-section">
          {showCategoryHeaders ? (
            <header className="ss-category-head">
              <div className="ss-category-head-main">
                <h2 className="ss-category-title">
                  <span lang="ja">{category.japanese}</span>
                  <span className="ss-category-en">{category.english}</span>
                </h2>
                <span className="ss-category-count">{items.length}</span>
              </div>
              <p className="ss-category-desc">{category.description}</p>
            </header>
          ) : null}
          <div className="ss-grid">
            {items.map((item) => (
              <StyleCard
                key={item.id}
                item={item}
                onSpeakJp={onSpeakJp}
                speechTarget={speechTarget}
                highlight={highlight}
                active={activePlayId === item.id}
                selected={selectedId === item.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
