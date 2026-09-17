import { useMemo, useState } from "react";
import "../styles/pera-pera.css";
import "../../pages/GameMode/game-mode.css";
import { getChapterByNumber } from "../data/chapters";
import { getLocationById } from "../data/locations";
import { getNpcById } from "../data/npcs";
import {
  getPrimaryQuestForLocation,
  getQuestById,
  pickRandomEncounter,
  QUESTS,
} from "../data/quests";
import { nextAdventureRank } from "../data/ranks";
import { CURRENCY, IMMERSION_BONUS } from "../data/rpgConfig";
import {
  QuestRunner,
  type QuestRunOutcome,
} from "../components/QuestRunner";
import { LanguageStatsBars } from "../components/LanguageStatsBars";
import {
  QuestFailScreen,
  QuestMistakeReview,
  QuestSuccessScreen,
  type ChapterCompleteSummary,
} from "../components/QuestResultScreens";
import { RpgNav, type RpgScreen } from "../components/RpgNav";
import { TownMap } from "../components/TownMap";
import { JapanesePassport } from "../components/JapanesePassport";
import { SkillTreePanel } from "../components/SkillTreePanel";
import { DailyQuestPanel } from "../components/DailyQuestPanel";
import { TrainingDojo } from "../pages/TrainingDojo";
import { WeakWordDungeon } from "../pages/WeakWordDungeon";
import {
  chapterCompletionCounts,
  getChapterQuestRows,
  isChapterComplete,
  isDeveloperMode,
  isQuestPlayable,
  shortChapterObjectiveLabel,
} from "../utils/chapterProgress";
import {
  calcJapanesePower,
  LANGUAGE_STAT_LABELS,
  strongestLanguageStat,
  weakestLanguageStat,
} from "../utils/languageStats";
import {
  applyQuestCompletion,
  getProfileLevel,
  getProfileRank,
  loadPlayerProfile,
  savePlayerProfile,
  townCompletionPercent,
} from "../utils/playerProfile";
import {
  recordQuestConceptHit,
  recordQuestConceptMiss,
} from "../utils/livingJapanese";
import { bumpDailyProgress, ensureDailyQuests } from "../utils/dailyQuests";
import { hasSkillEffect, syncSkillUnlocks } from "../utils/skillTree";
import { getLevelProgress } from "../../utils/gameMode/xp";
import type { LocationId, PlayerRpgProfile, QuestDefinition } from "../types";

type Props = {
  onOpenTrainer?: () => void;
};

