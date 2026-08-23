import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./style-trainer.css";
import { registerShifts } from "../../data/registerShifts";
import { styleExpressions } from "../../data/speechStyles";
import {
  speechService,
  SPEECH_RATE_NORMAL,
} from "../../services/speechService";
import type { StyleExpression } from "../../types/speechStyle";
import { splitNuanceForSpeech } from "../../utils/nuanceSpeech";
import {
  buildComparisons,
  filterStyles,
  groupStylesByCategory,
  limitGroupedStyles,
  pickRandomStyle,
  styleStats,
  styleTotal,
  type CategoryFilter,
  type GenderFilter,
  type LevelFilter,
  type PolitenessFilter,
} from "../../utils/speechStyles";
import { StyleBrowseList } from "./components/StyleBrowseList";
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

function speakJpAsync(text: string, reading?: string): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return Promise.resolve();
  return new Promise((resolve) => {
    speechService.speakJapanese(
      trimmed,
      { onEnd: () => resolve(), onError: () => resolve() },
      SPEECH_RATE_NORMAL,
      reading ? { reading } : undefined
    );
  });
}

function speakEnAsync(text: string): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return Promise.resolve();
  return new Promise((resolve) => {
    speechService.speakEnglish(
      trimmed,
      { onEnd: () => resolve(), onError: () => resolve() },
      SPEECH_RATE_NORMAL
    );
  });
}

/** Speak mixed JP/EN explanation text with the matching voice per run. */
async function speakMixedAsync(
  text: string,
  cancelled?: () => boolean
): Promise<void> {
  const segments = splitNuanceForSpeech(text);
  if (segments.length === 0) return;
  for (const segment of segments) {
    if (cancelled?.()) return;
    const chunk = segment.text.trim();
    if (!chunk) continue;
    if (segment.lang === "ja") {
      await speakJpAsync(chunk);
    } else {
      await speakEnAsync(chunk);
    }
  }
}

