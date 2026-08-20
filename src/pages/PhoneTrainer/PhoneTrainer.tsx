import { useCallback, useMemo, useState } from "react";
import "./phone-trainer.css";
import { phoneScenarios } from "../../data/phoneCalls";
import { useJapaneseVoice } from "../../lib/japanese/useJapaneseVoice";
import { useProgress } from "../../lib/japanese/useProgress";
import {
  filterPhoneScenarios,
  getPhoneCategory,
  getPhoneScenarioById,
  phoneLineTotal,
  phoneScenarioTotal,
  phoneStats,
  phoneStatus,
  pickRandomScenario,
  type PhoneCategoryFilter,
  type PhoneLevelFilter,
} from "../../utils/phoneCalls";
import {
  PhoneFilters,
  PhoneLevelBadge,
  PhoneStats,
} from "./components/PhoneControls";
import { PhoneRolePlay } from "./components/PhoneRolePlay";
import { PhoneScenarioList } from "./components/PhoneScenarioList";
import { PhoneStudy, KaraokeJapanese, KaraokeEnglish } from "./components/PhoneStudy";
import type { IntroPhase } from "./components/PhoneStudy";
import type { SpeechHighlight } from "../../services/speechService";

/** Two keys, both on the shared progress hook: status, and favourites. */
const STORAGE_KEY = "jlpt-trainer:phone:v1";
const FAVOURITES_KEY = "jlpt-trainer:phone-favourites:v1";

type Mode = "study" | "roleplay";

