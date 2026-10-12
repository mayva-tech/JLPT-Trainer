import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import { HighlightedEnglish } from "./HighlightedEnglish";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** Text of each chunk with "|" where a <wbr> break opportunity sits. */
function chunks(text: string): string[] {
  const host = document.createElement("div");
  const root = createRoot(host);
  act(() =>
    root.render(createElement(HighlightedEnglish, { text, className: "x", highlight: null, jpWordBreaks: true }))
  );
  const out = [...host.querySelectorAll(".speech-char:not(.speech-space)")].map((el) =>
    [...el.childNodes].map((n) => (n.nodeName === "WBR" ? "|" : n.textContent)).join("")
  );
  act(() => root.unmount());
  return out;
}

describe("HighlightedEnglish jpWordBreaks", () => {
  it("keeps a Japanese word whole and only breaks between word groups", () => {
    expect(chunks("online shops often write 在庫切れ for the same idea.")).toContain("在庫切れ");
    expect(chunks("品切れの商品 is notice language;")[0]).toBe("品切れの|商品");
    expect(chunks("大雨にもかかわらず、試合は続いた。")[0]).toBe("大雨にもかかわらず、|試合は|続いた。");
  });

  it("leaves English untouched", () => {
    expect(chunks("Handy, but pushy.")).toEqual(["Handy,", "but", "pushy."]);
  });
});

function renderGlossed(text: string, highlight: { start: number; end: number } | null = null) {
  const host = document.createElement("div");
  const root = createRoot(host);
  act(() =>
    root.render(
      createElement(HighlightedEnglish, { text, className: "x", highlight, readingGlosses: true })
    )
  );
  return { host, done: () => act(() => root.unmount()) };
}

describe("HighlightedEnglish readingGlosses", () => {
  it("puts the reading over the kanji instead of after it", () => {
    const { host, done } = renderGlossed("方 かた is the polite version, and 者（もの） is humble.");
    const rubies = [...host.querySelectorAll("ruby.reading-gloss")].map((r) => [
      r.firstChild?.textContent,
      r.querySelector("rt")?.textContent,
    ]);
    expect(rubies).toEqual([
      ["方", "かた"],
      ["者", "もの"],
    ]);
    const shown = (host.textContent ?? "").replace(/かた|もの/g, "");
    expect(shown).toBe("方 is the polite version, and 者 is humble.");
    done();
  });

  it("covers a number written before the kanji", () => {
    const { host, done } = renderGlossed("Platform 3 = 3番線(さんばんせん).");
    const ruby = host.querySelector("ruby.reading-gloss");
    expect(ruby?.firstChild?.textContent).toBe("3番線");
    expect(ruby?.querySelector("rt")?.textContent).toBe("さんばんせん");
    done();
  });

  it("lights the kanji while its reading is spoken", () => {
    const text = "人 is neutral; 方 かた is polite.";
    const at = text.indexOf("方");
    const { host, done } = renderGlossed(text, { start: at, end: at + 4 });
    expect(host.querySelector(".speech-active")?.textContent).toBe("方かた");
    done();
  });
});
