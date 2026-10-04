import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  getSenseiSettings,
  setSenseiSettings,
  subscribeToSenseiSettings,
} from "../../services/senseiBus";
import { SENSEI_NAMES } from "../Sensei/senseiTips";
import { CostumePicker } from "./CostumePicker";
import type { Voice } from "./duo";
import {
  costumeOf,
  cycleHeadLook,
  getHeadStyle,
  lookOf,
  subscribeHeadStyle,
  wearHeadCostume,
} from "./headStyleStore";
import "./talking-head.css";

const PEOPLE: readonly { voice: Voice; name: string }[] = [
  { voice: "ja", name: "Nanami" },
  { voice: "en", name: "Andrew" },
];

/** The mascot's swap (tanuki ↔ neko) and show / hide, beside the heads' buttons. */
function SenseiButtons() {
  const [settings, setSettings] = useState(getSenseiSettings);
  useEffect(() => subscribeToSenseiSettings(setSettings), []);
  const { character, enabled } = settings;
  const name = SENSEI_NAMES[character].en;
  const other = SENSEI_NAMES[character === "tanuki" ? "neko" : "tanuki"].en;
  return (
    <span className="head-style-group" role="group" aria-label="Sensei mascot">
      <span className="head-style-name" aria-hidden="true">
        {character === "tanuki" ? "Tanuki" : "Neko"}
      </span>
      <button
        type="button"
        className="head-style-btn"
        tabIndex={-1}
        aria-label={`Swap ${name} for ${other}`}
        title={`Swap to ${other}`}
        onClick={() => setSenseiSettings({ character: character === "tanuki" ? "neko" : "tanuki" })}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true" className="head-style-icon head-style-icon--swap">
          <path d="M3 5.5 H12 M9.5 3 L12 5.5 L9.5 8" />
          <path d="M13 10.5 H4 M6.5 8 L4 10.5 L6.5 13" />
        </svg>
      </button>
      <button
        type="button"
        className={enabled ? "head-style-btn head-style-btn--on" : "head-style-btn"}
        tabIndex={-1}
        aria-pressed={enabled}
        aria-label={enabled ? `Hide ${name}` : `Show ${name}`}
        title={`${name}: ${enabled ? "shown" : "hidden"}`}
        onClick={() => setSenseiSettings({ enabled: !enabled })}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true" className="head-style-icon head-style-icon--leaf">
          <path d="M2.5 13.5 Q1.8 4.8 13 2.4 Q14.6 11.2 4.8 12.8 Z" />
          <path d="M2.5 13.5 L11 4" />
        </svg>
      </button>
    </span>
  );
}

/**
 * Separate look and costume (hanger menu) buttons for Nanami and Andrew, plus the Sensei
 * mascot's, for the Player's control bar. Shift-click a look button for the
 * previous look.
 */
export default function HeadStyleButtons() {
  const { lookIds, costume } = useSyncExternalStore(subscribeHeadStyle, getHeadStyle);
  /** Whose costume menu is open, if any. */
  const [picking, setPicking] = useState<Voice | null>(null);
  const closePicker = useCallback(() => setPicking(null), []);
  return (
    <span className="head-style-bar">
      {PEOPLE.map(({ voice, name }) => {
        const look = lookOf(voice, lookIds).label;
        const worn = costumeOf(voice, costume);
        const open = picking === voice;
        return (
          <span key={voice} className="head-style-group" role="group" aria-label={`${name}'s look`}>
            <span className="head-style-name" aria-hidden="true">
              {name}
            </span>
            <button
              type="button"
              className="head-style-btn"
              tabIndex={-1}
              aria-label={`Change ${name}'s look (now ${look})`}
              title={`${name}: next look · now ${look} (Shift-click: previous)`}
              onClick={(e) => cycleHeadLook(voice, e.shiftKey ? -1 : 1)}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true" className="head-style-icon head-style-icon--look">
                <path d="M5.5 2.5 L2 4.5 L3.2 7.4 L4.6 6.8 L4.6 13.5 L11.4 13.5 L11.4 6.8 L12.8 7.4 L14 4.5 L10.5 2.5 Q8 4.6 5.5 2.5 Z" />
              </svg>
            </button>
            <button
              type="button"
              className={worn ? "head-style-btn head-style-btn--on" : "head-style-btn"}
              tabIndex={-1}
              data-costume-opener=""
              aria-haspopup="true"
              aria-expanded={open}
              aria-label={worn ? `${name}'s costume: ${worn.label}. Change costume` : `Choose a costume for ${name}`}
              title={`${name}: ${worn ? worn.label : "normal clothes"} · costumes`}
              onClick={() => setPicking(open ? null : voice)}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true" className="head-style-icon head-style-icon--hanger">
                <path d="M8 5.2 Q8 3.8 9.2 3.5 Q10.4 3.2 10.4 2.2 Q10.2 1 9 1.1 Q8 1.2 7.9 2.1" />
                <path d="M8 5.2 L1.5 10.8 Q1 11.6 1.9 11.8 L14.1 11.8 Q15 11.6 14.5 10.8 Z" />
              </svg>
            </button>
            {open && (
              <CostumePicker
                current={worn}
                label={`${name}'s costume`}
                onPick={(id) => {
                  setPicking(null);
                  wearHeadCostume(voice, id);
                }}
                onClose={closePicker}
              />
            )}
          </span>
        );
      })}
      <SenseiButtons />
    </span>
  );
}
