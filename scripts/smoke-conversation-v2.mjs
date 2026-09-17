/**
 * Smoke Conversation Engine V2 City Hall paths.
 * Usage: node scripts/smoke-conversation-v2.mjs [baseUrl]
 */
import { chromium } from "playwright";

const BASE = process.argv[2] || "http://127.0.0.1:5175";
const PROFILE_KEY = "jlpt-trainer:pera-pera-quest:v1";

function profile() {
  const now = Date.now();
  return {
    version: 1,
    playerName: "V2 Tester",
    xp: 0,
    currentChapter: 1,
    completedQuestIds: [],
    unlockedLocationIds: ["home", "city-hall", "training-dojo", "weak-word-dungeon"],
    activeQuestId: "city-hall-register",
    languageStats: {
      vocabulary: 10,
      grammar: 10,
      listening: 10,
      reading: 10,
      conversation: 10,
      politeness: 10,
    },
    completedQuests: [],
    metNpcIds: [],
    rewardedQuestIds: [],
    flags: { developerMode: true },
    seals: [],
    relationships: [],
    coins: 0,
    unlockedSkillNodes: [],
    immersion: { enabled: true, hideEnglish: true, hideSubtitles: true },
    daily: null,
    livingJapanese: {},
    recentFailConcepts: [],
    updatedAt: now,
  };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.setDefaultTimeout(20000);

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.evaluate(
    ({ key, p }) => localStorage.setItem(key, JSON.stringify(p)),
    { key: PROFILE_KEY, p: profile() }
  );
  await page.reload({ waitUntil: "networkidle" });

  await page.getByRole("button", { name: /Pera Pera Quest|ペラペラ/i }).click();
  await page.getByRole("heading", { name: "ペラペラクエスト" }).waitFor();
  // Immersion already seeded ON
  await page.getByRole("button", { name: /Enter Kotoba Town/i }).click();
  await page.getByRole("button", { name: /City Hall/i }).click();
  await page.getByRole("heading", { name: /転入届を出せ/ }).waitFor();

  // V2 banner shows Conversation
  await page.getByText(/Conversation/i).first().waitFor();
  await page.locator("[aria-label^=Communication]").first().waitFor();
  const meter = await page.locator("[aria-label^=Communication]").first().getAttribute("aria-label");
  assert(meter && /7[0-9]%|75%/.test(meter), `Expected ~75% start, got ${meter}`);

  // Intro EN hidden under Immersion
  assert(
    !(await page.getByText(/Complete your address registration/i).isVisible().catch(() => false)),
    "Intro EN should be hidden"
  );
  await page.getByRole("button", { name: /Show Help/i }).click();
  await page.getByText(/Complete your address registration/i).waitFor();
  await page.getByRole("button", { name: /Hide Help/i }).click();
  await page.getByRole("button", { name: /^Begin$/i }).click();

  // Reception — pick awkward branch then rejoin
  await page.getByText(/本日はどのようなご用件でしょうか/).waitFor();
  await page.locator("button.ppq-choice").filter({ hasText: "住所です。" }).click();
  await page.getByText(/awkward|△/i).first().waitFor();
  await page.getByRole("button", { name: /^Continue$/i }).click();

  await page.getByText(/転入届でしょうか/).waitFor();
  await page
    .locator("button.ppq-choice")
    .filter({ hasText: "転入届を出したいです" })
    .click();
  await page.getByRole("button", { name: /^Continue$/i }).click();

  // purpose-ok reaction
  await page.getByText(/いくつか確認しますね/).waitFor();
  await page.getByRole("button", { name: /^Continue$/i }).click();

  // Listening date — natural answer
  await page.getByText(/Transcript hidden|よく聞いて/i).first().waitFor();
  await page
    .locator("button.ppq-choice")
    .filter({ hasText: "先週の月曜日です" })
    .click();
  await page.getByRole("button", { name: /^Continue$/i }).click();
  await page.getByText(/書類をお願いします/).waitFor();
  await page.getByRole("button", { name: /^Continue$/i }).click();

  // 記入 clarification branch
  await page.getByText(/ご記入ください/).waitFor();
  await page
    .locator("button.ppq-choice")
    .filter({ hasText: "記入』ってどういう意味" })
    .click();
  await page.getByRole("button", { name: /^Continue$/i }).click();
  await page.getByText(/名前や住所などを書くこと/).waitFor();
  await page.getByRole("button", { name: /^Continue$/i }).click();

  // Reuse 記入
  await page
    .locator("button.ppq-choice")
    .filter({ hasText: "記入できました" })
    .click();
  await page.getByRole("button", { name: /^Continue$/i }).click();

  await page
    .locator("button.ppq-choice")
    .filter({ hasText: "はい、お願いします" })
    .click();
  await page.getByRole("button", { name: /^Continue$/i }).click();

  // Boss listening
  await page
    .locator("button.ppq-choice")
    .filter({ hasText: "三番ですね" })
    .click();
  await page.getByRole("button", { name: /^Continue$/i }).click();

  await page.getByText(/ありがとうございました/).waitFor();
  await page.getByRole("button", { name: /^Finish$/i }).click();

  await page.getByText(/QUEST COMPLETE|Mission Complete/i).first().waitFor();
  await page.getByText(/Communication/i).first().waitFor();
  console.log("PASS conversation-v2 city-hall path");
  await browser.close();
}

main().catch((err) => {
  console.error("FAIL", err);
  process.exit(1);
});
