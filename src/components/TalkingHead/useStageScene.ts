import { useCallback, useEffect, useRef, useState } from "react";
import {
  getCurrentScene,
  subscribeToScene,
  type HeadScene,
} from "../../services/sceneBus";

const SCENE_KEY = "jlpt-trainer:talking-head-scene:v1";

function loadOn(): boolean {
  try {
    return globalThis.localStorage?.getItem(SCENE_KEY) !== "off";
  } catch {
    return true;
  }
}

/** The declared scene (null when none, or when scenes are switched off). */
export function useStageScene(): {
  scene: HeadScene | null;
  toggleScenes: () => boolean;
} {
  const [scene, setScene] = useState<HeadScene | null>(getCurrentScene);
  const [on, setOn] = useState(loadOn);
  const onRef = useRef(on);
  onRef.current = on;

  useEffect(() => {
    setScene(getCurrentScene());
    return subscribeToScene(setScene);
  }, []);

  const toggleScenes = useCallback(() => {
    const next = !onRef.current;
    setOn(next);
    try {
      globalThis.localStorage?.setItem(SCENE_KEY, next ? "on" : "off");
    } catch {
      // private mode / quota
    }
    return next;
  }, []);

  return { scene: on ? scene : null, toggleScenes };
}
