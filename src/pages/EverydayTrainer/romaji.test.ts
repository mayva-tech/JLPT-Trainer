import { describe, expect, it } from "vitest";
import { kanaToRomaji } from "./romaji";

describe("kanaToRomaji (modified Hepburn)", () => {
  it.each([
    ["つりかわ", "tsurikawa"],
    ["かいさつぐち", "kaisatsuguchi"],
    ["おうだん ほどう", "ōdan hodō"],
    ["おおやさん", "ōyasan"],
    ["ゆうせんせき", "yūsenseki"],
    ["エレベーター", "erebētā"],
    ["しょうひ きげん", "shōhi kigen"],
    ["ちゅうりんじょう", "chūrinjō"],
    ["じゃぐち", "jaguchi"],
    ["きって", "kitte"],
    ["にっちょく", "nitchoku"],
    ["ホッチキス", "hotchikisu"],
    ["ティッシュ", "tisshu"],
    ["ファイル", "fairu"],
    ["チェックイン", "chekkuin"],
    ["てんいん", "ten'in"],
    ["ゆうびんうけ", "yūbin'uke"],
    ["めいし", "meishi"],
    ["ふみきり", "fumikiri"],
    ["でんし レンジ", "denshi renji"],
    ["ゴミばこ", "gomibako"],
  ])("%s → %s", (kana, romaji) => {
    expect(kanaToRomaji(kana)).toBe(romaji);
  });
});
