import { lazy, Suspense, useEffect, useState } from "react";
import { speechService } from "./services/speechService";
import TalkingHead from "./components/TalkingHead/TalkingHead";
import HeadStyleButtons from "./components/TalkingHead/HeadStyleButtons";
import { StageAmbience } from "./components/StageAmbience/StageAmbience";
import { AmbiencePan } from "./components/StageAmbience/AmbiencePan";
import { useAmbienceSetting } from "./components/StageAmbience/useAmbienceSetting";
import type { AmbienceTheme } from "./components/StageAmbience/themes";
import type { OpenTrainer, TrainerView } from "./navigation";

/**
 * Trainers are lazy so that opening the app does not download every corpus at
 * once. Each import() below becomes its own chunk, and only the selected
 * trainer is mounted — inactive ones are unloaded rather than hidden by CSS.
 */
const PlayerPage = lazy(() =>
  // Named export, so map it onto the default shape lazy() expects.
  import("./pages/PlayerPage").then((m) => ({ default: m.PlayerPage }))
);
const KonbiniTrainer = lazy(
  () => import("./pages/KonbiniTrainer/KonbiniTrainer")
);
const TripTrainer = lazy(() => import("./pages/TripTrainer/TripTrainer"));
const RelationTrainer = lazy(
  () => import("./pages/RelationTrainer/RelationTrainer")
);
const PhoneTrainer = lazy(() => import("./pages/PhoneTrainer/PhoneTrainer"));
const StyleTrainer = lazy(() => import("./pages/StyleTrainer/StyleTrainer"));
const GameMode = lazy(() => import("./pages/GameMode/GameMode"));
const ShortsStudio = lazy(() => import("./pages/Shorts/ShortsStudio"));
const EverydayTrainer = lazy(
  () => import("./pages/EverydayTrainer/EverydayTrainer")
);

type AppView = TrainerView | "game" | "shorts" | "everyday";

/** `?view=shorts` / `?view=everyday` open that page directly (handy as a bookmark). */
function initialView(): AppView {
  try {
    const v = new URLSearchParams(globalThis.location?.search ?? "").get("view");
    if (v === "shorts" || v === "everyday") return v;
    return "player";
  } catch {
    return "player";
  }
}

const VIEW_COMPONENTS: Record<TrainerView, React.ComponentType> = {
  player: PlayerPage,
  konbini: KonbiniTrainer,
  trip: TripTrainer,
  relations: RelationTrainer,
  phone: PhoneTrainer,
  style: StyleTrainer,
};

/**
 * The Player, Shorts and Everyday pick a theme per item / location
 * themselves; every other mode has one fixed theme.
 */
type OwnAmbienceView = "player" | "shorts" | "everyday";
const VIEW_AMBIENCE: Record<Exclude<AppView, OwnAmbienceView>, AmbienceTheme> = {
  game: "torii",
  konbini: "konbini",
  trip: "shinkansen",
  relations: "karesansui",
  phone: "machiya",
  style: "washitsu",
};

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT" ||
    target.isContentEditable
  );
}

function TrainerFallback() {
  return <div className="app-loading">読み込み中…</div>;
}

