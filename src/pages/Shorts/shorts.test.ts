import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { vocabulary } from "../../data/vocabulary";
import { playlistLessons, getPlaylistWordRange, parsePlaylistLessonId } from "../../data/playlists";
import type { VocabularyItem } from "../../types/vocabulary";
import {
  COUNTDOWN_MS,
  HOOK_LINES,
  SHORT_PHASES,
  hookLineFor,
  buildShortScript,
  estimateShortSeconds,
  phaseProgress,
  reached,
  repeatGapMs,
} from "./shortScript";
import { KANJIVG_CREDIT, buildShortMeta, firstSense } from "./shortsMeta";
import { loadKanjiStrokes } from "../../components/KanjiStrokes/loadStrokes";
import { phraseChunks } from "./phraseBreaks";
import { ShortStage, type ShortStageProps } from "./ShortStage";
import { useShortPlayer } from "./useShortPlayer";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const BY_ID = new Map(vocabulary.map((v) => [v.id, v]));
const playlistWords: { item: VocabularyItem; lessonId: string; index: number }[] = [];
for (const lesson of playlistLessons) {
  lesson.vocabularyIds.forEach((id, index) => {
    const item = BY_ID.get(id);
    if (item) playlistWords.push({ item, lessonId: lesson.id, index });
  });
}

const sample: VocabularyItem = {
  ...vocabulary[0]!,
  id: 999001,
  word: "人",
  reading: "ひと",
  meaning: "person",
  sentence: "駅の前に人が集まっています。",
  sentenceReading: "えき の まえ に ひと が あつまって います 。",
  sentenceMeaning: "People are gathering in front of the station.",
};

/* ── Beat sheet ───────────────────────────────────────────────── */

describe("Short script", () => {
  const steps = buildShortScript(sample);

  it("opens with the word's hook line and a 3-second countdown", () => {
    expect(steps[0]).toMatchObject({ kind: "say", phase: "hook", lang: "en", text: hookLineFor(sample).en });
    expect(steps[1]).toMatchObject({ kind: "say", phase: "hook", lang: "ja", text: hookLineFor(sample).ja });
    expect(steps[2]).toMatchObject({ kind: "wait", phase: "hook", ms: COUNTDOWN_MS, cue: "countdown" });
  });

  it("varies the hook line: consecutive words differ, the same word keeps its line", () => {
    const lines = Array.from({ length: HOOK_LINES.length }, (_, i) => hookLineFor({ id: 100 + i }).en);
    expect(new Set(lines).size).toBe(HOOK_LINES.length);
    expect(hookLineFor({ id: 57 })).toBe(hookLineFor({ id: 57 }));
    for (const line of HOOK_LINES) {
      expect(line.en.trim()).not.toBe("");
      expect(line.ja.trim()).not.toBe("");
    }
  });

  it("reveals the word with its reading, then the meaning", () => {
    expect(steps[3]).toMatchObject({ kind: "say", phase: "reveal", lang: "ja", text: "人", reading: "ひと" });
    expect(steps.find((s) => s.phase === "meaning" && s.kind === "say")).toMatchObject({
      lang: "en",
      text: "person",
    });
  });

  it("plays the example, then a slow shadowing pass with a repeat gap", () => {
    const shadow = steps.filter((s) => s.phase === "shadow");
    expect(shadow[0]).toMatchObject({ kind: "say", lang: "ja", slow: true, text: sample.sentence });
    expect(shadow[1]).toMatchObject({ kind: "wait", cue: "repeat" });
  });

  it("keeps the phases in order and ends on the outro", () => {
    const order = steps.map((s) => SHORT_PHASES.indexOf(s.phase));
    for (let i = 1; i < order.length; i++) expect(order[i]).toBeGreaterThanOrEqual(order[i - 1]!);
    expect(steps[steps.length - 1]).toMatchObject({ kind: "wait", phase: "outro" });
  });

  it("adds a draw beat for the stroke-order writing when asked", () => {
    const s = buildShortScript(sample, { drawMs: 900 });
    expect(s[3]).toMatchObject({ kind: "wait", phase: "draw", ms: 1200 });
    expect(s[4]).toMatchObject({ kind: "say", phase: "reveal" });
    expect(buildShortScript(sample).some((x) => x.phase === "draw")).toBe(false);
    expect(estimateShortSeconds(sample, { drawMs: 3000 })).toBeGreaterThan(estimateShortSeconds(sample));
  });

  it("falls back to shadowing the word when there is no sentence", () => {
    const s = buildShortScript({ ...sample, sentence: "", sentenceReading: "", sentenceMeaning: "" });
    expect(s.some((x) => x.phase === "example")).toBe(false);
    expect(s.find((x) => x.phase === "shadow" && x.kind === "say")).toMatchObject({ text: "人" });
  });

  it("gives a repeat gap of 2.5–6 s that grows with the sentence", () => {
    expect(repeatGapMs("短い。")).toBe(2500);
    expect(repeatGapMs("あ".repeat(100))).toBe(6000);
    expect(repeatGapMs("駅の前に人が集まっています。")).toBeGreaterThan(repeatGapMs("短い文です。"));
  });

  it("tracks progress and phase order", () => {
    expect(phaseProgress("idle")).toBe(0);
    expect(phaseProgress("done")).toBe(1);
    expect(phaseProgress("reveal")).toBeLessThan(phaseProgress("outro"));
    expect(reached("example", "meaning")).toBe(true);
    expect(reached("meaning", "example")).toBe(false);
    expect(reached("idle", "hook")).toBe(false);
  });

  it("every playlist word makes a Short under a minute", () => {
    expect(playlistWords.length).toBeGreaterThan(500);
    for (const { item } of playlistWords) {
      const s = estimateShortSeconds(item);
      expect(s).toBeGreaterThanOrEqual(18);
      expect(s).toBeLessThanOrEqual(55);
    }
  });
});

