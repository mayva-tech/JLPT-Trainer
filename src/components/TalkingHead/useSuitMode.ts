import { useSyncExternalStore } from "react";
import type { Voice } from "./duo";
import {
  getHeadStyle,
  subscribeHeadStyle,
  toggleHeadSuit,
  type SuitState,
} from "./headStyleStore";

export { SUIT_REVEAL_MS, type SuitState } from "./headStyleStore";

/**
 * Mecha suit on/off per head (Nanami and Andrew separately) — off by default,
 * remembered across sessions and shared with the Player's suit buttons.
 * `revealing[voice]` is true briefly after that head suits up, so it plays
 * the reveal once rather than on every remount. Each switch plays a
 * mechanical sound; restoring a saved "on" is silent.
 */
export function useSuitMode(): {
  suit: SuitState;
  revealing: SuitState;
  toggleSuit: (voice: Voice) => boolean;
} {
  const { suit, revealing } = useSyncExternalStore(subscribeHeadStyle, getHeadStyle);
  return { suit, revealing, toggleSuit: toggleHeadSuit };
}
