import { describe, expect, it } from "vitest";
import {
  DUO_WINDOW_MS,
  facingSign,
  gazeBias,
  isDuoActive,
  msUntilSolo,
  recordVoice,
  seatRole,
  tiltBias,
} from "./duo";

describe("duo stage", () => {
  it("needs both voices within the window", () => {
    let r = recordVoice({}, "ja", 1000);
    expect(isDuoActive(r, 1000)).toBe(false);
    r = recordVoice(r, "en", 5000);
    expect(isDuoActive(r, 5000)).toBe(true);
    expect(isDuoActive(r, 1000 + DUO_WINDOW_MS)).toBe(true);
    expect(isDuoActive(r, 1001 + DUO_WINDOW_MS)).toBe(false);
  });

  it("stays together while the voices keep alternating", () => {
    let r = recordVoice(recordVoice({}, "ja", 0), "en", 2000);
    r = recordVoice(r, "ja", 25_000);
    expect(isDuoActive(r, 31_000)).toBe(true);
    expect(msUntilSolo(r, 31_000)).toBe(2000 + DUO_WINDOW_MS - 31_000);
    expect(msUntilSolo({ ja: 0 }, 10)).toBeNull();
  });

  it("assigns seat roles", () => {
    expect(seatRole(false, "ja", "ja", true)).toBe("solo");
    expect(seatRole(true, "ja", "ja", true)).toBe("speaking");
    expect(seatRole(true, "en", "ja", true)).toBe("listening");
    expect(seatRole(true, "en", "ja", false)).toBe("idle");
  });

  it("turns the pair toward each other", () => {
    expect(facingSign("ja")).toBe(1);
    expect(facingSign("en")).toBe(-1);
    expect(gazeBias("listening", "ja")).toBeGreaterThan(0);
    expect(gazeBias("listening", "en")).toBeLessThan(0);
    expect(Math.abs(tiltBias("listening", "en"))).toBeGreaterThan(
      Math.abs(tiltBias("speaking", "en"))
    );
    expect(gazeBias("solo", "ja")).toBe(0);
  });

  it("follows the partner's real direction when the pair is apart", () => {
    // Andrew seated to Nanami's left: she looks left, he looks right.
    expect(gazeBias("listening", "ja", -1)).toBeLessThan(0);
    expect(gazeBias("listening", "en", 1)).toBeGreaterThan(0);
    expect(tiltBias("listening", "ja", -1)).toBeLessThan(0);
    // Straight above or below: no sideways pull.
    expect(gazeBias("listening", "ja", 0)).toBe(0);
  });
});