export function PeraPeraQuestApp({ onOpenTrainer }: Props) {
  const [screen, setScreen] = useState<RpgScreen>("landing");
  const [profile, setProfile] = useState<PlayerRpgProfile>(() =>
    syncSkillUnlocks(ensureDailyQuests(loadPlayerProfile()))
  );
  const [runningQuestId, setRunningQuestId] = useState<string | null>(null);
  const [questRunId, setQuestRunId] = useState(0);
  const [outcome, setOutcome] = useState<QuestRunOutcome | null>(null);
  const [newlyRewarded, setNewlyRewarded] = useState(true);
  const [replayRewarded, setReplayRewarded] = useState(false);
  const [xpGranted, setXpGranted] = useState(0);
  const [skillsGranted, setSkillsGranted] = useState<
    Partial<PlayerRpgProfile["languageStats"]>
  >({});
  const [unlockedLabels, setUnlockedLabels] = useState<string[]>([]);
  const [chapterSummary, setChapterSummary] =
    useState<ChapterCompleteSummary | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const level = getProfileLevel(profile);
  const rank = getProfileRank(profile);
  const power = calcJapanesePower(profile.languageStats);
  const townPct = townCompletionPercent(profile);
  const xpProgress = getLevelProgress(profile.xp);
  const chapter = getChapterByNumber(profile.currentChapter);
  const activeQuest = profile.activeQuestId
    ? getQuestById(profile.activeQuestId)
    : getQuestById("city-hall-register");
  const nextRank = nextAdventureRank(rank);
  const runningQuest = runningQuestId ? getQuestById(runningQuestId) : null;

  const persist = (next: PlayerRpgProfile) => {
    setProfile(next);
    savePlayerProfile(next);
  };

  function flashToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 3200);
  }

  function startQuest(questId: string) {
    const quest = getQuestById(questId);
    if (!quest || quest.steps.length === 0) return;
    if (
      !profile.completedQuestIds.includes(questId) &&
      !isQuestPlayable(quest, profile)
    ) {
      flashToast("Complete the previous quest first.");
      return;
    }
    const withActive = {
      ...profile,
      activeQuestId: questId,
      updatedAt: Date.now(),
    };
    persist(withActive);
    setRunningQuestId(questId);
    setOutcome(null);
    setChapterSummary(null);
    setQuestRunId((n) => n + 1);
    setScreen("quest-run");
  }

  function continueActiveQuest() {
    const id =
      profile.activeQuestId && getQuestById(profile.activeQuestId)?.steps.length
        ? profile.activeQuestId
        : "city-hall-register";
    startQuest(id);
  }

  function onQuestFinished(result: QuestRunOutcome) {
    setOutcome(result);
    const quest = runningQuestId ? getQuestById(runningQuestId) : null;
    if (!quest) {
      setScreen("town");
      return;
    }

    if (!result.success) {
      setScreen("quest-fail");
      return;
    }

    const prevUnlocked = new Set(profile.unlockedLocationIds);
    const chapterFlag =
      quest.id === "first-week-challenge"
        ? "chapter1Complete"
        : quest.id === "social-life-challenge"
          ? "chapter2Complete"
          : undefined;
    const setFlags = chapterFlag ? [chapterFlag] : undefined;

    const applied = applyQuestCompletion(profile, {
      questId: quest.id,
      accuracy: result.accuracy,
      confidenceLeft: result.confidenceLeft,
      xpGained: (() => {
        let xp = quest.rewards.xp;
        if (result.immersionNoEnglish) {
          xp = Math.round(xp * IMMERSION_BONUS.noSubtitleXpMultiplier) + IMMERSION_BONUS.noEnglishXp;
        }
        return xp;
      })(),
      skillRewards: (() => {
        const skills = { ...quest.rewards.skillRewards };
        if (result.firstListenSuccess) {
          skills.listening = (skills.listening ?? 0) + Math.ceil(IMMERSION_BONUS.firstListenXp / 10);
        }
        if (result.immersionNoEnglish) {
          skills.listening = (skills.listening ?? 0) + 1;
          skills.conversation = (skills.conversation ?? 0) + 1;
        }
        return skills;
      })(),
      replayXp: quest.rewards.replayXp,
      replaySkillRewards: quest.rewards.replaySkillRewards,
      unlockLocationIds: quest.rewards.unlockLocationIds,
      unlockQuestIds: quest.rewards.unlockQuestIds,
      metNpcIds: quest.meetNpcIds,
      setFlags,
      sealId: quest.rewards.sealId,
      coins: quest.rewards.coins,
      relationshipNpcIds:
        quest.rewards.relationshipNpcIds ?? quest.meetNpcIds,
      communicationPercent: result.communicationPercent,
      immersionNoEnglish: result.immersionNoEnglish,
      repairedConversation: result.repairedConversation,
    });

    setNewlyRewarded(applied.newlyRewarded);
    setReplayRewarded(applied.replayRewarded);
    setXpGranted(applied.xpGranted);
    setSkillsGranted(applied.skillRewardsApplied);

    const newlyUnlocked = (quest.rewards.unlockLocationIds ?? []).filter(
      (id) => !prevUnlocked.has(id)
    );
    const labels = newlyUnlocked.map((id) => {
      const loc = getLocationById(id);
      return loc ? `${loc.icon} ${loc.name}` : id;
    });
    setUnlockedLabels(labels);
    if (labels.length > 0) {
      flashToast(`Location unlocked: ${labels.join(" · ")}`);
    }

    let nextProfile = applied.profile;

    // Living Japanese: reinforce missed concepts; ease learned ones.
    for (const m of result.mistakes) {
      if (m.vocabHint) {
        nextProfile = recordQuestConceptMiss(nextProfile, m.vocabHint);
      }
    }
    for (const v of result.conceptsLearned) {
      nextProfile = recordQuestConceptHit(nextProfile, v);
    }

    // Daily quest progress
    nextProfile = bumpDailyProgress(nextProfile, "clear-encounters", 1);
    if (result.immersionNoEnglish) {
      nextProfile = bumpDailyProgress(nextProfile, "no-english", 1);
    }
    if (result.repairedConversation) {
      nextProfile = bumpDailyProgress(nextProfile, "repair-once", 1);
    }
    if (result.firstListenSuccess) {
      nextProfile = bumpDailyProgress(nextProfile, "first-listen", 1);
    }

    // Chapter 1 boss → advance into playable Chapter 2
    if (
      quest.id === "first-week-challenge" &&
      isChapterComplete(nextProfile, 1)
    ) {
      nextProfile = {
        ...nextProfile,
        currentChapter: Math.max(nextProfile.currentChapter, 2),
        flags: { ...nextProfile.flags, chapter1Complete: true },
      };
      setChapterSummary(
        buildChapterSummary({
          chapterNumber: 1,
          result,
          profileBefore: profile,
          profileAfter: nextProfile,
          xpGranted: applied.xpGranted,
          nextComingSoon: false,
        })
      );
    }

    // Chapter 2 boss → clear Ch2, teaser only for Ch3 (do not advance playably)
    if (
      quest.id === "social-life-challenge" &&
      isChapterComplete(nextProfile, 2)
    ) {
      nextProfile = {
        ...nextProfile,
        // Stay on chapter 2 as the active playable chapter (Ch3 not implemented).
        currentChapter: Math.max(nextProfile.currentChapter, 2),
        flags: { ...nextProfile.flags, chapter2Complete: true },
      };
      setChapterSummary(
        buildChapterSummary({
          chapterNumber: 2,
          result,
          profileBefore: profile,
          profileAfter: nextProfile,
          xpGranted: applied.xpGranted,
          nextComingSoon: true,
        })
      );
    }

    persist(nextProfile);
    setScreen("quest-result");
  }

  function onLocationSelect(locationId: LocationId) {
    if (locationId === "training-dojo") {
      setScreen("dojo");
      return;
    }
    if (locationId === "weak-word-dungeon") {
      persist(bumpDailyProgress(profile, "review-weak", 1));
      setScreen("dungeon");
      return;
    }
    if (locationId === "home") {
      const homeQuest = getPrimaryQuestForLocation(
        "home",
        profile.completedQuestIds
      );
      if (
        homeQuest &&
        (profile.completedQuestIds.includes(homeQuest.id) ||
          isQuestPlayable(homeQuest, profile))
      ) {
        // Prefer chapter panel for choosing between neighbor / boss at home
        // unless there's a clear active incomplete home quest.
        if (
          homeQuest.id === "meet-neighbor" ||
          homeQuest.id === "first-week-challenge"
        ) {
          if (
            isQuestPlayable(homeQuest, profile) ||
            profile.completedQuestIds.includes(homeQuest.id)
          ) {
            startQuest(homeQuest.id);
            return;
          }
        }
      }
      setScreen("landing");
      return;
    }

    const quest = getPrimaryQuestForLocation(
      locationId,
      profile.completedQuestIds
    );
    if (quest) {
      startQuest(quest.id);
      return;
    }
  }

  function weakCategoryHints(quest: QuestDefinition, result: QuestRunOutcome) {
    const hints: string[] = [];
    const prompts = result.mistakes.map((m) => m.promptJa + m.feedback).join(" ");
    if (/駅|改札|乗り換え|ホーム|遅延|運転/.test(prompts)) {
      hints.push("Station Japanese needs work.");
    }
    if (/はるか|引っ越|分かんない|元気/.test(prompts) || quest.id.includes("neighbor")) {
      hints.push("You struggled with casual conversation.");
    }
    if (/袋|温め|ポイント|レシート|お支払い/.test(prompts)) {
      hints.push("Convenience-store service Japanese needs practice.");
    }
    if (/注文|店内|お持ち帰り|ラテ/.test(prompts)) {
      hints.push("Café ordering still feels shaky.");
    }
    if (/受診|症状|保険証|安静|熱|のど/.test(prompts) || quest.id.includes("clinic")) {
      hints.push("Clinic / medical Japanese needs practice.");
    }
    if (
      /お電話|恐れ入り|承知|もう一度|よろしいでしょうか/.test(prompts) ||
      quest.id.includes("phone")
    ) {
      hints.push("Phone confirmation Japanese still needs work.");
    }
    if (
      /共有|修正|確認|報告|申し訳ありません|資料/.test(prompts) ||
      quest.locationId === "office"
    ) {
      hints.push("Workplace communication needs more practice.");
    }
    if (hints.length === 0 && result.mistakes.length > 0) {
      hints.push("A few everyday situations still need practice.");
    }
    return hints.slice(0, 3);
  }

  return (
    <div className="ppq-root">
      <div className="ppq-shell">
        <RpgNav
          screen={screen}
          onNavigate={setScreen}
          hidden={screen === "quest-run"}
        />

        {toast ? (
          <div className="ppq-toast" role="status">
            {toast}
          </div>
        ) : null}

        {screen === "landing" ? (
          <Landing
            profile={profile}
            level={level}
            rankName={`${rank.japaneseName} · ${rank.englishName}`}
            power={power}
            townPct={townPct}
            xpProgress={xpProgress}
            chapterTitle={
              chapter
                ? `Chapter ${chapter.number}: ${chapter.japaneseTitle}`
                : "Chapter 1: 新生活"
            }
            chapterSubtitle={chapter?.description}
            openingLines={chapter?.openingLines}
            activeQuestTitle={
              activeQuest
                ? `${activeQuest.japaneseTitle} · ${activeQuest.title}`
                : "—"
            }
            nextRankHint={
              nextRank
                ? `Next: ${nextRank.japaneseName} (quests ${nextRank.minQuests}+ · Lv.${nextRank.minLevel}+ · Power ${nextRank.minJapanesePower}+)`
                : "You hold the highest rank."
            }
            onEnterTown={() => setScreen("town")}
            onContinue={continueActiveQuest}
            onChapter={() => setScreen("quests")}
            onDojo={() => setScreen("dojo")}
            onDungeon={() => setScreen("dungeon")}
            onStats={() => setScreen("stats")}
            onPassport={() => setScreen("passport")}
            onDaily={() => setScreen("daily")}
            onSkills={() => setScreen("skills")}
            onRandom={() => {
              const enc = pickRandomEncounter(
                profile.completedQuestIds,
                Date.now()
              );
              if (!enc) {
                flashToast("Clear more story quests to unlock street encounters.");
                return;
              }
              startQuest(enc.id);
            }}
            immersionEnabled={profile.immersion.enabled}
            onToggleImmersion={() => {
              const enabled = !profile.immersion.enabled;
              persist({
                ...profile,
                immersion: {
                  enabled,
                  hideEnglish: enabled,
                  hideSubtitles: enabled,
                },
                updatedAt: Date.now(),
              });
              flashToast(
                enabled
                  ? "Immersion Mode ON — English hidden until Help"
                  : "Immersion Mode OFF"
              );
            }}
            coins={profile.coins}
          />
        ) : null}

        {screen === "town" ? (
          <TownMap profile={profile} onSelect={onLocationSelect} />
        ) : null}

        {screen === "quests" ? (
          <ChapterPanel
            profile={profile}
            onStartQuest={startQuest}
          />
        ) : null}

        {screen === "passport" ? <JapanesePassport profile={profile} /> : null}
        {screen === "skills" ? <SkillTreePanel profile={profile} /> : null}
        {screen === "daily" ? <DailyQuestPanel profile={profile} /> : null}

        {screen === "stats" ? (
          <div>
            <h2>Adventure Stats</h2>
            <p style={{ color: "var(--ppq-muted)", fontSize: 13 }}>
              Japanese Power {power} · Rank {rank.japaneseName} · Lv. {level}
            </p>
            <div className="ppq-panel" style={{ marginTop: 12 }}>
              <h2>Language stats</h2>
              <LanguageStatsBars stats={profile.languageStats} />
            </div>
            <div className="ppq-panel" style={{ marginTop: 12 }}>
              <h2>Developer mode</h2>
              <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--ppq-muted)" }}>
                Unlock every chapter, quest, and town location with no progression
                locks. Progress and rewards still save normally.
              </p>
              <button
                type="button"
                className={
                  isDeveloperMode(profile)
                    ? "ppq-btn ppq-btn--primary"
                    : "ppq-btn ppq-btn--ghost"
                }
                onClick={() => {
                  const next = {
                    ...profile,
                    flags: {
                      ...profile.flags,
                      developerMode: !isDeveloperMode(profile),
                    },
                    updatedAt: Date.now(),
                  };
                  persist(next);
                  flashToast(
                    next.flags.developerMode
                      ? "Developer mode ON — all chapters unlocked"
                      : "Developer mode OFF — normal locks restored"
                  );
                }}
              >
                {isDeveloperMode(profile)
                  ? "Developer mode: ON"
                  : "Enable developer mode"}
              </button>
            </div>
          </div>
        ) : null}

        {screen === "log" ? <AdventureLog profile={profile} /> : null}

        {screen === "dojo" ? (
          <TrainingDojo
            onBack={() => setScreen("landing")}
            onOpenTrainer={onOpenTrainer}
          />
        ) : null}

        {screen === "dungeon" ? (
          <WeakWordDungeon
            onBack={() => setScreen("landing")}
            onOpenTrainer={onOpenTrainer}
          />
        ) : null}

        {screen === "quest-run" && runningQuestId ? (
          <QuestRunner
            key={`${runningQuestId}-${questRunId}`}
            questId={runningQuestId}
            metNpcIds={profile.metNpcIds}
            immersionEnabled={profile.immersion.enabled}
            extraRepair={hasSkillEffect(profile, "extra-repair")}
            onQuit={() => setScreen("town")}
            onFinished={onQuestFinished}
          />
        ) : null}

        {screen === "quest-result" && outcome && runningQuest ? (
          <QuestSuccessScreen
            quest={runningQuest}
            outcome={outcome}
            newlyRewarded={newlyRewarded}
            replayRewarded={replayRewarded}
            skillRewards={skillsGranted}
            xpGained={xpGranted}
            unlockedLocationLabels={unlockedLabels}
            chapterComplete={Boolean(chapterSummary)}
            chapterSummary={chapterSummary}
            onTown={() => setScreen("town")}
            onLog={() => setScreen("log")}
            onRetry={() => startQuest(runningQuest.id)}
            onChapterNext={() => setScreen("town")}
          />
        ) : null}

        {screen === "quest-fail" && outcome && runningQuest ? (
          <QuestFailScreen
            quest={runningQuest}
            outcome={outcome}
            weakCategories={weakCategoryHints(runningQuest, outcome)}
            isBoss={runningQuest.difficulty === "boss"}
            onRetry={() => startQuest(runningQuest.id)}
            onReview={() => setScreen("quest-review")}
            onDojo={() => setScreen("dojo")}
            onDungeon={() => setScreen("dungeon")}
            onTown={() => setScreen("town")}
          />
        ) : null}

        {screen === "quest-review" && outcome ? (
          <QuestMistakeReview
            mistakes={outcome.mistakes}
            onBack={() => setScreen("quest-fail")}
          />
        ) : null}
      </div>
    </div>
  );
}

