/**
 * Smoke-test merged Pera Pera Quest RPG features on a running Vite server.
 * Usage: node scripts/smoke-rpg-merged.mjs [baseUrl]
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.argv[2] || "http://127.0.0.1:5175";
const OUT = "/opt/cursor/artifacts";
mkdirSync(OUT, { recursive: true });

const PROFILE_KEY = "jlpt-trainer:pera-pera-quest:v1";

/** Seed enough progress for random encounters + passport seals without finishing City Hall. */
function smokeProfile() {
  const now = Date.now();
  return {
    version: 1,
    playerName: "Smoke Tester",
    xp: 120,
    currentChapter: 1,
    completedQuestIds: ["convenience-first-shop"],
    unlockedLocationIds: [
      "home",
      "city-hall",
      "convenience-store",
      "cafe",
      "train-station",
      "training-dojo",
      "weak-word-dungeon",
    ],
    activeQuestId: "city-hall-register",
    languageStats: {
      vocabulary: 20,
      grammar: 18,
      listening: 15,
      reading: 16,
      conversation: 22,
      politeness: 20,
    },
    completedQuests: [
      {
        questId: "convenience-first-shop",
        accuracy: 90,
        confidenceLeft: 3,
        completedAt: now,
        xpGained: 40,
      },
    ],
    metNpcIds: ["sato-clerk"],
    rewardedQuestIds: ["convenience-first-shop"],
    flags: { chapter1Complete: false, chapter2Complete: false, developerMode: true },
    seals: ["daily-life"],
    relationships: {
      "sato-clerk": { level: 1, xp: 10 },
    },
    coins: 35,
    unlockedSkillNodes: [],
    immersion: { enabled: false, hideEnglish: false, hideSubtitles: false },
    daily: null,
    livingJapanese: {},
    updatedAt: now,
  };
}