export default function PhoneTrainer() {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<PhoneLevelFilter>("all");
  const [category, setCategory] = useState<PhoneCategoryFilter>("all");
  const [favouritesOnly, setFavouritesOnly] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("study");
  const [introPhase, setIntroPhase] = useState<IntroPhase>(null);
  const [introHL, setIntroHL] = useState<SpeechHighlight | null>(null);

  const handleIntroState = useCallback((phase: IntroPhase, hl: SpeechHighlight | null) => {
    setIntroPhase(phase);
    setIntroHL(hl);
  }, []);

  const { progress, toggle } = useProgress(STORAGE_KEY);
  const favourites = useProgress(FAVOURITES_KEY);
  const voice = useJapaneseVoice();

  const speak = useCallback(
    (text: string) => {
      if (text) voice.speak(text);
    },
    [voice]
  );

  const favouriteIds = favourites.progress.known;

  const listed = useMemo(() => {
    const filtered = filterPhoneScenarios(phoneScenarios, {
      search,
      level,
      category,
    });
    return favouritesOnly
      ? filtered.filter((scenario) => favouriteIds.includes(scenario.id))
      : filtered;
  }, [search, level, category, favouritesOnly, favouriteIds]);

  const stats = useMemo(
    () => phoneStats(listed, progress, favouriteIds),
    [listed, progress, favouriteIds]
  );

  const statusOf = useCallback(
    (id: string) => phoneStatus(id, progress),
    [progress]
  );

  const isFavourite = useCallback(
    (id: string) => favouriteIds.includes(id),
    [favouriteIds]
  );

  const toggleFavourite = useCallback(
    (id: string) => favourites.toggle("known", id),
    [favourites]
  );

  const openRandom = useCallback(() => {
    const picked = pickRandomScenario(listed);
    if (picked) {
      setOpenId(picked.id);
      setMode("study");
    }
  }, [listed]);

  const open = openId ? getPhoneScenarioById(openId) : undefined;

  if (open) {
    const status = statusOf(open.id);
    const openCategory = getPhoneCategory(open.category);

    return (
      <div className="pt-root">
        <button
          type="button"
          className="pt-back"
          onClick={() => setOpenId(null)}
        >
          ← All scenarios
        </button>

        <header className="pt-detail-head">
          <div className="pt-detail-meta">
            <PhoneLevelBadge level={open.jlptLevel} />
            <span className="pt-list-category" lang="ja">
              {openCategory?.japanese} · {openCategory?.english}
            </span>
            <button
              type="button"
              className="pt-fav"
              aria-pressed={isFavourite(open.id)}
              aria-label="Toggle favourite"
              onClick={() => toggleFavourite(open.id)}
            >
              {isFavourite(open.id) ? "★" : "☆"}
            </button>
          </div>
          <h2 className={`pt-detail-title${introPhase === "title" ? " pt-speaking" : ""}`} lang="ja">
            {introPhase === "title" && introHL ? (
              <KaraokeJapanese text={open.title} highlight={introHL} />
            ) : (
              open.title
            )}
          </h2>
          <p className={`pt-detail-title-en${introPhase === "titleEn" ? " pt-speaking" : ""}`}>
            {introPhase === "titleEn" && introHL ? (
              <KaraokeEnglish text={open.titleEn} highlight={introHL} />
            ) : (
              open.titleEn
            )}
          </p>
          <p className={`pt-detail-situation${introPhase === "situation" ? " pt-speaking" : ""}`}>
            {introPhase === "situation" && introHL ? (
              <KaraokeEnglish text={open.situation} highlight={introHL} />
            ) : (
              open.situation
            )}
          </p>
          <p className="pt-detail-roles">
            <span lang="ja">A: {open.roleA}</span>
            <span lang="ja">B: {open.roleB}</span>
          </p>
        </header>

        <nav className="pt-modes" aria-label="Mode">
          <button
            type="button"
            className="pt-mode"
            aria-pressed={mode === "study"}
            onClick={() => setMode("study")}
          >
            Study
          </button>
          <button
            type="button"
            className="pt-mode"
            aria-pressed={mode === "roleplay"}
            onClick={() => setMode("roleplay")}
          >
            Role-play
          </button>
        </nav>

        {mode === "study" ? (
          <PhoneStudy scenario={open} onSpeak={speak} onIntroState={handleIntroState} />
        ) : (
          <PhoneRolePlay
            scenario={open}
            onSpeak={speak}
            onFinish={() => {
              if (status === "new") toggle("practiced", open.id);
            }}
          />
        )}

        <div className="pt-mark">
          <button
            type="button"
            className="pt-btn pt-btn--ghost"
            aria-pressed={status === "practised"}
            onClick={() => toggle("practiced", open.id)}
          >
            Practised
          </button>
          <button
            type="button"
            className="pt-btn pt-btn--ghost"
            aria-pressed={status === "mastered"}
            onClick={() => toggle("known", open.id)}
          >
            Mastered
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-root">
      <header className="pt-header">
        <h1 className="pt-title">Phone Conversation Scripts</h1>
        <p className="pt-title-jp" lang="ja">
          電話会話
        </p>
        <p className="pt-subtitle">
          Real phone calls in Japanese, from a wrong number at N5 to an apology
          to a client at N2. Every line comes with its kana reading, an English
          translation, the key phrases and notes on how polite it sounds.
        </p>
        <p className="pt-headline-stats">
          <span>{phoneScenarioTotal} scenarios</span>
          <span>{phoneLineTotal} lines</span>
          <span>N5 → N2</span>
          <span>Study · Role-play</span>
        </p>
      </header>

      <PhoneStats stats={stats} />

      <PhoneFilters
        search={search}
        onSearch={setSearch}
        level={level}
        onLevel={setLevel}
        category={category}
        onCategory={setCategory}
        favouritesOnly={favouritesOnly}
        onFavouritesOnly={setFavouritesOnly}
        total={listed.length}
        onRandom={openRandom}
      />

      <PhoneScenarioList
        scenarios={listed}
        statusOf={statusOf}
        isFavourite={isFavourite}
        onOpen={(id) => {
          setOpenId(id);
          setMode("study");
        }}
        onToggleFavourite={toggleFavourite}
      />
    </div>
  );
}
