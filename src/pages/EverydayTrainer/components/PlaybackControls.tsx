import type { SpeechRateMode } from "../../../services/speechPreferences";
import type { PlayOrder } from "../everydayProgress";

const ORDERS: { id: PlayOrder; label: string; title: string }[] = [
  { id: "jp", label: "JP", title: "Japanese only" },
  { id: "en", label: "EN", title: "English only" },
  { id: "jp-en", label: "JP → EN", title: "Japanese, then English" },
  { id: "en-jp", label: "EN → JP", title: "English, then Japanese" },
];

const SPEEDS: { id: SpeechRateMode; label: string }[] = [
  { id: "slow", label: "Slow" },
  { id: "normal", label: "Normal" },
  { id: "fast", label: "Fast" },
];

/** Play order (per trainer) and voice speed (the app-wide speech preference). */
export function PlaybackControls({
  order,
  onOrder,
  rateMode,
  onRateMode,
}: {
  order: PlayOrder;
  onOrder: (order: PlayOrder) => void;
  rateMode: SpeechRateMode;
  onRateMode: (mode: SpeechRateMode) => void;
}) {
  return (
    <div className="ev-controls">
      <div className="ev-seg" role="group" aria-label="Audio order">
        {ORDERS.map((o) => (
          <button
            key={o.id}
            type="button"
            title={o.title}
            className={order === o.id ? "ev-seg-btn ev-seg-btn--on" : "ev-seg-btn"}
            aria-pressed={order === o.id}
            onClick={() => onOrder(o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>
      <div className="ev-seg" role="group" aria-label="Voice speed">
        {SPEEDS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={rateMode === s.id ? "ev-seg-btn ev-seg-btn--on" : "ev-seg-btn"}
            aria-pressed={rateMode === s.id}
            onClick={() => onRateMode(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
