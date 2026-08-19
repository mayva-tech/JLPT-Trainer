import { useCallback, useMemo, useState } from "react";
import "./relation-trainer.css";
import { wordRelations } from "../../data/wordRelations";
import { useJapaneseVoice } from "../../lib/japanese/useJapaneseVoice";
import { useProgress } from "../../lib/japanese/useProgress";
import {
  filterWordRelations,
  relationStats,
  relationStatus,
  sortWordRelations,
  wordRelationTotal,
  type LevelFilter,
  type RelationSort,
  type TypeFilter,
} from "../../utils/wordRelations";
import { RelationBrowse } from "./components/RelationBrowse";
import { RelationFilters } from "./components/RelationFilters";
import { RelationQuiz } from "./components/RelationQuiz";
import { RelationStats } from "./components/RelationStats";
import { RelationStudy } from "./components/RelationStudy";

/** Its own key, so this page never overwrites the other trainers' progress. */
const STORAGE_KEY = "jlpt-trainer:relations:v1";

type Mode = "browse" | "study" | "quiz";

const MODES: { id: Mode; label: string }[] = [
  { id: "study", label: "Study" },
  { id: "browse", label: "Browse" },
  { id: "quiz", label: "Quiz" },
];

export default function RelationTrainer() {
  const [mode, setMode] = useState<Mode>("study");
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<LevelFilter>("all");
  const [type, setType] = useState<TypeFilter>("all");
  const [sort, setSort] = useState<RelationSort>("level");

  const { progress, toggle } = useProgress(STORAGE_KEY);
  const voice = useJapaneseVoice();

  const speak = useCallback(
    (text: string) => {
      if (text) voice.speak(text);
    },
    [voice]
  );

  // Study and Quiz ignore the free-text search: they run on the filtered deck.
  const deck = useMemo(
    () => filterWordRelations(wordRelations, { level, type }),
    [level, type]
  );

  const listed = useMemo(
    () =>
      sortWordRelations(
        filterWordRelations(wordRelations, { search, level, type }),
        sort
      ),
    [search, level, type, sort]
  );

  const stats = useMemo(
    () => relationStats(deck, progress),
    [deck, progress]
  );

  const statusOf = useCallback(
    (id: string) => relationStatus(id, progress),
    [progress]
  );

  const toggleLearning = useCallback(
    (id: string) => toggle("practiced", id),
    [toggle]
  );
  const toggleLearned = useCallback(
    (id: string) => toggle("known", id),
    [toggle]
  );

  return (
    <div className={mode === "study" ? "rt-root rt-root--study" : "rt-root"}>
      <div className="rt-chrome">
        <header className="rt-header">
          <h1 className="rt-title">Synonyms &amp; Antonyms</h1>
          <p className="rt-title-jp" lang="ja">
            類義語・反対語
          </p>
          <p className="rt-subtitle">
            Learn words with similar and opposite meanings from JLPT N5 through
            N2.
          </p>
          <p className="rt-headline-stats">
            <span>{wordRelationTotal} relationships</span>
            <span>N5 → N2</span>
            <span>Study · Browse · Quiz</span>
          </p>
        </header>

        <nav className="rt-modes" aria-label="Mode">
          {MODES.map((item) => (
            <button
              key={item.id}
              type="button"
              className="rt-mode"
              aria-pressed={mode === item.id}
              onClick={() => setMode(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <RelationStats stats={stats} />

        <RelationFilters
          search={search}
          onSearch={setSearch}
          level={level}
          onLevel={setLevel}
          type={type}
          onType={setType}
          sort={sort}
          onSort={setSort}
          showSort={mode === "browse"}
          total={mode === "browse" ? listed.length : deck.length}
        />
      </div>

      {mode === "browse" ? (
        <RelationBrowse
          relations={listed}
          statusOf={statusOf}
          onToggleLearning={toggleLearning}
          onToggleLearned={toggleLearned}
        />
      ) : null}

      {mode === "study" ? (
        <RelationStudy relations={deck} />
      ) : null}

      {mode === "quiz" ? (
        <RelationQuiz
          relations={deck}
          level={level}
          type={type}
          onSpeak={speak}
        />
      ) : null}
    </div>
  );
}
