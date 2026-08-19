import { FuriganaWrapText } from "../../../components/FuriganaWrapText";
import { WORD_RELATION_TYPE_LABELS } from "../../../data/wordRelations";
import type { WordRelationLevel, WordRelationType } from "../../../types/wordRelation";

interface Props {
  type: WordRelationType;
  level?: WordRelationLevel;
}

const TYPE_READING: Record<WordRelationType, string> = {
  synonym: "るいぎご",
  antonym: "はんたいご",
};

/** English relationship label, with optional level + Japanese type above it. */
export function RelationTypeBanner({ type, level }: Props) {
  const label = WORD_RELATION_TYPE_LABELS[type];

  return (
    <div className="rt-type-banner-wrap">
      {level ? (
        <div className="rt-type-banner-meta">
          <span className="rt-level" data-level={level}>
            {level}
          </span>
          <span className="rt-type" data-type={type}>
            <span aria-hidden="true">{label.symbol}</span>
            <FuriganaWrapText
              surface={label.japanese}
              reading={TYPE_READING[type]}
              className="rt-type-jp"
              showFurigana
            />
            <span className="rt-type-en">{label.english}</span>
          </span>
        </div>
      ) : null}
      <p className="rt-type-banner" data-type={type}>
        {label.english}
      </p>
    </div>
  );
}
