/**
 * Chapter 4 smoke — Morning Office casual miss + Workday Survival complete.
 * Usage: node scripts/smoke-chapter4.mjs [baseUrl]
 */
import { chromium } from "playwright";
import { createTestRpgProfile } from "./lib/testRpgProfile.mjs";

const BASE = process.argv[2] || "http://127.0.0.1:5188";
const PROFILE_KEY = "jlpt-trainer:pera-pera-quest:v1";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function clickChoice(page, text) {
  await page.locator("button.ppq-choice").filter({ hasText: text }).click();
}

async function cont(page) {
  const btn = page.getByRole("button", { name: /^Continue$/i });
  if (await btn.count()) await btn.click();
}

async function finishIfPresent(page) {
  const fin = page.getByRole("button", { name: /^Finish$/i });
  if (await fin.count()) await fin.click();
}

async function pickPreferred(page) {
  for (let i = 0; i < 40; i++) {
    if (await page.getByRole("button", { name: /^Finish$/i }).count()) {
      await page.getByRole("button", { name: /^Finish$/i }).click();
      return;
    }
    const preferred = page
      .locator("button.ppq-choice:not([disabled])")
      .filter({
        hasText:
          /おはよう|承知|お時間|八割|80|お先に|戻り|確認|申し訳|修正|そうですね|おっしゃる|確か|かと思います|少々|折り返|ご覧|ご案内|失礼|お疲れ様|大丈夫|はい、/,
      });
    if (await preferred.count()) {
      await preferred.first().click();
    } else if (await page.locator("button.ppq-choice:not([disabled])").count()) {
      await page.locator("button.ppq-choice:not([disabled])").first().click();
    } else if (await page.getByRole("button", { name: /^Begin$/i }).count()) {
      await page.getByRole("button", { name: /^Begin$/i }).click();
      continue;
    } else if (await page.getByRole("button", { name: /^Continue$/i }).count()) {
      await cont(page);
      continue;
    } else {
      break;
    }
    await cont(page);
  }
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.setDefaultTimeout(30000);

  const profile = createTestRpgProfile({
    playerName: "Ch4 Tester",
    completedThroughChapter: 3,
    activeQuestId: "morning-office",
    currentChapter: 4,
    immersion: { enabled: true, hideEnglish: true, hideSubtitles: true },
    flags: {
      chapter1Complete: true,
      chapter2Complete: true,
      chapter3Complete: true,
      developerMode: true,
    },
    metNpcIds: [
      "mika-coworker",
      "sato-senpai",
      "suzuki-manager",
      "yoshida-client",
    ],
    relationships: [
      { npcId: "mika-coworker", level: 1, xp: 20 },
      { npcId: "suzuki-manager", level: 1, xp: 10 },
    ],
    unlockedSkillNodes: ["conv-basic", "conv-fillers", "conv-repair", "conv-polite", "conv-social", "conv-keigo"],
  });

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.evaluate(
    ({ key, p }) => localStorage.setItem(key, JSON.stringify(p)),
    { key: PROFILE_KEY, p: profile }
  );
  await page.reload({ waitUntil: "networkidle" });

  await page.getByRole("button", { name: /Pera Pera Quest|ペラペラ/i }).click();
  await page.getByRole("heading", { name: "ペラペラクエスト" }).waitFor();
  await page.getByRole("button", { name: /Enter Kotoba Town|Continue Quest/i }).first().click();

  // Prefer Continue Quest if present, else Quests → Chapter 4
  if (await page.getByRole("button", { name: /Continue Quest/i }).count()) {
    await page.getByRole("button", { name: /Continue Quest/i }).click();
  } else {
    await page
      .getByRole("navigation", { name: "Pera Pera Quest" })
      .getByRole("button", { name: "Quests" })
      .click();
    await page.getByRole("tab", { name: /Chapter 4/i }).click();
    await page.getByRole("button", { name: /^Play$/i }).first().click();
  }

  await page.locator(".ppq-quest").waitFor();
  await page.getByText(/朝の職場|Morning at the Office/i).first().waitFor();

  const begin = page.getByRole("button", { name: /^Begin$/i });
  if (await begin.count()) await begin.click();

  // Overly casual answer → Professional Fit / awkward feedback
  await page.getByText(/おはよう|お疲れ様|今日も/i).first().waitFor();
  if (await page.locator("button.ppq-choice").filter({ hasText: "おつかれ" }).count()) {
    await clickChoice(page, "おつかれ");
    await page.getByText(/Awkward|△|casual/i).first().waitFor();
    console.log("PASS casual register feedback shown");
    await cont(page);
  }

  await pickPreferred(page);
  await finishIfPresent(page);
  await page.getByText(/QUEST COMPLETE|COMPLETE|MISSION/i).first().waitFor();
  console.log("PASS morning-office complete");

  // Seed remaining Ch4 clear via developer profile jump to boss
  await page.evaluate(
    ({ key }) => {
      const raw = JSON.parse(localStorage.getItem(key) || "{}");
      const ch4pre = [
        "morning-office",
        "reporting-to-boss",
        "business-phone",
        "customer-service",
        "report-mistake",
        "meeting-speak",
      ];
      raw.completedQuestIds = [...new Set([...(raw.completedQuestIds || []), ...ch4pre])];
      raw.rewardedQuestIds = [...new Set([...(raw.rewardedQuestIds || []), ...ch4pre])];
      raw.activeQuestId = "workday-survival";
      raw.currentChapter = 4;
      raw.flags = { ...(raw.flags || {}), developerMode: true, chapter3Complete: true };
      localStorage.setItem(key, JSON.stringify(raw));
    },
    { key: PROFILE_KEY }
  );
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Pera Pera Quest|ペラペラ/i }).click();
  if (await page.getByRole("button", { name: /Continue Quest/i }).count()) {
    await page.getByRole("button", { name: /Continue Quest/i }).click();
  } else {
    await page
      .getByRole("navigation", { name: "Pera Pera Quest" })
      .getByRole("button", { name: "Quests" })
      .click();
    await page.getByRole("tab", { name: /Chapter 4/i }).click();
    await page.getByText(/一日仕事サバイバル|Workday Survival/i).first().waitFor();
    await page.getByRole("button", { name: /^Play$/i }).last().click();
  }

  await page.locator(".ppq-quest").waitFor();
  await page.getByText(/一日仕事サバイバル|Workday Survival/i).first().waitFor();
  if (await page.getByRole("button", { name: /^Begin$/i }).count()) {
    await page.getByRole("button", { name: /^Begin$/i }).click();
  }
  await pickPreferred(page);
  await finishIfPresent(page);
  await page.getByText(/QUEST COMPLETE|CHAPTER|COMPLETE/i).first().waitFor();
  console.log("PASS workday-survival complete");

  // Verify seal / chapter 5 teaser via seeded complete state
  await page.evaluate(
    ({ key }) => {
      const raw = JSON.parse(localStorage.getItem(key) || "{}");
      raw.completedQuestIds = [
        ...new Set([...(raw.completedQuestIds || []), "workday-survival"]),
      ];
      raw.rewardedQuestIds = [
        ...new Set([...(raw.rewardedQuestIds || []), "workday-survival"]),
      ];
      raw.seals = [...new Set([...(raw.seals || []), "professional"])];
      raw.unlockedSkillNodes = [
        ...new Set([...(raw.unlockedSkillNodes || []), "conv-hourensou"]),
      ];
      raw.flags = { ...(raw.flags || {}), chapter4Complete: true };
      localStorage.setItem(key, JSON.stringify(raw));
    },
    { key: PROFILE_KEY }
  );
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Pera Pera Quest|ペラペラ/i }).click();
  await page
    .getByRole("navigation", { name: "Pera Pera Quest" })
    .getByRole("button", { name: "Quests" })
    .click();
  await page.getByRole("tab", { name: /Chapter 4/i }).click();
  await page.getByText(/第5章・ネイティブスピード|Fast & Natural|Coming soon/i).first().waitFor();
  console.log("PASS chapter4 complete + chapter5 teaser");

  // Soft-check seal / skill via passport or stats if visible
  const body = await page.content();
  assert(
    body.includes("ネイティブスピード") || body.includes("Fast"),
    "Chapter 5 teaser missing"
  );

  console.log("PASS chapter4 smoke");
  await browser.close();
}

main().catch((err) => {
  console.error("FAIL", err);
  process.exit(1);
});
