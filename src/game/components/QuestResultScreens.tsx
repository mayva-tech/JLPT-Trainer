import { LANGUAGE_STAT_LABELS } from "../utils/languageStats";
import { getNpcById } from "../data/npcs";
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
  chapterNumber: number;
  chapterJapaneseTitle: string;
  chapterEnglishClearLabel: string;
  accuracy: number;
  questsCompleted: number;
  questsTotal: number;
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
  nextChapterTeaser?: { japaneseTitle: string; title: string; comingSoon?: boolean };
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
    const next = chapterSummary.nextChapterTeaser;
    return (
      <div className="ppq-result ppq-chapter-complete">
        <p className="ppq-celebrate-kicker">
          CHAPTER {chapterSummary.chapterNumber} CLEAR
        </p>
        <h1 lang="ja">{chapterSummary.chapterEnglishClearLabel}</h1>
        <p style={{ color: "var(--ppq-muted)" }}>
          {chapterSummary.chapterNumber === 1
            ? "You survived your first week in Kotoba Town."
            : chapterSummary.chapterNumber === 2
              ? "You handled clinic, phone, and workplace Japanese in one connected day."
              : chapterSummary.chapterNumber === 3
                ? "You learned that grammatically correct is not always socially natural."
                : chapterSummary.chapterNumber === 4
                  ? "Professional Japanese is not just more polite Japanese — register, reporting, and recovery matter."
                  : "You learned to hear Japanese the way people actually say it — reduced, fast, and implied."}
        </p>

        <dl className="ppq-result-grid">
          <div>
            <dt>Chapter accuracy</dt>
            <dd>{chapterSummary.accuracy}%</dd>
          </div>
          <div>
            <dt>Quests</dt>
            <dd>
              {chapterSummary.questsCompleted}/{chapterSummary.questsTotal}
            </dd>
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

        {next ? (
          <div className="ppq-panel">
            <h2>NEXT</h2>
            <p lang="ja" style={{ margin: 0, fontFamily: "var(--ppq-jp)" }}>
              {next.japaneseTitle}
            </p>
            <p style={{ margin: "4px 0 0", color: "var(--ppq-muted)" }}>
              {next.title}
              {next.comingSoon ? " · Coming soon" : ""}
            </p>
            {chapterSummary.chapterNumber === 1 ? (
              <p style={{ fontSize: 13, marginTop: 8 }}>
                Unlocked next: 🏥 Clinic — then Phone Center and Office as you progress.
              </p>
            ) : null}
          </div>
        ) : null}

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
          <dt>Communication</dt>
          <dd>{outcome.communicationPercent ?? 0}%</dd>
        </div>
        {typeof outcome.socialFitPercent === "number" ? (
          <div>
            <dt>Social Fit</dt>
            <dd>{outcome.socialFitPercent}%</dd>
          </div>
        ) : null}
        {typeof outcome.professionalFitPercent === "number" ? (
          <div>
            <dt>Professional Fit</dt>
            <dd>{outcome.professionalFitPercent}%</dd>
          </div>
        ) : null}
        {typeof outcome.nativeListeningPercent === "number" ? (
          <div>
            <dt>Native Listening</dt>
            <dd>{outcome.nativeListeningPercent}%</dd>
          </div>
        ) : null}
        <div>
          <dt>XP</dt>
          <dd>
            {newlyRewarded || replayRewarded ? `+${xpGained}` : "+0"}
            {replayRewarded && !newlyRewarded ? " (replay)" : ""}
          </dd>
        </div>
      </dl>

      {(outcome.immersionNoEnglish ||
        outcome.firstListenSuccess ||
        outcome.repairedConversation ||
        (outcome.maxNaturalStreak ?? 0) >= 3) && (
        <div className="ppq-result-badges">
          {outcome.immersionNoEnglish ? (
            <span className="ppq-badge">No English</span>
          ) : null}
          {outcome.firstListenSuccess ? (
            <span className="ppq-badge">First Listen</span>
          ) : null}
          {outcome.repairedConversation || outcome.repairUsed ? (
            <span className="ppq-badge">Conversation Repair</span>
          ) : null}
          {(outcome.maxNaturalStreak ?? 0) >= 3 ? (
            <span className="ppq-badge">Natural Response Streak</span>
          ) : null}
        </div>
      )}

      {outcome.engine === "v2" ? (
        <div className="ppq-panel" style={{ marginTop: 12 }}>
          <h2>Conversation summary</h2>
          {(outcome.conceptsLearned?.length ?? 0) > 0 ? (
            <p style={{ fontSize: 13, margin: "0 0 6px" }}>
              Learned: {outcome.conceptsLearned.join(" · ")}
            </p>
          ) : null}
          {(outcome.needsReview?.length ?? 0) > 0 ? (
            <p style={{ fontSize: 13, margin: "0 0 6px" }}>
              Needs review: {[...new Set(outcome.needsReview)].join(" · ")}
            </p>
          ) : null}
          {(outcome.relationshipDeltas?.length ?? 0) > 0 ? (
            <p style={{ fontSize: 13, margin: "0 0 6px" }}>
              Relationship:{" "}
              {outcome.relationshipDeltas!.map((r) => {
                const npc = getNpcById(r.npcId);
                const name = npc?.japaneseName ?? r.npcId;
                const sign = r.delta > 0 ? "+" : "";
                return `${name} ${sign}${r.delta}`;
              }).join(" · ")}
            </p>
          ) : null}
          {outcome.maxNaturalStreak ? (
            <p style={{ fontSize: 13, margin: 0 }}>
              Best natural streak: {outcome.maxNaturalStreak}
            </p>
          ) : null}
          {typeof outcome.firstListenTotal === "number" &&
          outcome.firstListenTotal > 0 ? (
            <p style={{ fontSize: 13, margin: "6px 0 0" }}>
              First-listen accuracy: {outcome.firstListenCorrect ?? 0}/
              {outcome.firstListenTotal}
              {typeof outcome.firstListenWithReplayCorrect === "number"
                ? ` · With replay: ${outcome.firstListenWithReplayCorrect}/${outcome.firstListenTotal}`
                : ""}
            </p>
          ) : null}
          {typeof outcome.highestAssistLevel === "number" &&
          outcome.highestAssistLevel > 0 ? (
            <p style={{ fontSize: 13, margin: "6px 0 0" }}>
              Assist used:{" "}
              {["Audio only", "Replay", "Slow", "Transcript", "English"][
                outcome.highestAssistLevel
              ] ?? `Level ${outcome.highestAssistLevel}`}
            </p>
          ) : null}
          {outcome.reportingQuality?.notes?.length ? (
            <div style={{ marginTop: 8 }}>
              <p style={{ fontSize: 12, color: "var(--ppq-muted)", margin: "0 0 4px" }}>
                Reporting
              </p>
              <ul className="ppq-report-list">
                {outcome.reportingQuality.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {(outcome.summaryFacts?.length ||
        outcome.repairCounts ||
        outcome.resultSummaryTitle) && (
        <div className="ppq-panel ppq-result-summary" style={{ marginTop: 12 }}>
          <h2>{outcome.resultSummaryTitle ?? "Mission report"}</h2>
          {(outcome.summaryFacts?.length ?? 0) > 0 ? (
            <div style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 12, color: "var(--ppq-muted)", margin: "0 0 4px" }}>
                Understood
              </p>
              <ul className="ppq-report-list">
                {outcome.summaryFacts!.map((fact) => (
                  <li key={fact.key}>
                    {fact.understood ? "✓" : "○"} {fact.label}
                    {fact.value ? (
                      <span style={{ color: "var(--ppq-muted)" }}>
                        {" "}
                        · {fact.value}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {(outcome.needsReview?.length ?? 0) > 0 ? (
            <p style={{ fontSize: 13, margin: "0 0 8px" }}>
              Needed clarification: △{" "}
              {[...new Set(outcome.needsReview)].slice(0, 4).join(" · ")}
            </p>
          ) : null}
          {outcome.repairCounts ? (
            <p style={{ fontSize: 13, margin: "0 0 8px" }}>
              Repairs: Repeat ×{outcome.repairCounts.repeat} · Slow ×
              {outcome.repairCounts.slow} · Meaning ×{outcome.repairCounts.meaning}{" "}
              · Confirm ×{outcome.repairCounts.confirm}
            </p>
          ) : null}
          <p style={{ fontSize: 13, margin: "0 0 4px" }}>
            Communication: {outcome.communicationPercent ?? 0}%
          </p>
          {outcome.immersionNoEnglish ? (
            <p style={{ fontSize: 13, margin: 0 }}>No English: ✓</p>
          ) : null}
        </div>
      )}

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
