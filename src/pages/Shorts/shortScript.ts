import type { VocabularyItem } from "../../types/vocabulary";

/**
 * The beat sheet of one vertical Short (one word, ~25–35 s, hands-free).
 *
 *   hook     an opener ("Can you read this?" …) — word without furigana, 3-2-1 countdown
 *   draw     the word writes itself in stroke order (when it has kanji)
 *   reveal   furigana + pitch line, the word spoken
 *   meaning  English meaning spoken
 *   example  example sentence (karaoke), then its translation
 *   shadow   "Your turn!" — sentence again slowly, then a silent gap to repeat
 *   outro    comment prompt + next word teased
 *
 * Pure data so the order and timing can be tested without a browser.
 */

export type ShortPhase =
  | "idle"
  | "hook"
  | "draw"
  | "reveal"
  | "meaning"
  | "example"
  | "shadow"
  | "outro"
  | "done";

export const SHORT_PHASES: readonly ShortPhase[] = [
  "hook",
  "draw",
  "reveal",
  "meaning",
  "example",
  "shadow",
  "outro",
];

export type ShortStep =
  | {
      kind: "say";
      phase: ShortPhase;
      lang: "ja" | "en";
      text: string;
      reading?: string;
      slow?: boolean;
    }
  | {
      kind: "wait";
      phase: ShortPhase;
      ms: number;
      /** Marks the hook countdown and the shadowing gap (they draw timers). */
      cue?: "countdown" | "repeat";
    };

export interface HookLine {
  /** Spoken by Andrew and shown big. */
  en: string;
  /** Spoken by Nanami right after, shown small under it. */
  ja: string;
}

/** Openers rotated across Shorts so a batch doesn't repeat the same line. */
export const HOOK_LINES: readonly HookLine[] = [
  { en: "Can you read this?", ja: "読めますか？" },
  { en: "Do you know this word?", ja: "この言葉、知ってる？" },
  { en: "How do you read this?", ja: "どう読む？" },
  { en: "Read it before the timer ends!", ja: "時間内に読めるかな？" },
  { en: "What's the reading?", ja: "読み方は？" },
  { en: "Think you know this one?", ja: "わかるかな？" },
  { en: "Try reading this out loud!", ja: "声に出して読んでみて！" },
  { en: "Quick quiz — read this!", ja: "クイズ！これ、読める？" },
  { en: "Have you seen this word?", ja: "見たことある？" },
  { en: "Ready? Read this one!", ja: "準備はいい？" },
  { en: "Bet you can read this!", ja: "きっと読めるはず！" },
  { en: "Guess the reading!", ja: "読みを当ててみて！" },
];

/**
 * The opener for a word. Keyed by id, so consecutive words in a lesson get
 * different lines and a re-take of the same word keeps its line.
 */
export function hookLineFor(item: Pick<VocabularyItem, "id">): HookLine {
  const n = HOOK_LINES.length;
  return HOOK_LINES[((Math.trunc(item.id) % n) + n) % n];
}

export const COUNTDOWN_MS = 3000;
export const OUTRO_MS = 3800;

/** Silent time to repeat the sentence: roughly its spoken length, 2.5–6 s. */
export function repeatGapMs(sentence: string): number {
  const chars = [...sentence.replace(/\s/g, "")].length;
  return Math.max(2500, Math.min(6000, 1200 + chars * 170));
}

/** Pause after the last stroke before the word is spoken. */
export const DRAW_SETTLE_MS = 300;

export interface ShortOptions {
  /** Stroke-order writing time (0 = no draw beat, e.g. kana-only words). */
  drawMs?: number;
}

export function buildShortScript(item: VocabularyItem, options: ShortOptions = {}): ShortStep[] {
  const drawMs = Math.max(0, Math.round(options.drawMs ?? 0));
  const steps: ShortStep[] = [
    { kind: "say", phase: "hook", lang: "en", text: hookLineFor(item).en },
    { kind: "say", phase: "hook", lang: "ja", text: hookLineFor(item).ja },
    { kind: "wait", phase: "hook", ms: COUNTDOWN_MS, cue: "countdown" },
  ];
  if (drawMs > 0) {
    steps.push({ kind: "wait", phase: "draw", ms: drawMs + DRAW_SETTLE_MS });
  }
  steps.push(
    { kind: "say", phase: "reveal", lang: "ja", text: item.word, reading: item.reading },
    { kind: "wait", phase: "reveal", ms: 350 },
    { kind: "say", phase: "meaning", lang: "en", text: item.meaning },
    { kind: "wait", phase: "meaning", ms: 450 }
  );
  if (item.sentence?.trim()) {
    steps.push(
      { kind: "say", phase: "example", lang: "ja", text: item.sentence, reading: item.sentenceReading },
      { kind: "say", phase: "example", lang: "en", text: item.sentenceMeaning },
      { kind: "wait", phase: "example", ms: 300 },
      {
        kind: "say",
        phase: "shadow",
        lang: "ja",
        text: item.sentence,
        reading: item.sentenceReading,
        slow: true,
      },
      { kind: "wait", phase: "shadow", ms: repeatGapMs(item.sentence), cue: "repeat" }
    );
  } else {
    steps.push(
      { kind: "say", phase: "shadow", lang: "ja", text: item.word, reading: item.reading, slow: true },
      { kind: "wait", phase: "shadow", ms: 2500, cue: "repeat" }
    );
  }
  steps.push({ kind: "wait", phase: "outro", ms: OUTRO_MS });
  return steps;
}

/** 0..1 position of a phase in the Short, for the top progress bar. */
export function phaseProgress(phase: ShortPhase): number {
  if (phase === "idle") return 0;
  if (phase === "done") return 1;
  const i = SHORT_PHASES.indexOf(phase);
  return (i + 1) / SHORT_PHASES.length;
}

/** Phase order helper: has the Short reached `phase` yet? */
export function reached(current: ShortPhase, phase: ShortPhase): boolean {
  if (current === "done") return true;
  if (current === "idle") return false;
  return SHORT_PHASES.indexOf(current) >= SHORT_PHASES.indexOf(phase);
}

/** Rough length of a Short in seconds, used to time the backdrop pan. */
export function estimateShortSeconds(item: VocabularyItem, options: ShortOptions = {}): number {
  const steps = buildShortScript(item, options);
  let ms = 400;
  for (const s of steps) {
    if (s.kind === "wait") ms += s.ms;
    else {
      const chars = [...s.text.replace(/\s/g, "")].length;
      const perChar = s.lang === "ja" ? 150 : 65;
      ms += 500 + chars * perChar * (s.slow ? 1.45 : 1);
    }
  }
  return Math.round(Math.max(18, Math.min(55, ms / 1000)));
}
