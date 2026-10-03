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
