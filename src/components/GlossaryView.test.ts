import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GlossaryView, type GlossaryNavigateTarget } from "./GlossaryView";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;
let onNavigate: ReturnType<typeof vi.fn<(t: GlossaryNavigateTarget) => void>>;

function type(text: string) {
  const input = host.querySelector<HTMLInputElement>(".glossary-search")!;
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
  act(() => {
    set.call(input, text);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

beforeEach(() => {
  onNavigate = vi.fn();
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  act(() => root.render(createElement(GlossaryView, { onNavigate })));
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

describe("Glossary search", () => {
  it("finds a word by its English meaning and opens it in the player", () => {
    type("careful; polite");
    expect(host.querySelector(".glossary-block-title")?.textContent).toMatch(/^Words · \d+/);
    const row = [...host.querySelectorAll("tr")].find((r) => r.querySelector(".glossary-id")?.textContent === "4108");
    const link = row?.querySelector<HTMLButtonElement>(".glossary-link");
    expect(link, "丁寧 row").toBeTruthy();
    act(() => link!.click());
    expect(onNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "word", vocabularyId: 4108 }),
    );
  });

  it("finds the same word by romaji", () => {
    type("teinei");
    const ids = [...host.querySelectorAll(".glossary-id")].map((e) => e.textContent);
    expect(ids).toContain("4108");
  });

  it("lists words and grammar together while searching, across N2 and N1", () => {
    type("reason");
    const titles = [...host.querySelectorAll(".glossary-block-title")].map((e) => e.textContent);
    expect(titles.some((t) => t?.startsWith("Words"))).toBe(true);
    expect(titles.some((t) => t?.startsWith("Grammar"))).toBe(true);
  });

  it("opens a grammar pattern found by search", () => {
    type("reason");
    const grammarSection = [...host.querySelectorAll(".glossary-block")].find((s) =>
      s.querySelector(".glossary-block-title")?.textContent?.startsWith("Grammar"),
    )!;
    act(() => grammarSection.querySelector<HTMLButtonElement>(".glossary-link")!.click());
    expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ kind: "grammar" }));
  });

  it("says so when nothing matches, and restores the page when cleared", () => {
    type("qqqxxx");
    expect(host.querySelector(".glossary-empty")).not.toBeNull();
    type("");
    expect(host.querySelector(".glossary-empty")).toBeNull();
    expect(host.querySelectorAll(".glossary-link").length).toBeGreaterThan(100);
  });

  it("has a page for every level, N5 to N1, each with its own words", () => {
    const tabs = [...host.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    expect(tabs.map((t) => t.textContent)).toEqual(["N5", "N4", "N3", "N2", "N1"]);
    const firstTitle = (level: string) => {
      act(() => tabs.find((t) => t.textContent === level)!.click());
      return host.querySelector(".glossary-section .toc-group-title")?.textContent ?? "";
    };
    expect(firstTitle("N5")).toContain("JLPT N5 Vocabulary");
    expect(firstTitle("N4")).toContain("JLPT N4 Vocabulary");
    expect(firstTitle("N3")).toContain("JLPT N3 Vocabulary");
    expect(firstTitle("N1")).toContain("JLPT N1 Vocabulary");
  });

  it("says plainly when a level has no grammar yet", () => {
    act(() => [...host.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find((t) => t.textContent === "N5")!.click());
    act(() => [...host.querySelectorAll<HTMLButtonElement>("button.toc-item")].find((b) => b.textContent?.startsWith("Grammar"))!.click());
    expect(host.querySelector(".glossary-empty")?.textContent).toContain("No N5 grammar");
  });

  it("lists synonym / antonym pairs on the Related tab and finds them by search", () => {
    act(() => [...host.querySelectorAll<HTMLButtonElement>("button.toc-item")].find((b) => b.textContent?.startsWith("Related"))!.click());
    expect(host.querySelectorAll(".glossary-table--pairs tr").length).toBeGreaterThan(20);
    type("home; one's house");
    expect(host.querySelector(".glossary-block-title")).not.toBeNull();
    expect([...host.querySelectorAll(".glossary-block-title")].some((e) => e.textContent?.startsWith("Related words"))).toBe(true);
  });
});
