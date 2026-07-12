import type { TocItemId } from "../data/toc";
import { lessonGroupIds, quizIds, getTocItem } from "../data/toc";

export type VideoFlowConfig = {
  includeIntro: boolean;
  lessonGroups: TocItemId[];
  quiz: TocItemId | null;
  includeEnding: boolean;
};

type Props = {
  config: VideoFlowConfig;
  onChange: (next: VideoFlowConfig) => void;
  onStart: () => void;
  onCancel: () => void;
};

export function VideoFlowSetup({ config, onChange, onStart, onCancel }: Props) {
  function toggleLesson(id: TocItemId) {
    const has = config.lessonGroups.includes(id);
    onChange({
      ...config,
      lessonGroups: has
        ? config.lessonGroups.filter((x) => x !== id)
        : [...config.lessonGroups, id],
    });
  }

  const canStart =
    config.includeIntro ||
    config.lessonGroups.length > 0 ||
    config.quiz !== null ||
    config.includeEnding;

  return (
    <div className="production-panel production-panel--flow">
      <div className="production-panel-title">Start Video Flow</div>
      <p className="production-panel-hint">
        English Intro → Japanese Intro → Lessons → Optional Quiz → Japanese CTA
        → English CTA
      </p>

      <label className="flow-check">
        <input
          type="checkbox"
          checked={config.includeIntro}
          onChange={(e) =>
            onChange({ ...config, includeIntro: e.target.checked })
          }
        />
        Customized Intro Hook
      </label>

      <div className="flow-section-label">Lesson groups</div>
      <div className="flow-checks">
        {lessonGroupIds.map((id) => {
          const item = getTocItem(id);
          return (
            <label key={id} className="flow-check">
              <input
                type="checkbox"
                checked={config.lessonGroups.includes(id)}
                onChange={() => toggleLesson(id)}
              />
              {item?.label ?? id}
            </label>
          );
        })}
      </div>

      <div className="flow-section-label">Optional quiz</div>
      <select
        className="flow-select"
        value={config.quiz ?? ""}
        onChange={(e) =>
          onChange({
            ...config,
            quiz: (e.target.value || null) as TocItemId | null,
          })
        }
      >
        <option value="">None</option>
        {quizIds.map((id) => {
          const item = getTocItem(id);
          return (
            <option key={id} value={id}>
              {item?.label ?? id}
            </option>
          );
        })}
      </select>

      <label className="flow-check">
        <input
          type="checkbox"
          checked={config.includeEnding}
          onChange={(e) =>
            onChange({ ...config, includeEnding: e.target.checked })
          }
        />
        Customized Ending CTA
      </label>

      <div className="production-actions">
        <button type="button" onClick={onStart} disabled={!canStart}>
          Start Flow
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
