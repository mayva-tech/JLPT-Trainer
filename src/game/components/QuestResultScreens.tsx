import { LANGUAGE_STAT_LABELS } from "../utils/languageStats";
import type { LanguageStatKey, LanguageStats, QuestDefinition, QuestRunMistake } from "../types";
import type { QuestRunOutcome } from "./QuestRunner";

type SuccessProps = {
  quest: QuestDefinition;
  outcome: QuestRunOutcome;
  newlyRewarded: boolean;
  replayRewarded: boolean;
  skillRewards: Partial<LanguageStats>;
  xpGained: number;
  unlockedLocationLabels: string[];
  chapterComplete?: boolean;
  chapterSummary?: ChapterCompleteSummary | null;
  onTown: () => void;
  onLog: () => void;
  onRetry: () => void;
  onChapterNext?: () => void;
};

export type ChapterCompleteSummary = {
  accuracy: number;
  questsCompleted: number;
  confidenceLeft: number;
  xp: number;
  japanesePower: number;
  japanesePowerDelta: number;
  strongest: string;
  weakest: string;
  weakWords: string[];
  npcsMet: string[];
  locationsUnlocked: string[];
  rankLabel?: string;
  chapter2Teaser?: { japaneseTitle: string; title: string };
};

export function QuestSuccessScreen({
  quest,
  outcome,
  newlyRewarded,
  replayRewarded,
  skillRewards,
  xpGained,
  unlockedLocationLabels,
  chapterComplete,
  chapterSummary,
  onTown,
  onLog,
  onRetry,
  onChapterNext,
}: SuccessProps) {
  const teaser = quest.rewards.nextQuestTeaser;

  if (chapterComplete && chapterSummary) {
    return (
      <div className="ppq-result ppq-chapter-complete">
        <p className="ppq-celebrate-kicker">CHAPTER COMPLETE</p>
        <h1 lang="ja">新生活 Complete</h1>
        <p style={{ color: "var(--ppq-muted)" }}>
          You survived your first week in Kotoba Town.
        </p>

        <dl className="ppq-result-grid">
          <div>
            <dt>Chapter accuracy</dt>
            <dd>{chapterSummary.accuracy}%</dd>
          </div>
          <div>
            <dt>Quests</dt>
            <dd>{chapterSummary.questsCompleted}/6</dd>
          </div>
          <div>
            <dt>Confidence left</dt>
            <dd>{chapterSummary.confidenceLeft}</dd>
          </div>
          <div>
            <dt>XP</dt>
            <dd>+{chapterSummary.xp}</dd>
          </div>
          <div>
            <dt>Japanese Power</dt>
            <dd>
              {chapterSummary.japanesePower}
              {chapterSummary.japanesePowerDelta
                ? ` (${chapterSummary.japanesePowerDelta > 0 ? "+" : ""}${chapterSummary.japanesePowerDelta})`
                : ""}
            </dd>
          </div>
          <div>
            <dt>Strongest</dt>
            <dd>{chapterSummary.strongest}</dd>
          </div>
          <div>
            <dt>Weakest</dt>
            <dd>{chapterSummary.weakest}</dd>
          </div>
        </dl>

        {chapterSummary.weakWords.length > 0 ? (
          <p style={{ fontSize: 13 }}>
            Weak Words discovered: {chapterSummary.weakWords.join(" · ")}
          </p>
        ) : null}
        <p style={{ fontSize: 13 }}>
          NPCs met: {chapterSummary.npcsMet.join(" · ") || "—"}
        </p>
        <p style={{ fontSize: 13 }}>
          Locations: {chapterSummary.locationsUnlocked.join(" · ")}
        </p>

        {chapterSummary.rankLabel ? (
          <p>
            Rank: <strong>{chapterSummary.rankLabel}</strong>
          </p>
        ) : null}

        <div className="ppq-panel">
          <h2>Chapter 2</h2>
          <p lang="ja" style={{ margin: 0, fontFamily: "var(--ppq-jp)" }}>
            {chapterSummary.chapter2Teaser?.japaneseTitle ?? "社会生活"}
          </p>
          <p style={{ margin: "4px 0 0", color: "var(--ppq-muted)" }}>
            {chapterSummary.chapter2Teaser?.title ?? "Coming next"}
          </p>
          <p style={{ fontSize: 13, marginTop: 8 }}>
            Preview unlocked: 🏥 Clinic · 📞 Phone Center · 🏢 Office District
          </p>
        </div>

        <div className="ppq-actions">
          <button
            type="button"
            className="ppq-btn ppq-btn--primary"
            onClick={onChapterNext ?? onTown}
          >
            Return to Town
          </button>
          <button type="button" className="ppq-btn ppq-btn--ghost" onClick={onLog}>
            Adventure Log
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ppq-result">
      <p style={{ margin: 0, color: "var(--ppq-muted)", fontSize: 13 }}>
        {quest.icon ?? "📍"} Quest clear
      </p>
      <h1>QUEST COMPLETE</h1>
      <p lang="ja" style={{ fontFamily: "var(--ppq-jp)", margin: 0 }}>
        {quest.japaneseTitle}
      </p>

      <dl className="ppq-result-grid">
        <div>
          <dt>Accuracy</dt>
          <dd>{outcome.accuracy}%</dd>
        </div>
        <div>
          <dt>Confidence</dt>
          <dd>
            {outcome.confidenceLeft}/{quest.startingConfidence}
          </dd>
        </div>
        <div>
          <dt>XP</dt>
          <dd>
            {newlyRewarded || replayRewarded ? `+${xpGained}` : "+0"}
            {replayRewarded && !newlyRewarded ? " (replay)" : ""}
          </dd>
        </div>
      </dl>

      {!newlyRewarded && !replayRewarded ? (
        <p style={{ color: "var(--ppq-muted)", fontSize: 13 }}>
          Rewards already claimed for this quest.
        </p>
      ) : null}

      <div className="ppq-panel">
        <h2>Language gains</h2>
        <div className="ppq-skill-gains">
          {Object.entries(skillRewards).map(([key, value]) => {
            if (!value) return null;
            const labels =
              LANGUAGE_STAT_LABELS[key as LanguageStatKey];
            if (!labels) return null;
            return (
              <div key={key}>
                {labels.english} +{value}
              </div>
            );
          })}
          {Object.keys(skillRewards).length === 0 ? (
            <div style={{ color: "var(--ppq-muted)" }}>None this run</div>
          ) : null}
        </div>
      </div>

      {outcome.vocabDiscovered.length > 0 ? (
        <p style={{ fontSize: 13 }}>
          Vocabulary discovered: {outcome.vocabDiscovered.join(" · ")}
        </p>
      ) : null}

      {outcome.monsters.length > 0 ? (
        <p className="ppq-monster">
          👾 Weak Word detected: {outcome.monsters.join(" · ")}
        </p>
      ) : null}

      {unlockedLocationLabels.length > 0 ? (
        <p className="ppq-unlock-toast">
          Unlocked: {unlockedLocationLabels.join(" · ")}
        </p>
      ) : null}

      {teaser ? (
        <p style={{ color: "var(--ppq-muted)", fontSize: 13 }}>
          Coming next: {teaser.japaneseTitle} — {teaser.title}
        </p>
      ) : null}

      <div className="ppq-actions">
        <button type="button" className="ppq-btn ppq-btn--primary" onClick={onTown}>
          Return to Town
        </button>
        <button type="button" className="ppq-btn ppq-btn--ghost" onClick={onLog}>
          Adventure Log
        </button>
        <button type="button" className="ppq-btn ppq-btn--ghost" onClick={onRetry}>
          Replay Quest
        </button>
      </div>
    </div>
  );
}

type FailProps = {
  quest: QuestDefinition;
  outcome: QuestRunOutcome;
  weakCategories: string[];
  isBoss: boolean;
  onRetry: () => void;
  onReview: () => void;
  onDojo: () => void;
  onDungeon: () => void;
  onTown: () => void;
};

export function QuestFailScreen({
  quest,
  outcome,
  weakCategories,
  isBoss,
  onRetry,
  onReview,
  onDojo,
  onDungeon,
  onTown,
}: FailProps) {
  return (
    <div className="ppq-result">
      <h1>{isBoss ? "CHALLENGE FAILED" : "QUEST FAILED"}</h1>
      <p style={{ color: "var(--ppq-muted)" }}>
        {isBoss
          ? "You made it through most of the day, but some situations still need practice."
          : `Confidence ran out during ${quest.title} — no heavy penalty. Review and try again.`}
      </p>
      <dl className="ppq-result-grid">
        <div>
          <dt>Accuracy</dt>
          <dd>{outcome.accuracy}%</dd>
        </div>
        <div>
          <dt>Mistakes</dt>
          <dd>{outcome.mistakes.length}</dd>
        </div>
      </dl>

      {weakCategories.length > 0 ? (
        <div className="ppq-panel">
          <h2>Needs work</h2>
          <ul className="ppq-log-list">
            {weakCategories.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {outcome.monsters.length > 0 ? (
        <p className="ppq-monster">
          Review candidates: {outcome.monsters.join(" · ")}
        </p>
      ) : null}

      <div className="ppq-actions">
        <button type="button" className="ppq-btn ppq-btn--primary" onClick={onRetry}>
          {isBoss ? "Retry Challenge" : "Retry Quest"}
        </button>
        <button
          type="button"
          className="ppq-btn ppq-btn--ghost"
          onClick={onReview}
          disabled={outcome.mistakes.length === 0}
        >
          Review Mistakes
        </button>
        <button type="button" className="ppq-btn ppq-btn--ghost" onClick={onDungeon}>
          Review Weak Words
        </button>
        <button type="button" className="ppq-btn ppq-btn--ghost" onClick={onDojo}>
          Train at the Dojo
        </button>
        <button type="button" className="ppq-btn ppq-btn--ghost" onClick={onTown}>
          Town
        </button>
      </div>
    </div>
  );
}

export function QuestMistakeReview({
  mistakes,
  onBack,
}: {
  mistakes: QuestRunMistake[];
  onBack: () => void;
}) {
  return (
    <div className="ppq-result">
      <h1>Review mistakes</h1>
      <ul className="ppq-log-list">
        {mistakes.map((mistake, index) => (
          <li key={`${mistake.stepId}-${index}`}>
            <p lang="ja" style={{ fontFamily: "var(--ppq-jp)", margin: "0 0 6px" }}>
              {mistake.promptJa}
            </p>
            <p style={{ margin: 0 }}>Your answer: {mistake.selectedLabel}</p>
            <p style={{ margin: "4px 0 0" }}>Better: {mistake.correctLabel}</p>
          </li>
        ))}
      </ul>
      <div className="ppq-actions">
        <button type="button" className="ppq-btn ppq-btn--primary" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
}
