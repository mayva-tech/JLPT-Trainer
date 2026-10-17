import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LessonNuance } from "./LessonNuance";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
(globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= class {
  observe() {}
  disconnect() {}
};

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
});

const NOTE = "Used with friends; 申す is the humble form.";

function render(active: boolean) {
  act(() =>
    root.render(
      createElement(
        "div",
        { className: "safe-area" },
        createElement("p", { className: "card-text" }, "card"),
        createElement(LessonNuance, { note: NOTE, active, highlight: { start: 0, end: 4 } })
      )
    )
  );
}

describe("nuance focus (lesson cards)", () => {
  it("while the nuance is spoken: the card steps back, an enlarged copy carries the karaoke", () => {
    render(true);
    const safe = host.querySelector(".safe-area")!;
    expect(safe.classList.contains("safe-area--nuance-focus")).toBe(true);
    expect(safe.querySelector(".nuance-focus .speech-active")?.textContent).toBe("Used");
    expect(safe.querySelector(".lesson-nuance--held .speech-active")).toBeNull();
  });

  it("afterwards: back to the normal box, nothing left behind", () => {
    render(true);
    render(false);
    const safe = host.querySelector(".safe-area")!;
    expect(safe.classList.contains("safe-area--nuance-focus")).toBe(false);
    expect(safe.querySelector(".nuance-focus, .lesson-nuance--held")).toBeNull();
    expect(safe.querySelectorAll(".lesson-nuance")).toHaveLength(1);
  });
});
