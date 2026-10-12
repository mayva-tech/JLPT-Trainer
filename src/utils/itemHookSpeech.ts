import { parseFurigana, stripFurigana } from "../lib/japanese/furigana";

/**
 * Types and speaking helpers for the per-item intro / outro hooks — kept
 * free of word data so the Auto Mode runners stay light. The lines
 * themselves are built in ./itemHooks.ts.
 */

export type HookKind = "intro" | "outro";
export type HookVoice = "en" | "ja";

export interface ItemHook {
  /** Template id — for no-repeat checks and tests. */
  id: string;
  kind: HookKind;
  /** Small chip over the line: "Next word", "Question 3 / 10", "Your turn". */
  tag: string;
  /** Who says it: Andrew says `spokenEn ?? en`, Nanami says `ja`. */
  voice: HookVoice;
  /** English line (big when Andrew speaks, subtitle when Nanami does). */
  en: string;
  /** Japanese line in furigana notation (big when Nanami speaks). */
  ja: string;
  /** English as spoken, when `en` shows Japanese or symbols. */
  spokenEn?: string;
  /** Numbered options under the line (sound-alike quiz). */
  choices?: readonly string[];
}

/** What the stage shows; `key` restarts the card's entry animation. */
export interface ItemHookState {
  hook: ItemHook;
  key: number;
}

export interface HookContext {
  /** 0-based position in the lesson / quiz. */
  index: number;
  total: number;
  /** Template id of the previous hook of the same kind (avoid repeats). */
  prevId?: string | null;
}

/* ── Speaking ───────────────────────────────────────────────────── */

/** What the voice says: Andrew's English, or Nanami's Japanese with its reading. */
export function hookSpeech(hook: ItemHook): { lang: HookVoice; text: string; reading?: string } {
  if (hook.voice === "ja") {
    return {
      lang: "ja",
      text: stripFurigana(hook.ja),
      reading: parseFurigana(hook.ja)
        .map((s) => s.reading ?? s.base)
        .join(""),
    };
  }
  return { lang: "en", text: hook.spokenEn ?? hook.en };
}

/** Settings for the hooks dropdown (shared with the retention hooks). */
export interface ItemHookSettings {
  intro: boolean;
  outro: boolean;
}

/** Hold after a hook line, so it can be read (longer lines hold longer). */
export function hookHoldMs(hook: ItemHook): number {
  const words = hook.en.split(/\s+/).length;
  return Math.min(2200, 500 + words * 90);
}
