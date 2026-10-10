import { useMemo, useState } from "react";
import "./everyday-trainer.css";
import { useHeadScene } from "../../hooks/useHeadScene";
import { Furigana } from "../../lib/japanese/furigana";
import { EverydayPicture } from "./EverydayPicture";
import { computeBadges } from "./everydayBadges";
import {
  EVERYDAY_CATEGORIES,
  EVERYDAY_WORDS,
  categoryById,
  hasPicture,
  searchWords,
  wordById,
  wordRomaji,
  wordsInCategory,
} from "./everydayData";
import { quizAccuracy, reviewCandidates, weakWordIds } from "./everydayProgress";
import { buildQuiz, buildReviewQuiz, seededRandom, shuffle } from "./everydayQuiz";
import { useEverydayProgress } from "./useEverydayProgress";
import { useEverydaySpeech } from "./useEverydaySpeech";
import { ExploreDeck } from "./components/ExploreDeck";
import { QuizRunner } from "./components/QuizRunner";
import { RecallSession } from "./components/RecallSession";
import { IconChevronLeft, IconSearch } from "./components/icons";
import type { EverydayCategory, EverydayWord } from "./types";

const ROUND = 10;

type CategoryMode = "explore" | "picture" | "listen" | "recall";

type Screen =
  | { name: "home" }
  | { name: "category"; categoryId: string; mode: CategoryMode; wordId: string | null; seed: number }
  | { name: "all"; mode: Exclude<CategoryMode, "explore">; seed: number }
  | { name: "review"; seed: number };

type Filter = "all" | "new" | "progress" | "done";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "new", label: "Not started" },
  { id: "progress", label: "In progress" },
  { id: "done", label: "Completed" },
];

const MODE_TABS: { id: CategoryMode; label: string }[] = [
  { id: "explore", label: "Explore" },
  { id: "picture", label: "Picture Quiz" },
  { id: "listen", label: "Listen" },
  { id: "recall", label: "Recall" },
];

const ALL_IDS = new Set(EVERYDAY_WORDS.map((w) => w.id));