export default function App() {
  const [view, setView] = useState<AppView>(initialView);
  const ActiveTrainer =
    view === "game" || view === "shorts" || view === "everyday"
      ? null
      : VIEW_COMPONENTS[view];
  const [showAmbience, toggleAmbience] = useAmbienceSetting();
  const ambienceTheme =
    view !== "player" && view !== "shorts" && view !== "everyday" && showAmbience
      ? VIEW_AMBIENCE[view]
      : null;

  // Switching views now unmounts the previous trainer, which would otherwise
  // leave its audio playing with no controls left on screen to stop it.
  useEffect(() => {
    return () => speechService.stop();
  }, [view]);

  // The Player handles H itself (next to its 背景 button).
  useEffect(() => {
    if (view === "player") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "h" && event.key !== "H") return;
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      event.preventDefault();
      toggleAmbience();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [view, toggleAmbience]);

  const openTrainer: OpenTrainer = (target) => {
    setView(target ?? "player");
  };

  return (
    <div
      className={[
        "app-shell",
        view === "player" ? "" : "app-shell--scroll",
        ambienceTheme ? "app-shell--amb" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {view !== "player" ? (
        <div className="app-amb" aria-hidden="true">
          <StageAmbience theme={ambienceTheme} panButtons={false} />
        </div>
      ) : null}
      {view !== "player" && ambienceTheme ? <AmbiencePan fixed /> : null}
      <nav className="app-nav" aria-label="App views">
        <button
          type="button"
          className={
            view === "player"
              ? "app-nav-btn app-nav-btn--active"
              : "app-nav-btn"
          }
          title="Player — プレイヤー"
          onClick={() => setView("player")}
        >
          <span className="app-nav-en">Player</span>
          <span className="app-nav-jp" lang="ja">
            プレイヤー
          </span>
        </button>
        <button
          type="button"
          className={
            view === "game"
              ? "app-nav-btn app-nav-btn--active"
              : "app-nav-btn"
          }
          title="ペラペラクエスト — Pera Pera Quest"
          onClick={() => setView("game")}
        >
          <span className="app-nav-en">Pera Pera Quest</span>
          <span className="app-nav-jp" lang="ja">
            ペラペラ
          </span>
        </button>
        <button
          type="button"
          className={
            view === "konbini"
              ? "app-nav-btn app-nav-btn--active"
              : "app-nav-btn"
          }
          title="Konbini Trainer — コンビニ"
          onClick={() => setView("konbini")}
        >
          <span className="app-nav-en">Konbini</span>
          <span className="app-nav-jp" lang="ja">
            コンビニ
          </span>
        </button>
        <button
          type="button"
          className={
            view === "trip" ? "app-nav-btn app-nav-btn--active" : "app-nav-btn"
          }
          title="Trip Trainer — 旅"
          onClick={() => setView("trip")}
        >
          <span className="app-nav-en">Trip</span>
          <span className="app-nav-jp" lang="ja">
            旅
          </span>
        </button>
        <button
          type="button"
          className={
            view === "everyday"
              ? "app-nav-btn app-nav-btn--active"
              : "app-nav-btn"
          }
          title="Everyday Japanese — 身の回りの日本語"
          onClick={() => setView("everyday")}
        >
          <span className="app-nav-en">Everyday</span>
          <span className="app-nav-jp" lang="ja">
            身の回り
          </span>
        </button>
        <button
          type="button"
          className={
            view === "relations"
              ? "app-nav-btn app-nav-btn--active"
              : "app-nav-btn"
          }
          title="Synonyms & Antonyms — 類義語・反対語"
          onClick={() => setView("relations")}
        >
          <span className="app-nav-en">Synonyms</span>
          <span className="app-nav-jp" lang="ja">
            類義
          </span>
        </button>
        <button
          type="button"
          className={
            view === "phone"
              ? "app-nav-btn app-nav-btn--active"
              : "app-nav-btn"
          }
          title="Phone Conversation Scripts — 電話会話"
          onClick={() => setView("phone")}
        >
          <span className="app-nav-en">Phone</span>
          <span className="app-nav-jp" lang="ja">
            電話
          </span>
        </button>
        <button
          type="button"
          className={
            view === "style"
              ? "app-nav-btn app-nav-btn--active"
              : "app-nav-btn"
          }
          title="Masculine, Feminine & Neutral Japanese — 話し方"
          onClick={() => setView("style")}
        >
          <span className="app-nav-en">Speech</span>
          <span className="app-nav-jp" lang="ja">
            話し方
          </span>
        </button>
        <button
          type="button"
          className={
            view === "shorts"
              ? "app-nav-btn app-nav-btn--active"
              : "app-nav-btn"
          }
          title="Shorts — one word per vertical video"
          onClick={() => setView("shorts")}
        >
          <span className="app-nav-en">Shorts</span>
          <span className="app-nav-jp" lang="ja">
            ショート
          </span>
        </button>
        {view === "shorts" ? (
          <span className="app-nav-heads">
            <HeadStyleButtons />
          </span>
        ) : null}
      </nav>

      <div
        className={
          view === "player" ? "app-view" : "app-view app-view--scroll"
        }
      >
        <Suspense fallback={<TrainerFallback />}>
          {view === "game" ? (
            <GameMode onOpenTrainer={openTrainer} />
          ) : view === "shorts" ? (
            <ShortsStudio />
          ) : view === "everyday" ? (
            <EverydayTrainer />
          ) : ActiveTrainer ? (
            <ActiveTrainer />
          ) : null}
        </Suspense>
      </div>

      {/* Mounted once at the shell: it listens to the global speech bus, so it
          animates for every view without each page wiring it up. */}
      <TalkingHead />
    </div>
  );
}
