import { afterEach, describe, expect, it } from "vitest";
import {
  __resetSceneBus,
  getCurrentScene,
  pushScene,
  subscribeToScene,
  type HeadScene,
} from "./sceneBus";

afterEach(() => __resetSceneBus());

describe("sceneBus", () => {
  it("latest push wins and releasing restores the one below", () => {
    const seen: (HeadScene | null)[] = [];
    subscribeToScene((s) => seen.push(s));
    const a = pushScene({ backdrop: "home" });
    const b = pushScene({ backdrop: "office", prop: "phone" });
    expect(getCurrentScene()).toEqual({ backdrop: "office", prop: "phone" });
    b();
    expect(getCurrentScene()).toEqual({ backdrop: "home" });
    a();
    expect(getCurrentScene()).toBeNull();
    expect(seen.map((s) => s?.backdrop ?? null)).toEqual(["home", "office", "home", null]);
  });

  it("releasing a lower entry does not notify, and double release is safe", () => {
    const seen: (HeadScene | null)[] = [];
    const a = pushScene({ backdrop: "home" });
    pushScene({ backdrop: "cafe" });
    subscribeToScene((s) => seen.push(s));
    a();
    a();
    expect(seen).toEqual([]);
    expect(getCurrentScene()?.backdrop).toBe("cafe");
  });
});