/* ── Upload text ──────────────────────────────────────────────── */

describe("Short upload text", () => {
  it("keeps the first sense of a meaning", () => {
    expect(firstSense("to rise; to go up")).toBe("to rise");
    expect(firstSense("person")).toBe("person");
  });

  it("titles every playlist word within YouTube's 100 characters", () => {
    for (const { item, lessonId, index } of playlistWords) {
      const parsed = parsePlaylistLessonId(lessonId)!;
      const range = getPlaylistWordRange(lessonId)!;
      const meta = buildShortMeta(item, {
        level: parsed.level,
        wordNumber: range.firstWordNumber + index,
        lessonNumber: range.lessonNumber,
        lessonTheme: "Theme",
      });
      expect([...meta.title].length).toBeLessThanOrEqual(100);
      expect(meta.title).toContain(item.word);
      expect(meta.title).toContain(`JLPT ${parsed.level}`);
      expect(meta.hashtags).toContain(`#jlpt${parsed.level.toLowerCase()}`);
    }
  });

  it("puts the sentence, lesson and hashtags in the description", () => {
    const meta = buildShortMeta(sample, { level: "N5", wordNumber: 3, lessonNumber: 1, lessonTheme: "People & Family 1" });
    expect(meta.title).toBe('人 (ひと) = "person" | JLPT N5 #3 #shorts');
    expect(meta.description).toContain(sample.sentence);
    expect(meta.description).toContain(sample.sentenceMeaning);
    expect(meta.description).toContain("JLPT N5 Vocabulary #1 | People & Family 1");
    expect(meta.description).toContain("#learnjapanese");
    expect(meta.pinnedComment).toContain("「人」");
    expect(meta.description).not.toContain("KanjiVG");
  });

  it("credits KanjiVG when the Short animates strokes", () => {
    const ctx = { level: "N5" as const, wordNumber: 3, lessonNumber: 1, lessonTheme: "People" };
    expect(buildShortMeta(sample, ctx, { strokeCredit: true }).description).toContain(KANJIVG_CREDIT);
  });
});

