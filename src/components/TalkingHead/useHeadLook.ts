import { useCallback, useState } from "react";
import {
  looksFor,
  resolveLook,
  stepLookId,
  type HeadLook,
  type HeadVoice,
} from "./looks";

const LOOK_KEY = "jlpt-trainer:talking-head-look:v1";

type LookIds = Partial<Record<HeadVoice, string>>;

function loadLookIds(): LookIds {
  try {
    const raw = globalThis.localStorage?.getItem(LOOK_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const out: LookIds = {};
    const rec = parsed as Record<string, unknown>;
    if (typeof rec.en === "string") out.en = rec.en;
    if (typeof rec.ja === "string") out.ja = rec.ja;
    return out;
  } catch {
    return {};
  }
}

function saveLookIds(ids: LookIds) {
  try {
    globalThis.localStorage?.setItem(LOOK_KEY, JSON.stringify(ids));
  } catch {
    // private mode / quota
  }
}

/**
 * The chosen look per voice, remembered across sessions. Ids (not indices)
 * are stored, so adding or reordering looks never swaps someone's choice.
 */
export function useHeadLook(): {
  lookFor: (voice: HeadVoice) => HeadLook;
  cycleLook: (voice: HeadVoice, step: number) => HeadLook;
} {
  const [ids, setIds] = useState<LookIds>(() => loadLookIds());

  const lookFor = useCallback(
    (voice: HeadVoice) => resolveLook(looksFor(voice), ids[voice]),
    [ids]
  );

  const cycleLook = useCallback(
    (voice: HeadVoice, step: number) => {
      const looks = looksFor(voice);
      const nextId = stepLookId(looks, ids[voice], step);
      const next = { ...ids, [voice]: nextId };
      setIds(next);
      saveLookIds(next);
      return resolveLook(looks, nextId);
    },
    [ids]
  );

  return { lookFor, cycleLook };
}
