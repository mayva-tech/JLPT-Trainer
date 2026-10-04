import { useEffect, useState, useSyncExternalStore } from "react";
import {
  getSenseiSettings,
  setSenseiSettings,
  subscribeToSenseiSettings,
} from "../../services/senseiBus";
import { SENSEI_NAMES } from "../Sensei/senseiTips";
import type { Voice } from "./duo";
import {
  cycleHeadLook,
  getHeadStyle,
  lookOf,
  subscribeHeadStyle,
  toggleHeadSuit,
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
 * Separate look and mecha-suit buttons for Nanami and Andrew, plus the Sensei
 * mascot's, for the Player's control bar. Shift-click a look button for the
 * previous look.
 */
export default function HeadStyleButtons() {
  const { lookIds, suit } = useSyncExternalStore(subscribeHeadStyle, getHeadStyle);
  return (
    <span className="head-style-bar">
      {PEOPLE.map(({ voice, name }) => {
        const look = lookOf(voice, lookIds).label;
        const suited = suit[voice];
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
              className={suited ? "head-style-btn head-style-btn--on" : "head-style-btn"}
              tabIndex={-1}
              aria-pressed={suited}
              aria-label={suited ? `Take off ${name}'s mecha suit` : `Put ${name} in the mecha suit`}
              title={`${name}: mecha suit ${suited ? "on" : "off"}`}
              onClick={() => toggleHeadSuit(voice)}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true" className="head-style-icon head-style-icon--suit">
                <path d="M2.5 10.5 Q2.5 2.5 8 2.5 Q13.5 2.5 13.5 10.5 L13.5 13 L2.5 13 Z" />
                <path d="M4.5 8 Q8 6.2 11.5 8 L11.5 11 L4.5 11 Z" className="head-style-visor" />
                <path d="M3 6 L1.2 2" />
              </svg>
            </button>
          </span>
        );
      })}
      <SenseiButtons />
    </span>
  );
}