/* ── Subtitle phrases ─────────────────────────────────────────── */

describe("phrase chunks", () => {
  const text = (chunks: ReturnType<typeof phraseChunks>) =>
    chunks.map((p) => p.map((x) => x.text).join(""));

  it("wraps only between phrases", () => {
    expect(text(phraseChunks(sample.sentence, sample.sentenceReading))).toEqual([
      "駅の",
      "前に",
      "人が",
      "集まっています。",
    ]);
  });

  it("keeps furigana on kanji pieces", () => {
    const pieces = phraseChunks(sample.sentence, sample.sentenceReading).flat();
    expect(pieces.find((p) => p.text === "駅")?.reading).toBe("えき");
    expect(pieces.find((p) => p.text === "集")?.reading).toBe("あつ");
  });

  it("covers every corpus sentence exactly, with offsets the voice can highlight", () => {
    for (const v of vocabulary) {
      if (!v.sentence) continue;
      const chunks = phraseChunks(v.sentence, v.sentenceReading);
      expect(chunks.every((p) => p.length > 0)).toBe(true);
      const pieces = chunks.flat();
      expect(pieces.map((p) => p.text).join("")).toBe(v.sentence);
      let at = 0;
      for (const p of pieces) {
        expect(p.start).toBe(at);
        expect(p.end - p.start).toBe(p.text.length);
        at = p.end;
      }
    }
  });
});

/* ── Stage and player ─────────────────────────────────────────── */

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.useRealTimers();
});

function stage(over: Partial<ShortStageProps> = {}) {
  const props: ShortStageProps = {
    item: sample,
    level: "N5",
    wordNumber: 3,
    seriesLabel: "Japanese word of the day",
    phase: "hook",
    cue: null,
    highlight: null,
    activeLang: null,
    next: { ...sample, id: 999002, word: "男" },
    ambience: true,
    pan: true,
    panSeconds: 30,
    ...over,
  };
  act(() => root.render(createElement(ShortStage, props)));
}

describe("<ShortStage /> brush mode", () => {
  beforeEach(async () => {
    await loadKanjiStrokes();
  });

  it("hook keeps the clear typed word; draw writes it stroke by stroke", () => {
    stage({ phase: "hook", brush: true });
    expect(host.querySelector(".sh-word--hook")).not.toBeNull();
    expect(host.querySelector(".ks")).toBeNull();
    stage({ phase: "draw", brush: true, runKey: 1 });
    expect(host.querySelector(".sh-word--hook")).toBeNull();
    expect(host.querySelector(".ks--draw .ks-ink path")).not.toBeNull();
    expect(host.querySelector(".sh-reading--on")).toBeNull();
  });

  it("reveal shows the finished word with its reading above", () => {
    stage({ phase: "reveal", brush: true, runKey: 1 });
    expect(host.querySelector(".ks--done")).not.toBeNull();
    expect(host.querySelector(".sh-reading--on")?.textContent).toBe("ひと");
  });
});

