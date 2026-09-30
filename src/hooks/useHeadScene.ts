import { useEffect } from "react";
import {
  pushScene,
  type SceneBackdrop,
  type SceneProp,
} from "../services/sceneBus";

/**
 * Declare the talking head's scene while this component is mounted.
 * Pass null for "no scene". Re-declares only when backdrop/prop change.
 */
export function useHeadScene(
  scene: { backdrop: SceneBackdrop; prop?: SceneProp } | null
): void {
  const backdrop = scene?.backdrop ?? null;
  const prop = scene?.prop;
  useEffect(() => {
    if (!backdrop) return;
    return pushScene(prop ? { backdrop, prop } : { backdrop });
  }, [backdrop, prop]);
}
