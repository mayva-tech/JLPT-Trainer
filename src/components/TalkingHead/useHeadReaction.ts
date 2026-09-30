import { useCallback, useEffect, useRef, useState } from "react";
import {
  subscribeToReactions,
  type HeadReactionEvent,
} from "../../services/reactionBus";
import { REACTION_STYLE } from "./reactionStyle";

const ENABLED_KEY = "jlpt-trainer:talking-head-reactions:v1";

function loadEnabled(): boolean {
  try {
    return globalThis.localStorage?.getItem(ENABLED_KEY) !== "off";
  } catch {
    return true;
  }
}

/**
 * The reaction currently on the head's face, or null. Each event holds for
 * its style's duration; a newer event replaces an older one immediately.
 * Reactions can be switched off (persisted) — e.g. for clean recordings.
 */
export function useHeadReaction(): {
  reaction: (HeadReactionEvent & { pick: number }) | null;
  reactionsOn: boolean;
  toggleReactions: () => boolean;
} {
  const [reaction, setReaction] = useState<
    (HeadReactionEvent & { pick: number }) | null
  >(null);
  const [reactionsOn, setReactionsOn] = useState(loadEnabled);
  const timer = useRef<number | null>(null);
  const onRef = useRef(reactionsOn);
  onRef.current = reactionsOn;

  useEffect(() => {
    const unsubscribe = subscribeToReactions((event) => {
      if (!onRef.current) return;
      if (timer.current) window.clearTimeout(timer.current);
      setReaction({ ...event, pick: Math.random() });
      timer.current = window.setTimeout(() => {
        setReaction((cur) => (cur?.id === event.id ? null : cur));
      }, REACTION_STYLE[event.kind].durationMs);
    });
    return () => {
      unsubscribe();
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const toggleReactions = useCallback(() => {
    const next = !onRef.current;
    setReactionsOn(next);
    if (!next) setReaction(null);
    try {
      globalThis.localStorage?.setItem(ENABLED_KEY, next ? "on" : "off");
    } catch {
      // private mode / quota
    }
    return next;
  }, []);

  return { reaction, reactionsOn, toggleReactions };
}