describe("<ShortStage />", () => {
  it("hook: clear word, no furigana, hook line and countdown", () => {
    stage({ phase: "hook", cue: { kind: "countdown", ms: 3000, key: 1 } });
    expect(host.querySelector(".sh-word--hook")).not.toBeNull();
    expect(host.querySelector(".sh-word .furigana-hidden")).not.toBeNull();
    expect(host.textContent).toContain(hookLineFor(sample).en);
    expect(host.textContent).toContain(hookLineFor(sample).ja);
    expect(host.querySelectorAll(".sh-count span")).toHaveLength(3);
  });

  it("reveal: word with furigana, meaning still hidden", () => {
    stage({ phase: "reveal" });
    expect(host.querySelector(".sh-word--hook")).toBeNull();
    expect(host.querySelector(".sh-word .furigana-hidden")).toBeNull();
    expect(host.querySelector(".sh-meaning--on")).toBeNull();
  });

  it("example: sentence with furigana and translation", () => {
    stage({ phase: "example" });
    expect(host.querySelector(".sh-meaning--on")).not.toBeNull();
    expect(host.querySelector(".sh-sentence-ja")?.textContent).toContain("駅");
    expect(host.querySelectorAll(".sh-sentence-ja rt").length).toBeGreaterThan(0);
    expect(host.textContent).toContain(sample.sentenceMeaning);
  });

  it("shadow: your-turn banner and the repeat timer", () => {
    stage({ phase: "shadow", cue: { kind: "repeat", ms: 3000, key: 2 } });
    expect(host.textContent).toContain("Your turn");
    expect(host.querySelector(".sh-repeat span")).not.toBeNull();
  });

  it("karaoke lights the spoken piece", () => {
    stage({ phase: "example", activeLang: "ja", highlight: { start: 0, end: 1 } });
    const active = host.querySelector(".sh-sentence-ja .speech-active");
    expect(active?.tagName).toBe("RUBY");
    expect(active?.childNodes[0]?.textContent).toBe("駅");
    expect(active?.querySelector("rt")?.textContent).toBe("えき");
  });

  it("outro: comment prompt with the word and the next word teased", () => {
    stage({ phase: "outro" });
    expect(host.querySelector(".sh-outro-prompt")?.textContent).toContain("「人」");
    expect(host.querySelector(".sh-next-word")?.textContent).toBe("男");
  });

  it("shows the word's backdrop, and safe zones only when asked", () => {
    stage({ phase: "reveal" });
    expect(host.querySelector(".sh-stage")?.getAttribute("data-theme")).not.toBe("none");
    expect(host.querySelector(".amb")).not.toBeNull();
    expect(host.querySelector(".sh-safe")).toBeNull();
    stage({ phase: "reveal", showSafeZones: true });
    expect(host.querySelector(".sh-safe")).not.toBeNull();
  });

  it("pans the backdrop only once the Short is playing", () => {
    stage({ phase: "idle" });
    expect(host.querySelector(".sh-amb--pan")).toBeNull();
    stage({ phase: "hook" });
    expect(host.querySelector(".sh-amb--pan")).not.toBeNull();
  });
});

describe("useShortPlayer", () => {
  it("plays the whole Short hands-free and reports done", () => {
    vi.useFakeTimers();
    const steps = buildShortScript(sample);
    const phases: string[] = [];
    const onDone = vi.fn();
    let api: ReturnType<typeof useShortPlayer> | null = null;
    function Probe() {
      api = useShortPlayer(steps, onDone);
      if (phases[phases.length - 1] !== api.phase) phases.push(api.phase);
      return null;
    }
    act(() => root.render(createElement(Probe)));
    act(() => api!.play());
    for (let i = 0; i < 80 && !onDone.mock.calls.length; i++) {
      act(() => {
        vi.advanceTimersByTime(500);
      });
    }
    expect(onDone).toHaveBeenCalledTimes(1);
    // jsdom has no voices, so speech "ends" instantly and React may batch a
    // short phase away; the order must still only move forward.
    const order = ["idle", ...SHORT_PHASES, "done"];
    expect(phases[0]).toBe("idle");
    expect(phases[phases.length - 1]).toBe("done");
    for (const must of ["hook", "shadow", "outro"]) expect(phases).toContain(must);
    for (let i = 1; i < phases.length; i++) {
      expect(order.indexOf(phases[i]!)).toBeGreaterThan(order.indexOf(phases[i - 1]!));
    }
  });

  it("Stop cancels everything in flight", () => {
    vi.useFakeTimers();
    const onDone = vi.fn();
    let api: ReturnType<typeof useShortPlayer> | null = null;
    const steps = buildShortScript(sample);
    function Probe() {
      api = useShortPlayer(steps, onDone);
      return null;
    }
    act(() => root.render(createElement(Probe)));
    act(() => api!.play());
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    act(() => api!.stop());
    act(() => {
      vi.advanceTimersByTime(60000);
    });
    expect(api!.phase).toBe("idle");
    expect(onDone).not.toHaveBeenCalled();
  });
});