function pause(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function playExpression(
  item: StyleExpression,
  cancelled: () => boolean,
  onActive: (id: string | null) => void
): Promise<void> {
  onActive(item.id);
  if (cancelled()) return;
  await speakJpAsync(item.japanese, item.reading);
  if (cancelled()) return;
  await pause(280);
  if (cancelled()) return;
  await speakEnAsync(item.english);
  if (cancelled()) return;
  await pause(280);
  if (item.example.japanese) {
    if (cancelled()) return;
    await speakJpAsync(item.example.japanese, item.example.reading);
    if (cancelled()) return;
    await pause(280);
  }
  if (item.example.english) {
    if (cancelled()) return;
    await speakEnAsync(item.example.english);
    if (cancelled()) return;
    await pause(280);
  }
  if (item.warning?.trim()) {
    if (cancelled()) return;
    await speakMixedAsync(item.warning, cancelled);
    if (cancelled()) return;
  }
  await pause(450);
}

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
  const [playingAll, setPlayingAll] = useState(false);
  const [activePlayId, setActivePlayId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const cancelRef = useRef(false);

  const stopPlayAll = useCallback(() => {
    cancelRef.current = true;
    speechService.stop();
    setPlayingAll(false);
    setActivePlayId(null);
  }, []);

  const selectItem = useCallback((id: string) => {
    setSelectedId((current) => (current === id ? null : id));
  }, []);

  const markPlayingCard = useCallback((id: string | null) => {
    setActivePlayId(id);
    if (id) setSelectedId(id);
  }, []);

  const speakJp = useCallback(
    (text: string, reading?: string) => {
      if (playingAll) stopPlayAll();
      const trimmed = text.trim();
      if (!trimmed) return;
      speechService.speakJapanese(
        trimmed,
        undefined,
        SPEECH_RATE_NORMAL,
        reading ? { reading } : undefined
      );
    },
    [playingAll, stopPlayAll]
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
  const groupedBrowse = useMemo(
    () => groupStylesByCategory(filtered),
    [filtered]
  );
  const visibleBrowseGroups = useMemo(
    () => limitGroupedStyles(groupedBrowse, shown),
    [groupedBrowse, shown]
  );

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

  const playAll = useCallback(() => {
    if (playingAll) {
      stopPlayAll();
      return;
    }

    cancelRef.current = false;
    setPlayingAll(true);

    const cancelled = () => cancelRef.current;

    const startFrom = <T extends { id: string }>(list: T[]): T[] => {
      if (!selectedId) return list;
      const index = list.findIndex((item) => item.id === selectedId);
      return index >= 0 ? list.slice(index) : list;
    };

    const run = async () => {
      if (mode === "shifts") {
        const shiftPlaylist = registerShifts.flatMap((shift) => [
          { id: shift.id, kind: "summary" as const, shift },
          ...shift.contexts.map((ctx) => ({
            id: `${shift.id}:${ctx.context}`,
            kind: "context" as const,
            shift,
            ctx,
          })),
        ]);
        const queue = startFrom(shiftPlaylist);
        for (const entry of queue) {
          if (cancelled()) break;
          markPlayingCard(entry.id);
          if (entry.kind === "summary") {
            await speakMixedAsync(entry.shift.summary, cancelled);
            if (cancelled()) break;
            await pause(300);
          } else {
            await speakJpAsync(entry.ctx.japanese);
            if (cancelled()) break;
            await pause(250);
            if (cancelled()) break;
            await speakMixedAsync(entry.ctx.note, cancelled);
            if (cancelled()) break;
            await pause(400);
          }
        }
      } else if (mode === "compare") {
        const playlist = comparisons.flatMap((group) => group.members);
        for (const item of startFrom(playlist)) {
          if (cancelled()) break;
          await playExpression(item, cancelled, markPlayingCard);
        }
      } else if (mode === "browse") {
        const list = filtered.slice(0, shown);
        for (const item of startFrom(list)) {
          if (cancelled()) break;
          await playExpression(item, cancelled, markPlayingCard);
        }
      }

      if (!cancelled()) {
        setPlayingAll(false);
        setActivePlayId(null);
      }
    };

    void run();
  }, [
    playingAll,
    stopPlayAll,
    mode,
    comparisons,
    filtered,
    shown,
    selectedId,
    markPlayingCard,
  ]);

  useEffect(() => {
    stopPlayAll();
    setSelectedId(null);
  }, [mode, stopPlayAll]);

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

      {mode !== "quiz" ? (
        <div className="ss-sticky-actions">
          <p className="ss-sticky-hint">
            {selectedId
              ? "Play All starts from the orange card"
              : "Tap a card, then Play All"}
          </p>
          <div className="ss-filter-actions">
            <button
              type="button"
              className={
                playingAll ? "ss-btn ss-btn--primary" : "ss-btn ss-btn--play-all"
              }
              onClick={playAll}
            >
              {playingAll ? "⏹ Stop" : "▶ Play All"}
            </button>
            {mode !== "shifts" ? (
              <button type="button" className="ss-btn" onClick={randomise}>
                Random expression
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

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
          />
        </>
      ) : null}

      {mode === "compare" ? (
        <StyleComparisonList
          comparisons={comparisons}
          onSpeakJp={speakJp}
          activePlayId={activePlayId}
          selectedId={selectedId}
          onSelect={selectItem}
          showCategoryHeaders={category === "all"}
        />
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
              <StyleCard
                item={spotlightItem}
                onSpeakJp={speakJp}
                active={activePlayId === spotlightItem.id}
                selected={selectedId === spotlightItem.id}
                onSelect={selectItem}
              />
            </div>
          ) : null}

          {filtered.length === 0 ? (
            <p className="ss-empty">
              Nothing matches those filters. Try clearing the search, or turning
              the rough and anime toggles back on.
            </p>
          ) : (
            <>
              <StyleBrowseList
                groups={visibleBrowseGroups}
                onSpeakJp={speakJp}
                activePlayId={activePlayId}
                selectedId={selectedId}
                onSelect={selectItem}
                showCategoryHeaders={category === "all"}
              />
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

      {mode === "shifts" ? (
        <StyleRegisterShifts
          onSpeakJp={speakJp}
          activePlayId={activePlayId}
          selectedId={selectedId}
          onSelect={selectItem}
        />
      ) : null}

      {mode === "quiz" ? (
        <StyleQuiz
          pool={filtered}
          onSpeakJp={speakJp}
        />
      ) : null}
    </div>
  );
}
