import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { vocabulary } from "../../data/vocabulary";
import { playlistLessons, getPlaylistWordRange, parsePlaylistLessonId } from "../../data/playlists";
import type { VocabularyItem } from "../../types/vocabulary";
import { COUNTDOWN_MS, LOOP_MS, SHORT_PHASES, buildShortScript, estimateShortSeconds } from "./shortScript";
import { buildShortMeta } from "./shortsMeta";
import { shortAngle } from "./shortAngle";
import {
  BAIT_SPOKEN,
  LETTERS,
  REPLY_BANNER,
  decoyFor,
  findMark,
  messageFor,
  messageHook,
  usesMessage,
} from "./shortMessage";
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

const word = (w: string) => vocabulary.find((v) => v.word === w)!;
const ENGLISH_ONLY = /^[^぀-ヿ一-龯]+$/u;

/* ── The hook itself ──────────────────────────────────────────── */

describe("message hook data", () => {
  it("marks the word in its sentence: whole word, or its stem when conjugated", () => {
    expect(findMark("人", "駅の前に人が集まっています。")).toEqual({ start: 4, end: 5 });
    const s = "毎日日本語の本を読みます。";
    const m = findMark("読む", s)!;
    expect(s.slice(m.start, m.end)).toBe("読");
    const t = "朝ご飯を食べました。";
    const n = findMark("食べる", t)!;
    expect(t.slice(n.start, n.end)).toBe("食べ");
    // Kana words never mark a lone kana; long words never mark one kanji.
    expect(findMark("する", "運動をします。")).toBeNull();
    expect(findMark("図書館", "図面を見る。")).toBeNull();
  });

  it("nearly every word gets one; the rest fall back to the classic opener", () => {
    const hooks = vocabulary.map((v) => messageHook(v));
    expect(hooks.filter(Boolean).length / vocabulary.length).toBeGreaterThan(0.99);
    const する = vocabulary.find((v) => v.word === "する");
    if (する) {
      expect(messageHook(する)).toBeNull();
      expect(usesMessage(する, "message")).toBe(false);
      expect(buildShortScript(する, { hookStyle: "message" })[0]).toMatchObject({ text: shortAngle(する).hook.en });
    }
  });

  it("A / B: the real first sense and a decoy that never shares a word with it", () => {
    for (const v of vocabulary) {
      const m = messageHook(v);
      if (!m) continue;
      expect(m.choices).toHaveLength(2);
      expect(m.choices[m.answer]).toBe(v.meaning.split(/[;；]/)[0]!.replace(/\s*\([^)]*\)\s*$/, "").trim() || v.meaning.trim());
      const decoy = m.choices[1 - m.answer]!;
      expect(decoy).not.toBe(m.choices[m.answer]);
      expect(decoy).not.toMatch(/\b(this|that|here|there)\b/i);
      expect(v.meaning.toLowerCase().split(/[;,]\s*/)).not.toContain(decoy.toLowerCase());
      // Verbs against verbs ("to …"), everything else against non-verbs.
      expect(/^to\s/i.test(decoy)).toBe(/^to\s/i.test(m.choices[m.answer]!));
      expect(m.text.slice(m.mark.start, m.mark.end).length).toBeGreaterThan(0);
      expect(m.answerSpoken).toBe(`It's ${LETTERS[m.answer]}!`);
      expect(m.opener).toMatch(ENGLISH_ONLY);
      expect(m.ask).toMatch(ENGLISH_ONLY);
    }
  });

  it("is stable per word, and both letters are the answer about as often", () => {
    const v = word("注文");
    expect(messageHook(v)).toEqual(messageHook(v));
    expect(decoyFor(v)).toBe(decoyFor(v));
    const answers = vocabulary.map((x) => messageHook(x)?.answer).filter((a) => a !== undefined);
    const a = answers.filter((x) => x === 0).length / answers.length;
    expect(a).toBeGreaterThan(0.4);
    expect(a).toBeLessThan(0.6);
  });

  it("styles: classic never, message always, mix on even ids", () => {
    const even = vocabulary.find((v) => v.id % 2 === 0 && messageHook(v))!;
    const odd = vocabulary.find((v) => v.id % 2 === 1 && messageHook(v))!;
    expect(usesMessage(even, "classic")).toBe(false);
    expect(usesMessage(odd, "message")).toBe(true);
    expect(usesMessage(even, "mix")).toBe(true);
    expect(usesMessage(odd, "mix")).toBe(false);
    expect(usesMessage(even, undefined)).toBe(false);
  });
});

/* ── Beat sheet ───────────────────────────────────────────────── */

