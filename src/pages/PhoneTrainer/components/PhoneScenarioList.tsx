import type { PhoneScenario, PhoneStatus } from "../../../types/phoneCall";
import { getPhoneCategory } from "../../../utils/phoneCalls";
import { PhoneLevelBadge } from "./PhoneControls";

interface PhoneScenarioListProps {
  scenarios: readonly PhoneScenario[];
  statusOf: (id: string) => PhoneStatus;
  isFavourite: (id: string) => boolean;
  onOpen: (id: string) => void;
  onToggleFavourite: (id: string) => void;
}

export function PhoneScenarioList({
  scenarios,
  statusOf,
  isFavourite,
  onOpen,
  onToggleFavourite,
}: PhoneScenarioListProps) {
  if (scenarios.length === 0) {
    return (
      <div className="pt-empty">
        No scenarios match your filters.
        <br />
        Try broadening your search or changing the level / category.
      </div>
    );
  }

  return (
    <ul className="pt-list">
      {scenarios.map((scenario) => {
        const status = statusOf(scenario.id);
        const category = getPhoneCategory(scenario.category);

        return (
          <li
            key={scenario.id}
            className="pt-list-item"
            data-status={status}
          >
            <button
              type="button"
              className="pt-list-open"
              onClick={() => onOpen(scenario.id)}
            >
              <span className="pt-list-head">
                <PhoneLevelBadge level={scenario.jlptLevel} />
                <span className="pt-list-category" lang="ja">
                  {category?.japanese}
                </span>
                {status !== "new" && (
                  <span className="pt-list-status" data-status={status}>
                    {status}
                  </span>
                )}
              </span>
              <span className="pt-list-title" lang="ja">
                {scenario.title}
              </span>
              <span className="pt-list-title-en">{scenario.titleEn}</span>
              <span className="pt-list-situation">{scenario.situation}</span>
              <span className="pt-list-meta">
                {scenario.dialogue.length} lines · {scenario.keyPhrases.length}{" "}
                phrases · {scenario.vocabulary.length} words
              </span>
            </button>
            <button
              type="button"
              className="pt-fav"
              aria-pressed={isFavourite(scenario.id)}
              aria-label="Toggle favourite"
              onClick={() => onToggleFavourite(scenario.id)}
            >
              {isFavourite(scenario.id) ? "★" : "☆"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
