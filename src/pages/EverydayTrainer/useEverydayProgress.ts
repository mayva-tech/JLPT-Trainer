import { useCallback, useEffect, useState } from "react";
import {
  loadEverydayProgress,
  markExplored,
  recordAnswer,
  recordSession,
  saveEverydayProgress,
  setResume,
  toggleFavorite,
  toggleKnown,
  updatePrefs,
  type EverydayPrefs,
  type EverydayProgress,
  type ReviewRecord,
} from "./everydayProgress";

/** Everyday Japanese progress, persisted under EVERYDAY_PROGRESS_KEY. */
export function useEverydayProgress() {
  const [progress, setProgress] = useState<EverydayProgress>(() => loadEverydayProgress());

  useEffect(() => {
    saveEverydayProgress(progress);
  }, [progress]);

  return {
    progress,
    toggleKnown: useCallback((id: string) => setProgress((p) => toggleKnown(p, id)), []),
    toggleFavorite: useCallback((id: string) => setProgress((p) => toggleFavorite(p, id)), []),
    markExplored: useCallback((id: string) => setProgress((p) => markExplored(p, id)), []),
    setResume: useCallback(
      (categoryId: string, wordId: string) => setProgress((p) => setResume(p, categoryId, wordId)),
      [],
    ),
    recordAnswer: useCallback(
      (id: string, correct: boolean) => setProgress((p) => recordAnswer(p, id, correct)),
      [],
    ),
    recordSession: useCallback(
      (record: Omit<ReviewRecord, "at">) => setProgress((p) => recordSession(p, record)),
      [],
    ),
    updatePrefs: useCallback(
      (patch: Partial<EverydayPrefs>) => setProgress((p) => updatePrefs(p, patch)),
      [],
    ),
  };
}

export type EverydayProgressApi = ReturnType<typeof useEverydayProgress>;
