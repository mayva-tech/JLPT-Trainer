import { describe, expect, it } from "vitest";
import { onomatopoeiaItems } from "../data/onomatopoeia";
import { buildOnoPlaySteps } from "./onomatopoeiaPlayback";

describe("buildOnoPlaySteps", () => {
  it("voices every visible line on どきどき, Nanami for JP and EN for English", () => {
    const item = onomatopoeiaItems.find((entry) => entry.japanese === "どきどき");
    expect(item).toBeTruthy();
    const steps = buildOnoPlaySteps(item!);

    expect(steps.map((step) => [step.part, step.lang, step.text])).toEqual([
      ["categoryJa", "ja", "感情"],
      ["categoryJa", "ja", "気持ち"],
      ["categoryEn", "en", "Emotion"],
      ["word", "ja", "どきどき"],
      [
        "meaning",
        "en",
        "heart pounding / thumping with nerves or excitement",
      ],
      ["collocation", "ja", "どきどきする"],
      [
        "nuance",
        "en",
        "The sound of a racing heartbeat. Covers both fear and pleasant anticipation, so context decides which one it is.",
      ],
      ["example", "ja", "面接の前はどきどきしました。"],
      ["exampleEn", "en", "My heart was pounding before the interview."],
      ["example", "ja", "面接の前はどきどきしました。"],
    ]);
  });

  it("splits mixed Japanese in the nuance onto Nanami", () => {
    const item = onomatopoeiaItems.find((entry) => entry.japanese === "わくわく");
    expect(item).toBeTruthy();
    const nuanceSteps = buildOnoPlaySteps(item!).filter(
      (step) => step.part === "nuance"
    );
    expect(nuanceSteps.some((step) => step.lang === "ja" && step.text.includes("どきどき"))).toBe(
      true
    );
    expect(nuanceSteps.some((step) => step.lang === "en")).toBe(true);
  });
});