describe("message Short script", () => {
  const item = word("注文");
  const msg = messageHook(item)!;
  const steps = buildShortScript(item, { hookStyle: "message", drawMs: 800 });

  it("opens on the ding, then Andrew, Nanami's message, the question and the countdown", () => {
    expect(steps[0]).toMatchObject({ kind: "wait", phase: "hook", sfx: "ding" });
    expect(steps[1]).toMatchObject({ kind: "say", phase: "hook", lang: "en", text: msg.opener });
    expect(steps[2]).toMatchObject({ kind: "say", phase: "hook", lang: "ja", text: item.sentence, reading: item.sentenceReading });
    expect(steps[3]).toMatchObject({ kind: "say", phase: "hook", lang: "en", text: msg.ask });
    expect(steps[4]).toMatchObject({ kind: "wait", phase: "hook", ms: COUNTDOWN_MS, cue: "countdown" });
    expect(steps[5]).toMatchObject({ kind: "wait", phase: "draw" });
  });

  it("answers right after the reveal, translates without re-reading, and asks A or B", () => {
    const reveal = steps.filter((s) => s.phase === "reveal" && s.kind === "say");
    expect(reveal.map((s) => s.kind === "say" && s.text)).toEqual([item.word, msg.answerSpoken]);
    const example = steps.filter((s) => s.phase === "example" && s.kind === "say");
    expect(example).toEqual([expect.objectContaining({ lang: "en", text: item.sentenceMeaning })]);
    expect(steps.find((s) => s.phase === "shadow")).toMatchObject({ lang: "ja", slow: true, text: item.sentence });
    expect(steps.find((s) => s.phase === "outro")).toMatchObject({ text: BAIT_SPOKEN });
    expect(steps.at(-1)).toMatchObject({ phase: "loop", ms: LOOP_MS });
    const phases = [...SHORT_PHASES, "loop"];
    const order = steps.map((s) => phases.indexOf(s.phase));
    for (let i = 1; i < order.length; i++) expect(order[i]).toBeGreaterThanOrEqual(order[i - 1]!);
  });

  it("the Japanese sentence is heard twice (message, reply), as in the classic Short", () => {
    const sentenceSays = (s: typeof steps) => s.filter((x) => x.kind === "say" && x.text === item.sentence).length;
    expect(sentenceSays(steps)).toBe(2);
    expect(sentenceSays(buildShortScript(item))).toBe(2);
  });

  it("every playlist word still makes a Short under a minute", () => {
    for (const { item: v } of playlistWords) {
      const s = estimateShortSeconds(v, { hookStyle: "message", drawMs: 2500 });
      expect(s).toBeLessThanOrEqual(55);
    }
  });
});

/* ── Upload text ──────────────────────────────────────────────── */

describe("message Short upload text", () => {
  it("hook type 'message', a title that asks instead of telling, A / B in the pinned comment", () => {
    const item = word("注文");
    const msg = messageHook(item)!;
    const meta = buildShortMeta(item, { level: "N2", wordNumber: 12, lessonNumber: 2, lessonTheme: "Shopping" }, { hookStyle: "message" });
    expect(meta.hookType).toBe("message");
    expect(meta.title).toContain("Nanami texted you");
    expect(meta.title).toContain(item.word);
    expect(meta.title).not.toContain(msg.choices[msg.answer]!);
    expect(meta.description.split("\n")[0]).toContain(item.sentence);
    expect(meta.description).toContain(`A) ${msg.choices[0]}`);
    expect(meta.description).toContain("Did you pick A or B?");
    expect(meta.pinnedComment).toContain(`B) ${msg.choices[1]}`);
    // Classic stays classic.
    expect(buildShortMeta(item, { level: "N2", wordNumber: 12, lessonNumber: 2, lessonTheme: "Shopping" }).hookType).not.toBe("message");
  });

  it("every playlist word's title fits in 100 characters", () => {
    for (const { item, lessonId, index } of playlistWords) {
      const parsed = parsePlaylistLessonId(lessonId)!;
      const range = getPlaylistWordRange(lessonId)!;
      const meta = buildShortMeta(
        item,
        { level: parsed.level, wordNumber: range.firstWordNumber + index, lessonNumber: range.lessonNumber, lessonTheme: "T" },
        { hookStyle: "message" }
      );
      expect([...meta.title].length).toBeLessThanOrEqual(100);
      expect(meta.title).toContain(item.word);
    }
  });
});

/* ── Stage ────────────────────────────────────────────────────── */

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

const item = word("注文");
const msg = messageHook(item)!;

