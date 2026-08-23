import { useCallback, useMemo, useState } from "react";
import "./style-trainer.css";
import { styleExpressions } from "../../data/speechStyles";
import { useJapaneseVoice } from "../../lib/japanese/useJapaneseVoice";
import {
  buildComparisons,
  filterStyles,
  pickRandomStyle,
  styleStats,
  styleTotal,
  type CategoryFilter,
  type GenderFilter,
  type LevelFilter,
  type PolitenessFilter,
} from "../../utils/speechStyles";
import { StyleCard } from "./components/StyleCard";
import { StyleComparisonList } from "./components/StyleComparison";
import { StyleFilters, StyleStatsBar } from "./components/StyleControls";
import { StyleQuiz } from "./components/StyleQuiz";
import { StyleRegisterShifts } from "./components/StyleRegisterShifts";

type Mode = "compare" | "browse" | "shifts" | "quiz";

const MODES: { id: Mode; label: string }[] = [
  { id: "compare", label: "Compare" },
  { id: "browse", label: "Browse" },
  { id: "shifts", label: "Register" },
  { id: "quiz", label: "Quiz" },
];

const PAGE = 40;

export default function StyleTrainer() {
  const [mode, setMode] = useState<Mode>("compare");
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState<GenderFilter>("all");
  const [level, setLevel] = useState<LevelFilter>("all");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [politeness, setPoliteness] = useState<PolitenessFilter>("all");
  const [modernOnly, setModernOnly] = useState(false);
  const [showRough, setShowRough] = useState(true);
  const [showAnime, setShowAnime] = useState(true);
  const [shown, setShown] = useState(PAGE);
  const [spotlight, setSpotlight] = useState<string | null>(null);

  const voice = useJapaneseVoice();
  const speak = useCallback(
    (text: string) => {
      if (text) voice.speak(text);
    },
    [voice]
  );

  const filtered = useMemo(
    () =>
      filterStyles(styleExpressions, {
        search,
        gender,
        level,
        category,
        politeness,
        modernOnly,
        showRough,
        showAnime,
      }),
    [search, gender, level, category, politeness, modernOnly, showRough, showAnime]
  );

  const comparisons = useMemo(() => buildComparisons(filtered), [filtered]);
  const stats = useMemo(() => styleStats(filtered), [filtered]);

  const spotlightItem = spotlight
    ? filtered.find((item) => item.id === spotlight)
    : undefined;

  const randomise = useCallback(() => {
    const picked = pickRandomStyle(filtered);
    if (picked) {
      setSpotlight(picked.id);
      setMode("browse");
    }
  }, [filtered]);

  return (
    <div className="ss-root">
      <header className="ss-header">
        <h1 className="ss-title">Masculine, Feminine &amp; Neutral Japanese</h1>
        <p className="ss-title-jp" lang="ja">
          男ことば・女ことば・話し方
        </p>
        <p className="ss-subtitle">
          How Japanese shifts with gender, age, personality, closeness and
          setting. Most of what follows is <strong>neutral</strong> — the real
          picture is a spectrum, not two lists. 僕 is not childish, 俺 is not
          rude, and あたし is not automatically right just because the speaker is
          a woman.
        </p>
        <p className="ss-headline-stats">
          <span>{styleTotal} expressions</span>
          <span>12 categories</span>
          <span>N5 → beyond N2</span>
        </p>
      </header>

      <nav className="ss-modes" aria-label="Mode">
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            className="ss-mode"
            aria-pressed={mode === item.id}
            onClick={() => setMode(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {mode !== "shifts" ? (
        <>
          <StyleStatsBar stats={stats} />
          <StyleFilters
            search={search}
            onSearch={(value) => {
              setSearch(value);
              setShown(PAGE);
            }}
            gender={gender}
            onGender={setGender}
            level={level}
            onLevel={setLevel}
            category={category}
            onCategory={setCategory}
            politeness={politeness}
            onPoliteness={setPoliteness}
            modernOnly={modernOnly}
            onModernOnly={setModernOnly}
            showRough={showRough}
            onShowRough={setShowRough}
            showAnime={showAnime}
            onShowAnime={setShowAnime}
            total={filtered.length}
            onRandom={randomise}
          />
        </>
      ) : null}

      {mode === "compare" ? (
        <StyleComparisonList comparisons={comparisons} onSpeak={speak} />
      ) : null}

      {mode === "browse" ? (
        <div className="ss-browse">
          {spotlightItem ? (
            <div className="ss-spotlight">
              <div className="ss-spotlight-head">
                <span className="ss-spotlight-label">Random expression</span>
                <button
                  type="button"
                  className="ss-btn ss-btn--link"
                  onClick={() => setSpotlight(null)}
                >
                  Clear
                </button>
              </div>
              <StyleCard item={spotlightItem} onSpeak={speak} />
            </div>
          ) : null}

          {filtered.length === 0 ? (
            <p className="ss-empty">
              Nothing matches those filters. Try clearing the search, or turning
              the rough and anime toggles back on.
            </p>
          ) : (
            <>
              <div className="ss-grid">
                {filtered.slice(0, shown).map((item) => (
                  <StyleCard key={item.id} item={item} onSpeak={speak} />
                ))}
              </div>
              {shown < filtered.length ? (
                <button
                  type="button"
                  className="ss-btn ss-more"
                  onClick={() => setShown((value) => value + PAGE)}
                >
                  Show more ({filtered.length - shown} left)
                </button>
              ) : null}
            </>
          )}
        </div>
      ) : null}

      {mode === "shifts" ? <StyleRegisterShifts /> : null}

      {mode === "quiz" ? <StyleQuiz pool={filtered} onSpeak={speak} /> : null}
    </div>
  );
}
