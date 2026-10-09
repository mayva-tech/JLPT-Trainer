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
  LOOP_MS,
} from "./shortScript";
import { KANJIVG_CREDIT, buildShortMeta, firstSense } from "./shortsMeta";
import { isReadingTrap, naiveReading, shortAngle, ANGLE_LABELS } from "./shortAngle";
import { vocabularyN3 } from "../../data/n3/vocabularyN3";
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

  it("keeps the phases in order: outro asks its question, then loops back", () => {
    const phases = [...SHORT_PHASES, "loop"];
    const order = steps.map((s) => phases.indexOf(s.phase));
    for (let i = 1; i < order.length; i++) expect(order[i]).toBeGreaterThanOrEqual(order[i - 1]!);
    expect(steps.find((s) => s.phase === "outro")).toMatchObject({
      kind: "say",
      lang: "en",
      text: shortAngle(sample).baitSpoken,
    });
    expect(steps[steps.length - 1]).toMatchObject({ kind: "wait", phase: "loop", ms: LOOP_MS });
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

/* ── Hook types ───────────────────────────────────────────────── */

describe("Short hook type (angle)", () => {
  const all = [...vocabulary, ...vocabularyN3];
  const find = (w: string) => all.find((v) => v.word === w)!;

  it("reading trap: 土産, 大人, 仲人 don't read the way their kanji do", () => {
    for (const w of ["土産", "大人", "仲人", "眼鏡"]) {
      expect(shortAngle(find(w)).kind, w).toBe("trap");
    }
    const souvenir = shortAngle(find("土産"));
    expect(souvenir.descLine).toContain("みやげ");
    expect(souvenir.descLine).toContain(`not ${naiveReading("土産")}`);
  });

  it("sound changes (っ, rendaku) are not traps: 出張, 割引, 窓口", () => {
    for (const w of ["出張", "割引", "窓口", "発表"]) {
      expect(isReadingTrap(find(w)), w).toBe(false);
    }
  });

  it("sound-alike twin: 洗濯 and 選択 quiz each other", () => {
    const a = shortAngle(find("洗濯"));
    expect(a.kind).toBe("twin");
    expect([...a.choices!].sort()).toEqual(["洗濯", "選択"].sort());
    expect(a.bait).toMatch(/Comment 1 or 2/);
    expect(a.pinnedComment).toContain("選択");
  });

  it("kanji math: the two meanings add up (家賃 = house + fare)", () => {
    const rent = shortAngle(find("家賃"));
    expect(rent.kind).toBe("math");
    expect(rent.hook.en).toBe('"house" + "fare" = ?');
  });

  it("every word gets an angle, every type is used, and the classic opener stays common", () => {
    const counts = { trap: 0, twin: 0, math: 0, read: 0 };
    for (const v of all) {
      const a = shortAngle(v);
      counts[a.kind]++;
      expect(a.hook.en.trim()).not.toBe("");
      expect(a.bait.trim()).not.toBe("");
      expect(a.baitSpoken).not.toMatch(/[✅❌「」]/u);
      expect(a.label).toBe(ANGLE_LABELS[a.kind]);
    }
    for (const n of Object.values(counts)) expect(n).toBeGreaterThan(20);
    expect(counts.read / all.length).toBeGreaterThan(0.5);
  });

  it("puts the hook type in the studio meta, the title and the first description line", () => {
    const ctx = { level: "N5" as const, wordNumber: 9, lessonNumber: 1, lessonTheme: "Theme" };
    const meta = buildShortMeta(find("土産"), ctx);
    expect(meta.hookType).toBe("trap");
    expect(meta.hookLabel).toBe("Reading trap");
    expect(meta.title.startsWith("Most learners misread this!")).toBe(true);
    expect(meta.description.split("\n")[0]).toContain("Reading trap");
    expect(meta.description).toContain("Comment ✅ or ❌");
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
    const prompt = host.querySelector(".sh-outro-prompt");
    expect(prompt?.textContent).not.toMatch(/[「」]/u);
    expect(prompt?.querySelector("br + .sh-outro-word")?.textContent).toBe("人");
    expect(host.querySelector(".sh-next-word")?.textContent).toBe("男");
  });

  it("loop: fades back to the opening frame (hook line, no furigana, empty bar)", () => {
    stage({ phase: "idle" });
    const opening = host.querySelector(".sh-col")?.innerHTML;
    stage({ phase: "loop" });
    expect(host.querySelector(".sh-stage--loop")).not.toBeNull();
    expect(host.querySelector(".sh-col")?.innerHTML).toBe(opening);
    expect(host.querySelector(".sh-outro")).toBeNull();
    expect(host.querySelector("rt")).toBeNull();
    stage({ phase: "done" });
    expect(host.querySelector(".sh-col")?.innerHTML).toBe(opening);
  });

  it("twin outro: numbered choices to comment", () => {
    const twin = [...vocabulary, ...vocabularyN3].find((v) => v.word === "洗濯")!;
    stage({ phase: "outro", item: twin });
    const choices = [...host.querySelectorAll(".sh-choice")].map((c) => c.textContent);
    expect(choices).toHaveLength(2);
    expect(choices.join(" ")).toContain("1");
    expect(choices.join(" ")).toContain("選択");
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
    const order = ["idle", ...SHORT_PHASES, "loop", "done"];
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
