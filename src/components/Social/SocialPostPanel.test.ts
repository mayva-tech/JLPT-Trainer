import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getPlaylistLessonById } from "../../data/playlists";
import { SocialPostBody, SocialPostPanel } from "./SocialPostPanel";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  globalThis.localStorage?.clear();
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

const panel = () => document.querySelector(".social-panel")!;
const button = (text: string) =>
  [...panel().querySelectorAll("button")].find((b) => b.textContent?.trim() === text)!;

describe("SocialPostPanel", () => {
  it("shows the lesson post, switches platforms and opens a single word", () => {
    const onClose = vi.fn();
    act(() => root.render(createElement(SocialPostPanel, { target: { type: "toc", id: "word-pl-n5-03" }, onClose })));

    expect(panel().querySelector(".social-heading")?.textContent).toBe("JLPT N5 Vocabulary #3");
    expect(button("Copy Universal Post")).toBeTruthy();

    act(() => button("YouTube").click());
    for (const label of ["Copy Title", "Copy Description", "Copy Hashtags", "Copy YouTube"]) {
      expect(button(label), label).toBeTruthy();
    }

    act(() => button("Shorts").click());
    const caption = panel().querySelectorAll("textarea")[1] as HTMLTextAreaElement;
    expect(caption.value).toContain("#shorts");

    const firstWord = panel().querySelector(".social-child") as HTMLButtonElement;
    act(() => firstWord.click());
    expect(panel().querySelector(".social-heading")?.textContent).toMatch(/word #\d+/);
    act(() => button("↑ Whole lesson").click());
    expect(panel().querySelector(".social-heading")?.textContent).toBe("JLPT N5 Vocabulary #3");
  });

  it("opens inline on the Shorts tab for a Short", () => {
    act(() =>
      root.render(
        createElement(SocialPostBody, {
          target: { type: "short", id: getPlaylistLessonById("pl-n5-03")!.vocabularyIds[0]!, strokeCredit: true },
          platformStoreKey: "test:shorts-platform",
          defaultPlatform: "youtube-shorts",
        })
      )
    );
    const tab = host.querySelector(".social-tab--on");
    expect(tab?.textContent).toBe("Shorts");
    expect(host.querySelector(".social-badge")?.textContent).toMatch(/^Hook: /);
    const texts = [...host.querySelectorAll("textarea")].map((t) => t.value);
    expect(texts[0]).toContain("#shorts");
    expect(texts[1]).toContain("KanjiVG");
  });

  it("closes on Escape and keeps keys away from the player", () => {
    const onClose = vi.fn();
    const behind = vi.fn();
    window.addEventListener("keydown", behind);
    act(() => root.render(createElement(SocialPostPanel, { target: { type: "toc", id: "grammar-f1-10" }, onClose })));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    expect(behind).not.toHaveBeenCalled();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(onClose).toHaveBeenCalled();
    window.removeEventListener("keydown", behind);
  });
});
