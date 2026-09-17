/**
 * Smoke Phone Call Conversation Engine V2 — audio-first + recall + repairs.
 * Usage: node scripts/smoke-phone-v2.mjs [baseUrl]
 */
import { chromium } from "playwright";
import {
  createTestRpgProfile,
} from "./lib/testRpgProfile.mjs";

const BASE = process.argv[2] || "http://127.0.0.1:5175";
const PROFILE_KEY = "jlpt-trainer:pera-pera-quest:v1";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function clickChoice(page, text) {
  await page.locator("button.ppq-choice").filter({ hasText: text }).click();
}

async function continueQuest(page) {
  await page.getByRole("button", { name: /^Continue$/i }).click();
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.setDefaultTimeout(25000);

  const profile = createTestRpgProfile({
    playerName: "Phone V2 Tester",
    completedThroughChapter: 1,
    currentChapter: 2,
    completedQuestIds: [
      "city-hall-register",
      "convenience-first-shop",
      "meet-neighbor",
      "station-master",
      "cafe-order",
      "first-week-challenge",
      "clinic-visit",
    ],
    rewardedQuestIds: [
      "city-hall-register",
      "convenience-first-shop",
      "meet-neighbor",
      "station-master",
      "cafe-order",
      "first-week-challenge",
      "clinic-visit",
    ],
    activeQuestId: "phone-call",
    unlockedLocationIds: [
      "home",
      "city-hall",
      "convenience-store",
      "cafe",
      "train-station",
      "clinic",
      "phone-center",
      "training-dojo",
      "weak-word-dungeon",
    ],
    flags: { chapter1Complete: true, developerMode: true },
    immersion: {
      enabled: true,
      hideEnglish: true,
      hideSubtitles: true,
    },
    languageStats: {
      vocabulary: 30,
      grammar: 28,
      listening: 28,
      reading: 28,
      conversation: 32,
      politeness: 30,
    },
  });

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.evaluate(
    ({ key, p }) => localStorage.setItem(key, JSON.stringify(p)),
    { key: PROFILE_KEY, p: profile }
  );
  await page.reload({ waitUntil: "networkidle" });

  await page.getByRole("button", { name: /Pera Pera Quest|ペラペラ/i }).click();
  await page.getByRole("heading", { name: "ペラペラクエスト" }).waitFor();
  await page.getByRole("button", { name: /Enter Kotoba Town/i }).click();
  await page.getByRole("button", { name: /Phone Center/i }).click();
  await page.getByRole("heading", { name: /電話で問い合わせ/ }).waitFor();

  // V2 phone chrome
  await page.getByText(/Conversation/i).first().waitFor();
  await page.getByText(/Incoming Call|Call in progress/i).first().waitFor();
  await page.locator("[aria-label^=Communication]").first().waitFor();

  // Intro EN hidden under Immersion
  assert(
    !(await page
      .getByText(/Survive the call with your ears/i)
      .isVisible()
      .catch(() => false)),
    "Intro EN should be hidden in Immersion"
  );
  await page.getByRole("button", { name: /^Begin$/i }).click();

  // Identify — transcript hidden
  await page.locator("[data-testid=transcript-hidden]").waitFor();
  await page.getByText(/Listening/i).first().waitFor();
  assert(
    !(await page.getByText(/ことばクリニックの田中と申しますが/).isVisible().catch(() => false)),
    "Caller transcript should stay hidden"
  );
  await clickChoice(page, "はい、そうです。");
  await continueQuest(page);

  // Purpose — transcript hidden, use slow replay repair
  await page.locator("[data-testid=transcript-hidden]").waitFor();
  await page.getByTestId("replay-slow").click();
  await clickChoice(page, "はい、お願いします。");
  await continueQuest(page);

  // Datetime info (audio-first, continue)
  await page.locator("[data-testid=transcript-hidden]").waitFor();
  await continueQuest(page);

  // Datetime check — plausible wrong day, then recover
  await page.getByText(/水曜日の午後三時でよろしいでしょうか/).waitFor();
  await clickChoice(page, "木曜日の午後三時ですね。");
  await continueQuest(page);

  await page.getByText(/木曜日ではなく、水曜日/).waitFor();
  await clickChoice(page, "すみません。水曜日の午後三時ですね。");
  await continueQuest(page);

  // Instruction — ask meaning of 折り返し
  await page.getByText(/折り返しお電話します/).waitFor();
  await clickChoice(page, "『折り返し』というのはどういう意味ですか。");
  await continueQuest(page);
  await page.getByText(/後でもう一度こちらから電話する/).waitFor();
  await clickChoice(page, "なるほど、後で電話してくださるんですね。");
  await continueQuest(page);

  // Vocab
  await clickChoice(page, "はい。変更があれば連絡します。");
  await continueQuest(page);

  // Bridge
  await page.getByText(/システムに登録しました/).waitFor();
  await continueQuest(page);

  // Recall — correct Wednesday 3PM
  await page.getByText(/何曜日の何時でしたか/).waitFor();
  assert(
    !(await page
      .getByText(/来週の水曜日、午後三時でお願いします/)
      .isVisible()
      .catch(() => false)),
    "Original datetime line must not sit above recall"
  );
  await clickChoice(page, "水曜日の午後三時です。");
  await continueQuest(page);

  // Final confirm + close
  await clickChoice(page, "承知しました。水曜日の午後三時ですね。");
  await continueQuest(page);
  await clickChoice(page, "ありがとうございます。失礼します。");
  await continueQuest(page);

  await page.getByRole("button", { name: /^Finish$/i }).click();
  await page.getByText(/QUEST COMPLETE|Mission Complete|CALL REPORT/i).first().waitFor();
  await page.getByText(/CALL REPORT/i).first().waitFor();
  await page.getByText(/Repairs:/i).first().waitFor();
  await page.getByText(/Communication:/i).first().waitFor();
  await page.getByText(/Wednesday|Caller|Purpose/i).first().waitFor();

  console.log("PASS phone-v2 path");
  await browser.close();
}

main().catch((err) => {
  console.error("FAIL", err);
  process.exit(1);
});
