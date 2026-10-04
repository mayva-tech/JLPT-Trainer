import { useSyncExternalStore } from "react";
import {
  cycleHeadCostume,
  getHeadStyle,
  subscribeHeadStyle,
  toggleHeadCostume,
  wearHeadCostume,
} from "./headStyleStore";

export { COSTUME_REVEAL_MS, type CostumeState } from "./headStyleStore";

/**
 * Each head's costume (none by default), remembered across sessions. Every
 * change plays that costume's sound and sets `revealing` for that head
 * briefly, so its reveal plays once rather than on every remount. Restoring
 * a saved costume at load is silent and has no reveal.
 */
export function useHeadCostume() {
  const { costume, revealing } = useSyncExternalStore(subscribeHeadStyle, getHeadStyle);
  return {
    costume,
    revealing,
    wear: wearHeadCostume,
    toggle: toggleHeadCostume,
    cycle: cycleHeadCostume,
  };
}