function Landing({
  profile,
  level,
  rankName,
  power,
  townPct,
  xpProgress,
  chapterTitle,
  chapterSubtitle,
  openingLines,
  activeQuestTitle,
  nextRankHint,
  onEnterTown,
  onContinue,
  onChapter,
  onDojo,
  onDungeon,
  onStats,
  onPassport,
  onDaily,
  onSkills,
  onRandom,
  immersionEnabled,
  onToggleImmersion,
  coins,
}: {
  profile: PlayerRpgProfile;
  level: number;
  rankName: string;
  power: number;
  townPct: number;
  xpProgress: ReturnType<typeof getLevelProgress>;
  chapterTitle: string;
  chapterSubtitle?: string;
  openingLines?: string[];
  activeQuestTitle: string;
  nextRankHint: string;
  onEnterTown: () => void;
  onContinue: () => void;
  onChapter: () => void;
  onDojo: () => void;
  onDungeon: () => void;
  onStats: () => void;
  onPassport: () => void;
  onDaily: () => void;
  onSkills: () => void;
  onRandom: () => void;
  immersionEnabled: boolean;
  onToggleImmersion: () => void;
  coins: number;
}) {
  return (
    <div className="ppq-landing">
      <section className="ppq-hero">
        <p className="ppq-hero-kicker">Japanese Learning RPG</p>
        <h1 className="ppq-hero-title" lang="ja">
          ペラペラクエスト
        </h1>
        <p className="ppq-hero-sub">Live in Japan. Learn Japanese.</p>

        <div className="ppq-hero-grid">
          <div className="ppq-stat-tile">
            <span>Player</span>
            <strong>{profile.playerName}</strong>
          </div>
          <div className="ppq-stat-tile">
            <span>Adventure rank</span>
            <strong lang="ja" style={{ fontSize: 14 }}>
              {rankName}
            </strong>
          </div>
          <div className="ppq-stat-tile">
            <span>Level / XP</span>
            <strong>
              Lv. {level} · {profile.xp} XP
            </strong>
          </div>
          <div className="ppq-stat-tile">
            <span>Japanese Power</span>
            <strong>{power}</strong>
          </div>
          <div className="ppq-stat-tile">
            <span>Chapter</span>
            <strong style={{ fontSize: 13 }}>{chapterTitle}</strong>
          </div>
          <div className="ppq-stat-tile">
            <span>Town completion</span>
            <strong>{townPct}%</strong>
          </div>
          <div className="ppq-stat-tile">
            <span>{CURRENCY.name}</span>
            <strong>
              {CURRENCY.symbol} {coins}
            </strong>
          </div>
        </div>

        <p className="ppq-hero-goal">
          Goal: earn the <strong lang="ja">ペラペラ免許</strong> — become a{" "}
          <strong lang="ja">ペラペラマスター</strong> by using Japanese to live in
          Kotoba Town.
        </p>

        {chapterSubtitle ? (
          <p style={{ fontSize: 14, margin: "0 0 8px", color: "var(--ppq-muted)" }}>
            {chapterSubtitle}
          </p>
        ) : null}
        {openingLines?.length ? (
          <div className="ppq-opening" style={{ marginBottom: 12 }}>
            {openingLines.map((line) => (
              <p key={line} style={{ margin: "0 0 6px", fontSize: 13 }}>
                {line}
              </p>
            ))}
          </div>
        ) : null}

        <div style={{ marginBottom: 12 }}>
          <div
            className="ppq-lang-track"
            role="progressbar"
            aria-valuenow={xpProgress.xpIntoLevel}
            aria-valuemin={0}
            aria-valuemax={xpProgress.xpForNextLevel}
            aria-label="XP progress"
          >
            <div
              className="ppq-lang-fill"
              style={{ width: `${Math.round(xpProgress.ratio * 100)}%` }}
            />
          </div>
          <p style={{ fontSize: 12, color: "var(--ppq-muted)", margin: "4px 0 0" }}>
            {xpProgress.xpIntoLevel} / {xpProgress.xpForNextLevel} XP to next level ·{" "}
            {nextRankHint}
          </p>
        </div>

        <p style={{ fontSize: 13, margin: "0 0 12px" }}>
          Active quest: <strong>{activeQuestTitle}</strong>
        </p>

        <div className="ppq-hero-actions">
          <button type="button" className="ppq-btn ppq-btn--primary" onClick={onEnterTown}>
            Enter Kotoba Town
          </button>
          <button type="button" className="ppq-btn ppq-btn--ghost" onClick={onContinue}>
            Continue Quest
          </button>
          <button type="button" className="ppq-btn ppq-btn--ghost" onClick={onChapter}>
            Chapter {profile.currentChapter}
          </button>
          <button
            type="button"
            className={
              immersionEnabled
                ? "ppq-btn ppq-btn--primary"
                : "ppq-btn ppq-btn--ghost"
            }
            aria-pressed={immersionEnabled}
            onClick={onToggleImmersion}
          >
            {immersionEnabled ? "🎧 Immersion ON" : "🎧 Immersion"}
          </button>
          <button type="button" className="ppq-btn ppq-btn--ghost" onClick={onRandom}>
            Random Encounter
          </button>
        </div>
        {profile.currentChapter < 2 &&
        !profile.flags.chapter1Complete &&
        !isDeveloperMode(profile) ? (
          <p style={{ fontSize: 12, color: "var(--ppq-muted)", margin: "10px 0 0" }}>
            Next unlock: Chapter 2 · 社会生活 (after First Week Challenge). Open Quests →
            Chapter 2 for a locked preview.
          </p>
        ) : null}
        {isDeveloperMode(profile) ? (
          <p style={{ fontSize: 12, color: "var(--ppq-accent, #e8a317)", margin: "10px 0 0" }}>
            Developer mode ON — all chapters and locations unlocked. Toggle in Adventure
            Stats.
          </p>
        ) : null}
      </section>

      <div className="ppq-secondary-grid">
        <button type="button" className="ppq-secondary-card" onClick={onPassport}>
          <h3>🛂 Japanese Passport</h3>
          <p>Seals, relationships, achievements</p>
        </button>
        <button type="button" className="ppq-secondary-card" onClick={onDaily}>
          <h3>📅 Daily Quests</h3>
          <p>Short goals · coins · XP</p>
        </button>
        <button type="button" className="ppq-secondary-card" onClick={onSkills}>
          <h3>🌳 Skill Tree</h3>
          <p>Listening, conversation, grammar, vocab</p>
        </button>
        <button type="button" className="ppq-secondary-card" onClick={onDojo}>
          <h3>⚔ Training Dojo</h3>
          <p>Survival, Speed Run, Boss Battle drills</p>
        </button>
        <button type="button" className="ppq-secondary-card" onClick={onDungeon}>
          <h3>👾 Weak Word Dungeon</h3>
          <p>Face words from your Weak Words list</p>
        </button>
        <button type="button" className="ppq-secondary-card" onClick={onStats}>
          <h3>Adventure Stats</h3>
          <p>Language bars and Japanese Power</p>
        </button>
      </div>
    </div>
  );
}