export default function EverydayTrainer() {
  const progressApi = useEverydayProgress();
  const { progress } = progressApi;
  const speech = useEverydaySpeech();
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const category = screen.name === "category" ? categoryById(screen.categoryId) ?? null : null;
  useHeadScene({ backdrop: category?.backdrop ?? "street" });

  const open = (next: Screen) => {
    speech.stop();
    setScreen(next);
  };
  const openCategory = (categoryId: string, mode: CategoryMode = "explore", wordId: string | null = null) =>
    open({ name: "category", categoryId, mode, wordId, seed: Date.now() });

  return (
    <div className="ev-root">
      {screen.name === "home" ? (
        <Home
          progressApi={progressApi}
          query={query}
          setQuery={setQuery}
          filter={filter}
          setFilter={setFilter}
          openCategory={openCategory}
          open={open}
        />
      ) : (
        <header className="ev-subhead">
          <button type="button" className="ev-back" onClick={() => open({ name: "home" })}>
            <IconChevronLeft size={16} /> Locations
          </button>
          {category ? (
            <h2 className="ev-subtitle">
              {category.english} <span lang="ja"><Furigana text={category.japanese} /></span>
            </h2>
          ) : (
            <h2 className="ev-subtitle">
              {screen.name === "review" ? "Quick Review" : "All locations"}
            </h2>
          )}
        </header>
      )}

      {screen.name === "category" && category ? (
        <>
          <nav className="ev-tabs" aria-label="Learning mode">
            {MODE_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={screen.mode === t.id ? "ev-tab ev-tab--on" : "ev-tab"}
                aria-pressed={screen.mode === t.id}
                onClick={() => openCategory(category.id, t.id, null)}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <CategoryScreen
            key={`${category.id}:${screen.mode}:${screen.seed}`}
            category={category}
            mode={screen.mode}
            wordId={screen.wordId}
            seed={screen.seed}
            progressApi={progressApi}
            speech={speech}
            restart={() => openCategory(category.id, screen.mode, screen.wordId)}
            back={() => open({ name: "home" })}
          />
        </>
      ) : null}

      {screen.name === "all" ? (
        <>
          <nav className="ev-tabs" aria-label="Learning mode">
            {MODE_TABS.filter((t) => t.id !== "explore").map((t) => (
              <button
                key={t.id}
                type="button"
                className={screen.mode === t.id ? "ev-tab ev-tab--on" : "ev-tab"}
                aria-pressed={screen.mode === t.id}
                onClick={() => open({ name: "all", mode: t.id as Exclude<CategoryMode, "explore">, seed: Date.now() })}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <PracticeRound
            key={`all:${screen.mode}:${screen.seed}`}
            mode={screen.mode}
            words={EVERYDAY_WORDS}
            categoryId={null}
            seed={screen.seed}
            progressApi={progressApi}
            speech={speech}
            restart={() => open({ name: "all", mode: screen.mode, seed: Date.now() })}
            back={() => open({ name: "home" })}
          />
        </>
      ) : null}

      {screen.name === "review" ? (
        <ReviewRound
          key={screen.seed}
          seed={screen.seed}
          progressApi={progressApi}
          speech={speech}
          restart={() => open({ name: "review", seed: Date.now() })}
          back={() => open({ name: "home" })}
        />
      ) : null}

      {screen.name === "home" ? null : (
        <p className="ev-footnote">
          {quizAccuracy(progress).answered > 0
            ? `${Math.round((quizAccuracy(progress).correct / quizAccuracy(progress).answered) * 100)}% quiz accuracy · `
            : ""}
          {weakWordIds(progress).length} weak · {progress.favorites.length} saved
        </p>
      )}
    </div>
  );
}

/* ---------------- home ---------------- */

function Home({
  progressApi,
  query,
  setQuery,
  filter,
  setFilter,
  openCategory,
  open,
}: {
  progressApi: ReturnType<typeof useEverydayProgress>;
  query: string;
  setQuery: (q: string) => void;
  filter: Filter;
  setFilter: (f: Filter) => void;
  openCategory: (id: string, mode?: CategoryMode, wordId?: string | null) => void;
  open: (s: Screen) => void;
}) {
  const { progress, updatePrefs } = progressApi;
  const results = useMemo(() => (query.trim() ? searchWords(query).slice(0, 40) : []), [query]);
  const accuracy = quizAccuracy(progress);
  const weak = weakWordIds(progress).length;
  const reviewCount = reviewCandidates(progress, ALL_IDS).length;
  const resumeWord = progress.resume ? wordById(progress.resume.wordId) : undefined;
  const resumeCategory = progress.resume ? categoryById(progress.resume.categoryId) : undefined;
  const badges = computeBadges(progress);

  const status = (c: EverydayCategory) => {
    const words = wordsInCategory(c.id);
    const learned = words.filter((w) => progress.known.includes(w.id)).length;
    const explored = words.filter((w) => progress.practiced.includes(w.id)).length;
    return { total: words.length, learned, explored, pictured: words.filter(hasPicture).length };
  };
  const visible = EVERYDAY_CATEGORIES.filter((c) => {
    const s = status(c);
    if (filter === "new") return s.explored === 0 && s.learned === 0;
    if (filter === "progress") return (s.explored > 0 || s.learned > 0) && s.learned < s.total;
    if (filter === "done") return s.learned === s.total;
    return true;
  });

  const openWord = (wordId: string) => {
    const word = wordById(wordId);
    if (!word) return;
    if (!word.picture && progress.prefs.picturesOnly) updatePrefs({ picturesOnly: false });
    openCategory(word.categoryIds[0]!, "explore", wordId);
  };

  return (
    <>
      <header className="ev-header">
        <h1 className="ev-title">
          Everyday Japanese{" "}
          <span lang="ja">
            <Furigana text="身(み)の回(まわ)りの日本語(にほんご)" />
          </span>
        </h1>
        <p className="ev-tagline">Explore Japan, one word at a time.</p>
      </header>

      <section className="ev-stats" aria-label="Your progress">
        <div>
          <strong>{progress.practiced.filter((id) => ALL_IDS.has(id)).length}</strong>
          <span>explored</span>
        </div>
        <div>
          <strong>{progress.known.filter((id) => ALL_IDS.has(id)).length}</strong>
          <span>learned</span>
        </div>
        <div>
          <strong>{accuracy.answered ? `${Math.round((accuracy.correct / accuracy.answered) * 100)}%` : "–"}</strong>
          <span>accuracy</span>
        </div>
        <div>
          <strong>{weak}</strong>
          <span>weak</span>
        </div>
        <div>
          <strong>{progress.favorites.length}</strong>
          <span>saved</span>
        </div>
      </section>

      <div className="ev-actions">
        {resumeWord && resumeCategory ? (
          <button
            type="button"
            className="ev-resume"
            onClick={() => openCategory(resumeCategory.id, "explore", resumeWord.id)}
          >
            <span className="ev-resume-pic">
              <EverydayPicture word={resumeWord} decorative />
            </span>
            <span>
              <small>Continue · {resumeCategory.english}</small>
              <span lang="ja">
                <Furigana text={resumeWord.japanese} />
              </span>
            </span>
          </button>
        ) : null}
        <button
          type="button"
          className="ev-btn ev-btn--primary"
          disabled={reviewCount === 0}
          title={reviewCount === 0 ? "Explore some words first" : "Short review of words you have met"}
          onClick={() => open({ name: "review", seed: Date.now() })}
        >
          Quick Review{reviewCount ? ` · ${Math.min(ROUND, reviewCount)}` : ""}
        </button>
        <button type="button" className="ev-btn" onClick={() => open({ name: "all", mode: "picture", seed: Date.now() })}>
          Mixed Picture Quiz
        </button>
      </div>

      <label className="ev-search">
        <IconSearch />
        <input
          type="search"
          value={query}
          placeholder="Search: ticket gate, かいさつ, tsurikawa…"
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search words"
        />
      </label>

      {query.trim() ? (
        <ul className="ev-results" aria-label="Search results">
          {results.length === 0 ? <li className="ev-results-none">No words found.</li> : null}
          {results.map((w) => (
            <li key={w.id}>
              <button type="button" onClick={() => openWord(w.id)}>
                <span className="ev-results-pic">
                  <EverydayPicture word={w} decorative />
                </span>
                <span className="ev-results-jp" lang="ja">
                  <Furigana text={w.japanese} />
                </span>
                <span className="ev-results-en">
                  {w.english}
                  <small>{wordRomaji(w)}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <>
          <div className="ev-chips" role="group" aria-label="Filter locations">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={filter === f.id ? "ev-chip ev-chip--on" : "ev-chip"}
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="ev-grid">
            {visible.length === 0 ? <p className="ev-results-none">Nothing here yet.</p> : null}
            {visible.map((c) => {
              const s = status(c);
              const cover = wordById(c.coverWordId);
              return (
                <button key={c.id} type="button" className="ev-tile" onClick={() => openCategory(c.id)}>
                  <span className="ev-tile-pic">{cover ? <EverydayPicture word={cover} decorative /> : null}</span>
                  <span className="ev-tile-name">{c.english}</span>
                  <span className="ev-tile-jp" lang="ja">
                    <Furigana text={c.japanese} />
                  </span>
                  <span className="ev-tile-bar" aria-hidden="true">
                    <span style={{ width: `${(s.learned / s.total) * 100}%` }} />
                  </span>
                  <span className="ev-tile-count">
                    {s.learned}/{s.total} learned · {s.pictured} pictures
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      <section className="ev-badges" aria-label="Achievements">
        <h3 className="ev-h3">Achievements</h3>
        <ul>
          {badges.map((b) => (
            <li key={b.id} className={b.done >= b.total ? "ev-badge ev-badge--won" : "ev-badge"}>
              <span className="ev-badge-icon" aria-hidden="true">
                {b.icon}
              </span>
              <span className="ev-badge-text">
                <strong>{b.title}</strong>
                <small>
                  {b.goal} · {b.done}/{b.total}
                </small>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

/* ---------------- per-location and practice screens ---------------- */

function CategoryScreen({
  category,
  mode,
  wordId,
  seed,
  progressApi,
  speech,
  restart,
  back,
}: {
  category: EverydayCategory;
  mode: CategoryMode;
  wordId: string | null;
  seed: number;
  progressApi: ReturnType<typeof useEverydayProgress>;
  speech: ReturnType<typeof useEverydaySpeech>;
  restart: () => void;
  back: () => void;
}) {
  const all = wordsInCategory(category.id);
  const picturesOnly = progressApi.progress.prefs.picturesOnly;
  const words = useMemo(() => (picturesOnly ? all.filter(hasPicture) : all), [all, picturesOnly]);

  if (mode === "explore") {
    return (
      <ExploreDeck
        category={category}
        words={words}
        initialWordId={wordId ?? (progressApi.progress.resume?.categoryId === category.id ? progressApi.progress.resume.wordId : null)}
        progressApi={progressApi}
        speech={speech}
      />
    );
  }
  return (
    <PracticeRound
      mode={mode}
      words={all}
      categoryId={category.id}
      seed={seed}
      progressApi={progressApi}
      speech={speech}
      restart={restart}
      back={back}
    />
  );
}

function PracticeRound({
  mode,
  words,
  categoryId,
  seed,
  progressApi,
  speech,
  restart,
  back,
}: {
  mode: Exclude<CategoryMode, "explore">;
  words: readonly EverydayWord[];
  categoryId: string | null;
  seed: number;
  progressApi: ReturnType<typeof useEverydayProgress>;
  speech: ReturnType<typeof useEverydaySpeech>;
  restart: () => void;
  back: () => void;
}) {
  const questions = useMemo(
    () => (mode === "recall" ? [] : buildQuiz(mode, words, ROUND, `${categoryId ?? "all"}:${mode}:${seed}`)),
    [mode, words, categoryId, seed],
  );
  const recallWords = useMemo(
    () => (mode === "recall" ? shuffle(words.filter(hasPicture), seededRandom(`recall:${seed}`)).slice(0, ROUND) : []),
    [mode, words, seed],
  );

  if (mode === "recall") {
    return (
      <RecallSession
        words={recallWords}
        categoryId={categoryId}
        progressApi={progressApi}
        speech={speech}
        onRestart={restart}
        onExit={back}
      />
    );
  }
  return (
    <QuizRunner
      questions={questions}
      mode={mode}
      categoryId={categoryId}
      progressApi={progressApi}
      speech={speech}
      onRestart={restart}
      onExit={back}
    />
  );
}

function ReviewRound({
  seed,
  progressApi,
  speech,
  restart,
  back,
}: {
  seed: number;
  progressApi: ReturnType<typeof useEverydayProgress>;
  speech: ReturnType<typeof useEverydaySpeech>;
  restart: () => void;
  back: () => void;
}) {
  // Built once per round: answering updates progress, which must not reshuffle the round.
  const [questions] = useState(() =>
    buildReviewQuiz(reviewCandidates(progressApi.progress, ALL_IDS).slice(0, ROUND * 2), ROUND, `review:${seed}`),
  );
  return (
    <QuizRunner
      questions={questions}
      mode="review"
      categoryId={null}
      progressApi={progressApi}
      speech={speech}
      onRestart={restart}
      onExit={back}
    />
  );
}
