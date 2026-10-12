import { useCallback, useEffect, useState } from "react";
import {
  loadDiscoveryProgress,
  markDiscovered,
  recordQuizRound,
  recordQuizTap,
  saveDiscoveryProgress,
  setLastScene,
  updateDiscoveryPrefs,
  type DiscoveryPrefs,
  type DiscoveryProgress,
} from "./discoveryProgress";

/** Visual Discovery's own progress, persisted under DISCOVERY_PROGRESS_KEY. */
export function useDiscoveryProgress() {
  const [progress, setProgress] = useState<DiscoveryProgress>(() => loadDiscoveryProgress());

  useEffect(() => {
    saveDiscoveryProgress(progress);
  }, [progress]);

  return {
    progress,
    markDiscovered: useCallback(
      (sceneId: string, objectId: string) => setProgress((p) => markDiscovered(p, sceneId, objectId)),
      [],
    ),
    setLastScene: useCallback((sceneId: string) => setProgress((p) => setLastScene(p, sceneId)), []),
    recordQuizTap: useCallback(
      (sceneId: string, correct: boolean) => setProgress((p) => recordQuizTap(p, sceneId, correct)),
      [],
    ),
    recordQuizRound: useCallback(
      (sceneId: string, firstTry: number, total: number) =>
        setProgress((p) => recordQuizRound(p, sceneId, firstTry, total)),
      [],
    ),
    updatePrefs: useCallback(
      (patch: Partial<DiscoveryPrefs>) => setProgress((p) => updateDiscoveryPrefs(p, patch)),
      [],
    ),
  };
}

export type DiscoveryProgressApi = ReturnType<typeof useDiscoveryProgress>;
