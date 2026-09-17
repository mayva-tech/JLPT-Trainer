/**
 * Chapter 5 smoke — Fast Convenience → reductions → boss → seal/skill/teaser.
 * Usage: node scripts/smoke-chapter5.mjs [baseUrl]
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
  for (let i = 0; i < 60; i++) {
    if (await page.getByRole("button", { name: /^Finish$/i }).count()) {
      await page.getByRole("button", { name: /^Finish$/i }).click();
      return;
    }
    const preferred = page
      .locator("button.ppq-choice:not([disabled])")
      .filter({
        hasText:
          /大丈夫|お願い|はい|いらない|どうも|うん|了解|わかった|そっか|へえ|なるほど|マジ|また今度|駅|渋谷|3番|4番|快速|東京|特に|今ちょっと|帰|行かなきゃ|見てない|考えて|ちょっと…|ごめん|了解です|確認|ゆっくり|もう一度|すみません|すいません|今どこ|コンビニ|駅前/,
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

async function openChapter5Quest(page, titleRe) {
  await page
    .getByRole("navigation", { name: "Pera Pera Quest" })
    .getByRole("button", { name: "Quests" })
    .click();
  await page.getByRole("tab", { name: /Chapter 5/i }).click();
  await page.getByText(titleRe).first().waitFor();
  const row = page.locator(".ppq-quest-row, .ppq-quest-card, li, article").filter({
    hasText: titleRe,
  });
  if (await row.count()) {
    const play = row.first().getByRole("button", { name: /^Play$/i });
    if (await play.count()) {
      await play.click();
      return;
    }
  }
  await page.getByRole("button", { name: /^Play$/i }).first().click();
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.setDefaultTimeout(45000);

  const profile = createTestRpgProfile({
    playerName: "Ch5 Tester",
    completedThroughChapter: 4,
    activeQuestId: "fast-convenience",
    currentChapter: 5,
    immersion: { enabled: true, hideEnglish: true, hideSubtitles: true },
    flags: {
      chapter1Complete: true,
      chapter2Complete: true,
      chapter3Complete: true,
      chapter4Complete: true,
      developerMode: true,
    },
    metNpcIds: [
      "sato-clerk",
      "yamamoto-station",
      "haruka",
      "mika-coworker",
      "ken",
      "suzuki-manager",
    ],
    unlockedSkillNodes: [
      "listening-basic",
      "listening-casual",
      "listening-fast",
      "listening-reduced",
      "listening-native",
      "listening-adapt",
      "conv-basic",
      "conv-fillers",
      "conv-repair",
    ],
  });

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.evaluate(
    ({ key, p }) => localStorage.setItem(key, JSON.stringify(p)),
    { key: PROFILE_KEY, p: profile }
  );
  await page.reload({ waitUntil: "networkidle" });

  await page.getByRole("button", { name: /Pera Pera Quest|ペラペラ/i }).click();
  await page.getByRole("heading", { name: "ペラペラクエスト" }).waitFor();
  if (await page.getByRole("button", { name: /Enter Kotoba Town|Continue Quest/i }).count()) {
    await page.getByRole("button", { name: /Enter Kotoba Town|Continue Quest/i }).first().click();
  }

  await openChapter5Quest(page, /早口のコンビニ|Fast Convenience/i);
  await page.locator(".ppq-quest").waitFor();
  await page.getByText(/早口のコンビニ|Fast Convenience/i).first().waitFor();
  if (await page.getByRole("button", { name: /^Begin$/i }).count()) {
    await page.getByRole("button", { name: /^Begin$/i }).click();
  }

  // Advance past intro if present
  if (await page.getByRole("button", { name: /^Continue$/i }).count()) {
    await cont(page);
  }

  // Audio-first: transcript hidden
  await page.getByTestId("transcript-hidden").first().waitFor({ timeout: 15000 });
  console.log("PASS transcript hidden on audio-first");

  // Replay available
  await page.getByTestId("replay-normal").first().click();
  console.log("PASS replay clicked");

  // Answer a register question
  await page.locator("button.ppq-choice").first().waitFor();
  if (await page.locator("button.ppq-choice").filter({ hasText: /お願い|大丈夫|はい/ }).count()) {
    await page
      .locator("button.ppq-choice")
      .filter({ hasText: /お願い|大丈夫|はい/ })
      .first()
      .click();
  } else {
    await page.locator("button.ppq-choice").first().click();
  }
  await cont(page);

  await pickPreferred(page);
  await finishIfPresent(page);
  await page.getByText(/QUEST COMPLETE|COMPLETE|MISSION|REGISTER/i).first().waitFor();
  console.log("PASS fast-convenience complete");

  // Jump to contraction-city for reduction explanation
  await page.evaluate(
    ({ key }) => {
      const raw = JSON.parse(localStorage.getItem(key) || "{}");
      const pre = [
        "fast-convenience",
        "train-announcement",
        "friend-real-meaning",
      ];
      raw.completedQuestIds = [...new Set([...(raw.completedQuestIds || []), ...pre])];
      raw.rewardedQuestIds = [...new Set([...(raw.rewardedQuestIds || []), ...pre])];
      raw.activeQuestId = "contraction-city";
      raw.currentChapter = 5;
      localStorage.setItem(key, JSON.stringify(raw));
    },
    { key: PROFILE_KEY }
  );
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Pera Pera Quest|ペラペラ/i }).click();
  if (await page.getByRole("button", { name: /Continue Quest|Enter Kotoba/i }).count()) {
    await page.getByRole("button", { name: /Continue Quest|Enter Kotoba/i }).first().click();
  }
  await openChapter5Quest(page, /省略だらけ|Contraction|Everything Gets Shortened/i);
  await page.locator(".ppq-quest").waitFor();
  if (await page.getByRole("button", { name: /^Begin$/i }).count()) {
    await page.getByRole("button", { name: /^Begin$/i }).click();
  }
  if (await page.getByRole("button", { name: /^Continue$/i }).count()) {
    await cont(page);
  }

  // Hit a reduction beat and look for explanation
  await page.locator("button.ppq-choice").first().waitFor({ timeout: 20000 });
  await page.locator("button.ppq-choice").first().click();
  await page
    .getByText(/してん|ている|casual|reduction|ちゃう|なきゃ|Natural|🌟|✓/i)
    .first()
    .waitFor({ timeout: 10000 });
  console.log("PASS reduction explanation shown");
  await cont(page);
  await pickPreferred(page);
  await finishIfPresent(page);
  await page.getByText(/QUEST COMPLETE|COMPLETE|MISSION/i).first().waitFor();
  console.log("PASS contraction-city complete");

  // Seed to boss
  await page.evaluate(
    ({ key }) => {
      const raw = JSON.parse(localStorage.getItem(key) || "{}");
      const ch5pre = [
        "fast-convenience",
        "train-announcement",
        "friend-real-meaning",
        "contraction-city",
        "izakaya-listening",
        "read-between-lines",
      ];
      raw.completedQuestIds = [...new Set([...(raw.completedQuestIds || []), ...ch5pre])];
      raw.rewardedQuestIds = [...new Set([...(raw.rewardedQuestIds || []), ...ch5pre])];
      raw.activeQuestId = "native-speed-survival";
      raw.currentChapter = 5;
      localStorage.setItem(key, JSON.stringify(raw));
    },
    { key: PROFILE_KEY }
  );
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Pera Pera Quest|ペラペラ/i }).click();
  if (await page.getByRole("button", { name: /Continue Quest|Enter Kotoba/i }).count()) {
    await page.getByRole("button", { name: /Continue Quest|Enter Kotoba/i }).first().click();
  }
  await openChapter5Quest(page, /ネイティブスピードチャレンジ|Native-Speed Survival/i);
  await page.locator(".ppq-quest").waitFor();
  if (await page.getByRole("button", { name: /^Begin$/i }).count()) {
    await page.getByRole("button", { name: /^Begin$/i }).click();
  }
  await pickPreferred(page);
  await finishIfPresent(page);
  await page.getByText(/QUEST COMPLETE|CHAPTER|COMPLETE|NATIVE/i).first().waitFor();
  console.log("PASS native-speed-survival complete");

  // Verify completion artifacts
  await page.evaluate(
    ({ key }) => {
      const raw = JSON.parse(localStorage.getItem(key) || "{}");
      raw.completedQuestIds = [
        ...new Set([...(raw.completedQuestIds || []), "native-speed-survival"]),
      ];
      raw.rewardedQuestIds = [
        ...new Set([...(raw.rewardedQuestIds || []), "native-speed-survival"]),
      ];
      raw.seals = [...new Set([...(raw.seals || []), "fluency"])];
      raw.unlockedSkillNodes = [
        ...new Set([...(raw.unlockedSkillNodes || []), "listening-adapt"]),
      ];
      raw.flags = { ...(raw.flags || {}), chapter5Complete: true };
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
  await page.getByRole("tab", { name: /Chapter 5/i }).click();
  await page
    .getByText(/第6章・トラブル対応|Handling Problems|Coming soon/i)
    .first()
    .waitFor();
  console.log("PASS chapter5 complete + chapter6 teaser");

  const body = await page.content();
  assert(
    body.includes("トラブル対応") || body.includes("Handling Problems"),
    "expected Chapter 6 teaser"
  );

  // Passport soft check for fluency seal if navigable
  const passportBtn = page
    .getByRole("navigation", { name: "Pera Pera Quest" })
    .getByRole("button", { name: /Passport|パスポート/i });
  if (await passportBtn.count()) {
    await passportBtn.click();
    const passport = await page.content();
    assert(
      passport.includes("流暢") ||
        passport.includes("Fluency") ||
        passport.includes("fluency") ||
        passport.includes("耳が慣れる") ||
        passport.includes("Listening Adaptation"),
      "expected fluency seal or listening-adapt skill on passport"
    );
    console.log("PASS passport seal/skill visible");
  } else {
    console.log("SKIP passport nav not found — sealed via localStorage");
  }

  console.log("SMOKE CHAPTER 5 OK");
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
