import { afterEach, describe, expect, it } from "vitest";
import {
  __resetSenseiBus,
  getSenseiSettings,
  setSenseiSettings,
  showSenseiTip,
  subscribeToSenseiSettings,
  subscribeToSenseiTips,
  type SenseiTip,
} from "./senseiBus";

afterEach(() => {
  __resetSenseiBus();
  localStorage.clear();
});

describe("senseiBus", () => {
  it("defaults to an enabled tanuki", () => {
    expect(getSenseiSettings()).toEqual({ character: "tanuki", enabled: true });
  });

  it("persists and broadcasts settings", () => {
    const seen: string[] = [];
    subscribeToSenseiSettings((s) => seen.push(`${s.character}:${s.enabled}`));
    setSenseiSettings({ character: "neko" });
    setSenseiSettings({ enabled: false });
    expect(seen).toEqual(["neko:true", "neko:false"]);
    __resetSenseiBus();
    expect(getSenseiSettings()).toEqual({ character: "neko", enabled: false });
  });

  it("ignores junk in storage", () => {
    localStorage.setItem("jlpt-trainer:sensei:v1", "{not json");
    expect(getSenseiSettings().character).toBe("tanuki");
  });

  it("delivers tips to subscribers", () => {
    const seen: SenseiTip[] = [];
    const off = subscribeToSenseiTips((t) => seen.push(t));
    showSenseiTip({ id: "a", en: "hello" });
    off();
    showSenseiTip({ id: "b", en: "gone" });
    expect(seen.map((t) => t.id)).toEqual(["a"]);
  });
});