function ChapterPanel({
  profile,
  onStartQuest,
}: {
  profile: PlayerRpgProfile;
  onStartQuest: (questId: string) => void;
}) {
  const chapter1Done = Boolean(
    isDeveloperMode(profile) ||
      profile.flags.chapter1Complete ||
      isChapterComplete(profile, 1)
  );
  // Always allow browsing Chapter 2 as a locked preview; only play when unlocked.
  const initial = Math.min(Math.max(1, profile.currentChapter), 2) || 1;
  const [viewChapter, setViewChapter] = useState(initial);

  const chapter = getChapterByNumber(viewChapter);
  if (!chapter) {
    return (
      <div className="ppq-chapter-panel">
        <h2>Chapter</h2>
        <p style={{ color: "var(--ppq-muted)" }}>No chapter data.</p>
      </div>
    );
  }

  const chapterLocked = viewChapter === 2 && !chapter1Done;
  const rows = getChapterQuestRows(profile, chapter);
  const { done, total, percent } = chapterCompletionCounts(profile, viewChapter);
  const shortJa =
    viewChapter === 1 ? "新生活" : viewChapter === 2 ? "社会生活" : chapter.japaneseTitle;

  return (
    <div className="ppq-chapter-panel">
      <div
        className="ppq-hero-actions"
        style={{ marginBottom: 12, flexWrap: "wrap" }}
        role="tablist"
        aria-label="Chapter selector"
      >
        <button
          type="button"
          role="tab"
          aria-selected={viewChapter === 1}
          className={
            viewChapter === 1 ? "ppq-btn ppq-btn--primary" : "ppq-btn ppq-btn--ghost"
          }
          onClick={() => setViewChapter(1)}
        >
          Chapter 1
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={viewChapter === 2}
          className={
            viewChapter === 2 ? "ppq-btn ppq-btn--primary" : "ppq-btn ppq-btn--ghost"
          }
          title={
            chapter1Done
              ? "Chapter 2 · 社会生活"
              : "Preview Chapter 2 — clear Chapter 1 to play"
          }
          onClick={() => setViewChapter(2)}
        >
          Chapter 2
          {chapter1Done || isDeveloperMode(profile) ? "" : " 🔒"}
        </button>
      </div>

      <h2 lang="ja">
        CHAPTER {viewChapter}: {shortJa}
      </h2>
      <p style={{ color: "var(--ppq-muted)", fontSize: 14 }}>
        {chapter.description}
      </p>

      {chapterLocked ? (
        <div className="ppq-panel" style={{ marginTop: 12, marginBottom: 4 }}>
          <h2 style={{ marginTop: 0 }}>Locked</h2>
          <p style={{ margin: 0, fontSize: 13 }}>
            Finish <strong>Chapter 1 · 新生活</strong> (clear the First Week Challenge)
            to unlock Clinic, Phone Center, and Office quests.
          </p>
        </div>
      ) : null}

      <div className="ppq-chapter-progress" aria-label="Chapter progress">
        <div className="ppq-chapter-progress-label">
          {done} / {total}
        </div>
        <div className="ppq-lang-track">
          <div
            className="ppq-lang-fill ppq-chapter-fill"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <ul className="ppq-chapter-list" style={{ marginTop: 14 }}>
        {rows.map(({ quest, status }) => {
          const locked = chapterLocked || status === "locked";
          const icon = chapterLocked
            ? "🔒"
            : status === "completed"
              ? "✅"
              : status === "active"
                ? "▶"
                : "🔒";
          const canPlay =
            !chapterLocked && (status === "completed" || status === "active");
          return (
            <li key={quest.id}>
              <strong>
                {icon} {shortChapterObjectiveLabel(quest)}
              </strong>
              <div style={{ color: "var(--ppq-muted)", fontSize: 12 }}>
                {quest.icon ?? ""} {quest.japaneseTitle} · {quest.title}
              </div>
              {locked && viewChapter === 2 && !chapter1Done ? (
                <div style={{ color: "var(--ppq-muted)", fontSize: 12, marginTop: 4 }}>
                  Unlocks after Chapter 1
                </div>
              ) : null}
              {canPlay ? (
                <button
                  type="button"
                  className={
                    status === "completed"
                      ? "ppq-btn ppq-btn--ghost"
                      : "ppq-btn ppq-btn--primary"
                  }
                  style={{ marginTop: 8 }}
                  onClick={() => onStartQuest(quest.id)}
                >
                  {status === "completed" ? "Replay" : "Play"}
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>

      {viewChapter === 1 && !chapter1Done ? (
        <div className="ppq-panel" style={{ marginTop: 16 }}>
          <h2>Coming next</h2>
          <p lang="ja" style={{ margin: 0, fontFamily: "var(--ppq-jp)" }}>
            第2章・社会生活
          </p>
          <p style={{ margin: "4px 0 0", color: "var(--ppq-muted)", fontSize: 13 }}>
            Life Gets Real — clinic, phone, and workplace Japanese. Tap{" "}
            <strong>Chapter 2</strong> above for a locked preview.
          </p>
        </div>
      ) : null}

      {viewChapter === 2 && profile.flags.chapter2Complete ? (
        <div className="ppq-panel" style={{ marginTop: 16 }}>
          <h2>Chapter 3</h2>
          <p lang="ja" style={{ margin: 0, fontFamily: "var(--ppq-jp)" }}>
            第3章・人間関係
          </p>
          <p style={{ margin: "4px 0 0", color: "var(--ppq-muted)" }}>
            Work, Friends & Relationships — Coming soon
          </p>
        </div>
      ) : null}
    </div>
  );
}

function AdventureLog({ profile }: { profile: PlayerRpgProfile }) {
  const completed = useMemo(
    () =>
      [...profile.completedQuests].sort((a, b) => b.completedAt - a.completedAt),
    [profile.completedQuests]
  );

  return (
    <div>
      <h2>📖 Adventure Log</h2>
      <div className="ppq-panel" style={{ marginTop: 12 }}>
        <h2>Active quest</h2>
        <p style={{ margin: 0 }}>
          {profile.activeQuestId
            ? getQuestById(profile.activeQuestId)?.japaneseTitle ??
              profile.activeQuestId
            : "None"}
        </p>
      </div>

      <div className="ppq-panel" style={{ marginTop: 12 }}>
        <h2>Completed</h2>
        {completed.length === 0 ? (
          <p className="ppq-empty" style={{ padding: 8 }}>
            No quests completed yet.
          </p>
        ) : (
          <ul className="ppq-log-list">
            {completed.map((row) => {
              const quest = getQuestById(row.questId);
              return (
                <li key={`${row.questId}-${row.completedAt}`}>
                  ✅ {quest?.japaneseTitle ?? row.questId}
                  <div style={{ color: "var(--ppq-muted)" }}>
                    {quest?.locationId ?? ""} · Accuracy {row.accuracy}% ·{" "}
                    {formatDate(row.completedAt)}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="ppq-panel" style={{ marginTop: 12 }}>
        <h2>NPCs met</h2>
        {profile.metNpcIds.length === 0 ? (
          <p style={{ margin: 0, color: "var(--ppq-muted)" }}>None yet</p>
        ) : (
          <ul className="ppq-log-list">
            {profile.metNpcIds.map((id) => {
              const npc = getNpcById(id);
              const label =
                id === "haruka"
                  ? "Haruka met"
                  : id === "ken"
                    ? "Ken met"
                    : npc
                      ? `${npc.japaneseName} · ${npc.role}`
                      : id;
              return <li key={id}>✅ {label}</li>;
            })}
          </ul>
        )}
      </div>

      <div className="ppq-panel" style={{ marginTop: 12 }}>
        <h2>Locations unlocked</h2>
        <p style={{ margin: 0 }}>{profile.unlockedLocationIds.join(" · ")}</p>
      </div>

      {(profile.flags.chapter1Complete || profile.flags.chapter2Complete) ? (
        <div className="ppq-panel" style={{ marginTop: 12 }}>
          <h2>Chapter clears</h2>
          {profile.flags.chapter1Complete ? (
            <p style={{ margin: 0 }}>✅ Chapter 1 · 新生活</p>
          ) : null}
          {profile.flags.chapter2Complete ? (
            <p style={{ margin: profile.flags.chapter1Complete ? "6px 0 0" : 0 }}>
              ✅ Chapter 2 · 社会生活
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="ppq-panel" style={{ marginTop: 12 }}>
        <h2>All quests</h2>
        <ul className="ppq-log-list">
          {QUESTS.map((q) => {
            const done = profile.completedQuestIds.includes(q.id);
            return (
              <li key={q.id}>
                {done ? "✅" : "○"} {q.japaneseTitle} — {q.title}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function formatDate(at: number): string {
  try {
    return new Date(at).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function buildChapterSummary({
  chapterNumber,
  result,
  profileBefore,
  profileAfter,
  xpGranted,
  nextComingSoon,
}: {
  chapterNumber: number;
  result: QuestRunOutcome;
  profileBefore: PlayerRpgProfile;
  profileAfter: PlayerRpgProfile;
  xpGranted: number;
  nextComingSoon: boolean;
}): ChapterCompleteSummary {
  const ch = getChapterByNumber(chapterNumber);
  const counts = chapterCompletionCounts(profileAfter, chapterNumber);
  const powerAfter = calcJapanesePower(profileAfter.languageStats);
  const powerBefore = calcJapanesePower(profileBefore.languageStats);
  const strong = strongestLanguageStat(profileAfter.languageStats);
  const weak = weakestLanguageStat(profileAfter.languageStats);
  const newRank = getProfileRank(profileAfter);
  const oldRank = getProfileRank(profileBefore);
  const clearLabel =
    chapterNumber === 1 ? "新生活 COMPLETE" : "社会生活 COMPLETE";

  return {
    chapterNumber,
    chapterJapaneseTitle: ch?.japaneseTitle ?? `第${chapterNumber}章`,
    chapterEnglishClearLabel: clearLabel,
    accuracy: result.accuracy,
    questsCompleted: counts.done,
    questsTotal: counts.total,
    confidenceLeft: result.confidenceLeft,
    xp: xpGranted,
    japanesePower: powerAfter,
    japanesePowerDelta: powerAfter - powerBefore,
    strongest: LANGUAGE_STAT_LABELS[strong].english,
    weakest: LANGUAGE_STAT_LABELS[weak].english,
    weakWords: result.monsters,
    npcsMet: profileAfter.metNpcIds.map(
      (id) => getNpcById(id)?.japaneseName ?? id
    ),
    locationsUnlocked: profileAfter.unlockedLocationIds.map((id) => {
      const loc = getLocationById(id);
      return loc ? `${loc.icon} ${loc.name}` : id;
    }),
    rankLabel:
      newRank.id !== oldRank.id
        ? `${oldRank.japaneseName} → ${newRank.japaneseName}`
        : undefined,
    nextChapterTeaser: ch?.nextChapterTeaser
      ? { ...ch.nextChapterTeaser, comingSoon: nextComingSoon }
      : undefined,
  };
}

export default PeraPeraQuestApp;