async function shot(page, name) {
  const path = join(OUT, name);
  await page.screenshot({ path, fullPage: false });
  console.log("SHOT", path);
  return path;
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const results = [];

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.evaluate(
    ({ key, profile }) => {
      localStorage.setItem(key, JSON.stringify(profile));
    },
    { key: PROFILE_KEY, profile: smokeProfile() }
  );
  await page.reload({ waitUntil: "networkidle" });

  // Open Pera Pera Quest
  await page.getByRole("button", { name: /Pera Pera Quest|ペラペラ/i }).click();
  await page.getByRole("heading", { name: "ペラペラクエスト" }).waitFor();
  results.push("landing");

  // Immersion toggle
  const immersionBtn = page.getByRole("button", { name: /Immersion/i });
  await immersionBtn.click();
  await page.getByRole("button", { name: /Immersion ON/i }).waitFor();
  const immersionOn = await page.evaluate((key) => {
    const raw = JSON.parse(localStorage.getItem(key) || "{}");
    return Boolean(raw.immersion?.enabled);
  }, PROFILE_KEY);
  assert(immersionOn, "Immersion should persist enabled in localStorage");
  results.push("immersion-on");
  await shot(page, "smoke_immersion_on.png");

  // Passport
  await page.getByRole("button", { name: /Japanese Passport/i }).click();
  await page.getByRole("heading", { name: "Japanese Passport" }).waitFor();
  await page.getByRole("heading", { name: "Communication Seals" }).waitFor();
  const sealOn = page.locator(".ppq-seal--on");
  assert((await sealOn.count()) >= 1, "Expected at least one earned seal");
  await page.getByText(/Friendship Lv/i).first().waitFor();
  results.push("passport-seals-relationships");
  await shot(page, "smoke_passport.png");

  // Back via nav Home if present, else reload into game
  const homeNav = page.getByRole("button", { name: /^Home$/i });
  if (await homeNav.count()) {
    await homeNav.click();
  } else {
    // RpgNav may use different labels — go via Pera Pera landing by toggling view
    await page.getByRole("button", { name: /Player/i }).click();
    await page.getByRole("button", { name: /Pera Pera Quest|ペラペラ/i }).click();
  }
  await page.getByRole("heading", { name: "ペラペラクエスト" }).waitFor({ timeout: 10000 }).catch(async () => {
    // still on passport — click nav Home in ppq
    const ppqHome = page.locator(".ppq-nav button, .ppq-rpg-nav button").filter({ hasText: /Home|街|Landing|Quest/i });
    if (await ppqHome.count()) await ppqHome.first().click();
  });

  // Ensure immersion still on for City Hall
  if (await page.getByRole("button", { name: /^🎧 Immersion$/ }).count()) {
    await page.getByRole("button", { name: /^🎧 Immersion$/ }).click();
  }

  // Enter town → City Hall
  await page.getByRole("button", { name: /Enter Kotoba Town/i }).click();
  await page.getByText(/City Hall|市役所/i).first().waitFor();
  await shot(page, "smoke_town_map.png");

  // Click City Hall location card / button
  const cityHall = page.getByRole("button", { name: /City Hall|市役所/i }).first();
  if (await cityHall.count()) {
    await cityHall.click();
  } else {
    await page.locator(".ppq-location, .ppq-town-card, button").filter({ hasText: /City Hall|市役所/ }).first().click();
  }

  // Quest should start — look for title / Begin
  await page.getByRole("heading", { name: /転入届を出せ/ }).waitFor({ timeout: 10000 });
  results.push("city-hall-quest");

  // Communication meter visible
  const meter = page.locator(".ppq-comm-meter, [aria-label^=Communication]");
  await meter.first().waitFor();
  const meterLabel = await meter.first().getAttribute("aria-label");
  assert(meterLabel && /Communication/.test(meterLabel), "Communication meter missing");
  results.push("comm-meter");

  // Immersion badge in quest
  await page.locator(".ppq-immersion-badge").waitFor();
  results.push("immersion-badge-in-quest");

  // Intro: Immersion must hide English briefing until Show Help
  const introEn = /Complete your address registration without losing all your Confidence/i;
  assert(
    !(await page.getByText(introEn).isVisible().catch(() => false)),
    "Immersion should hide intro English"
  );
  results.push("immersion-hides-intro-en");
  await page.getByRole("button", { name: /Show Help/i }).click();
  await page.getByText(introEn).waitFor();
  results.push("help-reveals-intro-en");
  await page.getByRole("button", { name: /Hide Help/i }).click();

  const begin = page.getByRole("button", { name: /^Begin$/i });
  if (await begin.count()) await begin.click();

  // Purpose dialogue — EN prompt hidden until Show Help
  await page.getByText(/本日はどのようなご用件でしょうか/).waitFor({ timeout: 10000 });
  const enBefore = await page.getByText(/What business do you have today/i).isVisible().catch(() => false);
  assert(!enBefore, "English prompt should be hidden before Show Help");
  results.push("immersion-hides-en");

  // Choice EN labels should be hidden under immersion until Help
  const choiceEn = page.getByText(/I'd like to submit a moving-in notification/i);
  const choiceEnBefore = await choiceEn.isVisible().catch(() => false);
  assert(!choiceEnBefore, "Choice English should be hidden under Immersion");
  results.push("immersion-hides-choice-en");

  await page.getByRole("button", { name: /Show Help/i }).click();
  await page.getByText(/What business do you have today/i).waitFor();
  results.push("help-reveals-en");
  await shot(page, "smoke_city_hall_immersion.png");

  await page.locator("button.ppq-choice").filter({ hasText: "転入届を出したいんですが" }).click();
  await page.locator("[aria-label^=Communication]").first().waitFor();
  results.push("answered-with-meter");

  await page.getByRole("button", { name: /Leave quest/i }).click();
  await page.getByRole("navigation", { name: "Pera Pera Quest" }).getByRole("button", { name: "Home" }).click();
  await page.getByRole("heading", { name: "ペラペラクエスト" }).waitFor();

  await page.getByRole("button", { name: /Random Encounter/i }).click();
  await page.locator(".ppq-quest").waitFor({ timeout: 10000 });
  const title = await page.locator(".ppq-quest-banner h1").innerText();
  assert(title.length > 0, "Random encounter quest title missing");
  console.log("Random encounter title:", title);
  results.push("random-encounter:" + title);
  await shot(page, "smoke_random_encounter.png");

  console.log("PASS", JSON.stringify(results, null, 2));
  await browser.close();
}

main().catch(async (err) => {
  console.error("FAIL", err);
  process.exitCode = 1;
});
