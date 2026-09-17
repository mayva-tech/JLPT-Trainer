/**
 * Chapter 3 smoke — Friend Invitation awkward path + chapter unlock.
 * Usage: node scripts/smoke-chapter3.mjs [baseUrl]
 */
import { chromium } from "playwright";
import { createTestRpgProfile } from "./lib/testRpgProfile.mjs";

const BASE = process.argv[2] || "http://127.0.0.1:5177";
const PROFILE_KEY = "jlpt-trainer:pera-pera-quest:v1";

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.setDefaultTimeout(20000);

  const profile = createTestRpgProfile({
    playerName: "Ch3 Tester",
    completedThroughChapter: 2,
    activeQuestId: "friend-invitation",
    xp: 800,
    metNpcIds: ["haruka", "ken", "mika-coworker", "suzuki-manager"],
    seals: ["city-hall", "daily-life", "communication", "workplace"],
    relationships: [{ npcId: "haruka", level: 0, xp: 0 }],
    coins: 100,
    languageStats: {
      vocabulary: 40,
      grammar: 35,
      listening: 35,
      reading: 35,
      conversation: 45,
      politeness: 40,
    },
    immersion: { enabled: false, hideEnglish: false, hideSubtitles: false },
  });

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.evaluate(
    ({ key, p }) => localStorage.setItem(key, JSON.stringify(p)),
    { key: PROFILE_KEY, p: profile }
  );
  await page.reload({ waitUntil: "networkidle" });

  await page.getByRole("button", { name: /Pera Pera Quest|ペラペラ/i }).click();
  await page.getByRole("heading", { name: "ペラペラクエスト" }).waitFor();

  await page.getByRole("button", { name: /Continue Quest/i }).click();
  await page.locator(".ppq-quest").waitFor();
  await page.getByText(/友だちの誘い|Friend Invitation/).first().waitFor();

  const begin = page.getByRole("button", { name: /^Begin$/i });
  if (await begin.count()) await begin.click();

  await page.getByText(/ご飯でもどうですか|ご飯行くんだけど/).waitFor();
  await page
    .locator("button.ppq-choice")
    .filter({ hasText: "承知いたしました" })
    .click();
  await page.getByText(/Awkward|△|かしこまり|formal/i).first().waitFor();
  console.log("PASS awkward formal feedback shown");
  await page.getByRole("button", { name: /^Continue$/i }).click();

  await page
    .locator("button.ppq-choice")
    .filter({ hasText: /行きたい|つい/ })
    .first()
    .click();
  await page.getByRole("button", { name: /^Continue$/i }).click();

  for (let i = 0; i < 12; i++) {
    if (await page.getByRole("button", { name: /^Finish$/i }).count()) break;
    const preferred = page
      .locator("button.ppq-choice:not([disabled])")
      .filter({ hasText: /日曜|楽しみ|全然大丈夫|うん、日曜|いいね|行きたい|りょーかい/ });
    if (await preferred.count()) {
      await preferred.first().click();
    } else if (await page.locator("button.ppq-choice:not([disabled])").count()) {
      await page.locator("button.ppq-choice:not([disabled])").first().click();
    }
    const cont = page.getByRole("button", { name: /^Continue$/i });
    if (await cont.count()) await cont.click();
  }

  if (await page.getByRole("button", { name: /^Finish$/i }).count()) {
    await page.getByRole("button", { name: /^Finish$/i }).click();
  }

  await page.getByText(/QUEST COMPLETE|COMPLETE/i).first().waitFor();
  console.log("PASS chapter3 friend-invitation complete");

  await page.evaluate(
    ({ key }) => {
      const raw = JSON.parse(localStorage.getItem(key) || "{}");
      const rest = [
        "friend-invitation",
        "senpai-favor",
        "saying-no",
        "awkward-apology",
        "workplace-discussion",
        "relationships-challenge",
      ];
      raw.completedQuestIds = [...new Set([...(raw.completedQuestIds || []), ...rest])];
      raw.rewardedQuestIds = [...new Set([...(raw.rewardedQuestIds || []), ...rest])];
      raw.flags = { ...(raw.flags || {}), chapter3Complete: true };
      raw.seals = [...new Set([...(raw.seals || []), "social"])];
      raw.currentChapter = 3;
      localStorage.setItem(key, JSON.stringify(raw));
    },
    { key: PROFILE_KEY }
  );
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Pera Pera Quest|ペラペラ/i }).click();
  await page.getByRole("button", { name: /Chapter 3/i }).first().click();
  await page
    .getByRole("navigation", { name: "Pera Pera Quest" })
    .getByRole("button", { name: "Quests" })
    .click();
  await page.getByRole("tab", { name: /Chapter 3/i }).click();
  await page.getByText(/仕事と敬語|Coming soon|第4章/).first().waitFor();
  console.log("PASS chapter3 complete + chapter4 teaser + social seal seeded");

  await browser.close();
}

main().catch((err) => {
  console.error("FAIL", err);
  process.exit(1);
});