function stage(over: Partial<ShortStageProps> = {}) {
  const props: ShortStageProps = {
    item,
    level: "N2",
    wordNumber: 12,
    seriesLabel: "Japanese word of the day",
    phase: "idle",
    cue: null,
    highlight: null,
    activeLang: null,
    next: null,
    ambience: false,
    pan: false,
    panSeconds: 30,
    hookStyle: "message",
    ...over,
  };
  act(() => root.render(createElement(ShortStage, props)));
}

describe("<ShortStage /> message hook", () => {
  it("frame 0 is the chat: message without furigana, the word marked, the question and A / B", () => {
    stage();
    expect(host.querySelector(".sh-stage")?.getAttribute("data-angle")).toBe("message");
    expect(host.querySelector(".sh-chat")).not.toBeNull();
    expect(host.querySelector(".sh-bubble-text")?.textContent).toBe(item.sentence);
    expect(host.querySelector(".sh-bubble-text rt")).toBeNull();
    expect([...host.querySelectorAll(".sh-bubble-text .sh-mark")].map((m) => m.textContent).join("")).toBe(item.sentence.slice(msg.mark.start, msg.mark.end));
    const replies = [...host.querySelectorAll(".sh-msg .sh-reply")].map((r) => r.textContent);
    expect(replies).toEqual([`A${msg.choices[0]}`, `B${msg.choices[1]}`]);
    // The word itself is not on screen yet (it is in the message), nor the classic opener.
    expect(host.querySelector(".sh-word")).toBeNull();
    expect(host.querySelector(".sh-hook")).toBeNull();
    expect(host.querySelector(".sh-typing--on")).toBeNull();
  });

  it("karaoke runs through the message while Nanami reads it", () => {
    stage({ phase: "hook", activeLang: "ja", highlight: { start: msg.mark.start, end: msg.mark.end } });
    expect([...host.querySelectorAll(".sh-bubble-text .speech-active")].map((m) => m.textContent).join("")).toContain(item.sentence.slice(msg.mark.start, msg.mark.end));
  });

  it("countdown: 'typing' dots and 3-2-1 inside the chat", () => {
    stage({ phase: "hook", cue: { kind: "countdown", ms: 3000, key: 4 } });
    expect(host.querySelector(".sh-typing--on")).not.toBeNull();
    expect(host.querySelectorAll(".sh-chat .sh-count span")).toHaveLength(3);
  });

  it("reveal shows the word and the answer badge; example is Nanami's bubble; shadow is your reply", () => {
    stage({ phase: "reveal" });
    expect(host.querySelector(".sh-chat")).toBeNull();
    expect(host.querySelector(".sh-word")).not.toBeNull();
    expect(host.querySelector(".sh-answer")?.textContent).toContain(LETTERS[msg.answer]!);
    stage({ phase: "example" });
    expect(host.querySelector(".sh-answer")).toBeNull();
    expect(host.querySelector(".sh-sentence--chat .sh-sentence-from")?.textContent).toContain("Nanami");
    expect(host.querySelector(".sh-sentence--chat .sh-mark")).not.toBeNull();
    stage({ phase: "shadow", cue: { kind: "repeat", ms: 3000, key: 9 } });
    expect(host.querySelector(".sh-sentence--reply")).not.toBeNull();
    expect(host.textContent).toContain(REPLY_BANNER);
  });

  it("outro asks A or B with the right one ticked; the loop frame is frame 0 again", () => {
    stage();
    const opening = host.querySelector(".sh-col")?.innerHTML;
    stage({ phase: "outro" });
    expect(host.querySelector(".sh-outro-prompt")?.textContent).toContain("A or B");
    expect(host.querySelector(".sh-replies--outro .sh-reply--right")?.textContent).toContain(msg.choices[msg.answer]!);
    stage({ phase: "loop" });
    expect(host.querySelector(".sh-col")?.innerHTML).toBe(opening);
  });

  it("classic style keeps the classic stage", () => {
    stage({ hookStyle: "classic" });
    expect(host.querySelector(".sh-chat")).toBeNull();
    expect(host.querySelector(".sh-hook--on")).not.toBeNull();
    expect(messageFor(item, "classic")).toBeNull();
  });
});

describe("useShortPlayer with the message hook", () => {
  it("plays hands-free to the end, the ding wait included", () => {
    vi.useFakeTimers();
    const steps = buildShortScript(item, { hookStyle: "message" });
    const onDone = vi.fn();
    let api: ReturnType<typeof useShortPlayer> | null = null;
    function Probe() {
      api = useShortPlayer(steps, onDone);
      return null;
    }
    act(() => root.render(createElement(Probe)));
    act(() => api!.play());
    for (let i = 0; i < 100 && !onDone.mock.calls.length; i++) {
      act(() => {
        vi.advanceTimersByTime(500);
      });
    }
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
