import { useCallback, useSyncExternalStore } from "react";
import type { HeadLook, HeadVoice } from "./looks";
import { cycleHeadLook, getHeadStyle, lookOf, subscribeHeadStyle } from "./headStyleStore";

/**
 * The chosen look per voice, remembered across sessions and shared with the
 * Player's look buttons. Ids (not indices) are stored, so adding or
 * reordering looks never swaps someone's choice.
 */
export function useHeadLook(): {
  lookFor: (voice: HeadVoice) => HeadLook;
  cycleLook: (voice: HeadVoice, step: number) => HeadLook;
} {
  const { lookIds } = useSyncExternalStore(subscribeHeadStyle, getHeadStyle);
  const lookFor = useCallback((voice: HeadVoice) => lookOf(voice, lookIds), [lookIds]);
  return { lookFor, cycleLook: cycleHeadLook };
}
