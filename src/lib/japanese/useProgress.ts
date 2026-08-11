import { useCallback, useEffect, useState } from 'react';
import type { Progress } from './types';

const EMPTY: Progress = { known: [], practiced: [] };

function load(key: string): Progress {
  if (typeof window === 'undefined') return EMPTY;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      known: Array.isArray(parsed.known) ? parsed.known : [],
      practiced: Array.isArray(parsed.practiced) ? parsed.practiced : [],
    };
  } catch {
    return EMPTY;
  }
}

/**
 * Card and scenario progress, persisted under `storageKey`. Each trainer page
 * passes its own key so the two pages never overwrite each other.
 */
export function useProgress(storageKey: string) {
  const [progress, setProgress] = useState<Progress>(() => load(storageKey));

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(progress));
    } catch {
      // Private mode or a full quota: progress just won't persist.
    }
  }, [storageKey, progress]);

  const toggle = useCallback((field: keyof Progress, id: string) => {
    setProgress((prev) => {
      const list = prev[field];
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
      return { ...prev, [field]: next };
    });
  }, []);

  return { progress, toggle };
}
