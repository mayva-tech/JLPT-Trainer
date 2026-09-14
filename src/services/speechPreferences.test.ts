import { describe, expect, it } from "vitest";
import {
  loadSpeechPreferences,
  SPEECH_PREFS_KEY,
  updateSpeechPreferences,
} from "../services/speechPreferences";

function memoryStore(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  };
}

describe("speechPreferences", () => {
  it("defaults auto voice on and normal rate", () => {
    expect(loadSpeechPreferences(memoryStore())).toEqual({
      autoVoice: true,
      rateMode: "normal",
    });
  });

  it("persists shared prefs for trainer + RPG", () => {
    const store = memoryStore();
    updateSpeechPreferences({ autoVoice: false, rateMode: "slow" }, store);
    expect(store.getItem(SPEECH_PREFS_KEY)).toContain("slow");
    expect(loadSpeechPreferences(store)).toEqual({
      autoVoice: false,
      rateMode: "slow",
    });
  });
});
