import { lazy, Suspense, useEffect, useState } from "react";
import { speechService } from "./services/speechService";
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

type AppView = TrainerView | "game";

const VIEW_COMPONENTS: Record<TrainerView, React.ComponentType> = {
  player: PlayerPage,
  konbini: KonbiniTrainer,
  trip: TripTrainer,
  relations: RelationTrainer,
  phone: PhoneTrainer,
  style: StyleTrainer,
};

function TrainerFallback() {
  return <div className="app-loading">読み込み中…</div>;
}

export default function App() {
  const [view, setView] = useState<AppView>("player");
  const ActiveTrainer = view === "game" ? null : VIEW_COMPONENTS[view];

  // Switching views now unmounts the previous trainer, which would otherwise
  // leave its audio playing with no controls left on screen to stop it.
  useEffect(() => {
    return () => speechService.stop();
  }, [view]);

  const openTrainer: OpenTrainer = (target) => {
    setView(target ?? "player");
  };

  return (
    <div
      className={
        view === "player" ? "app-shell" : "app-shell app-shell--scroll"
      }
    >
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
      </nav>

      <div
        className={
          view === "player" ? "app-view" : "app-view app-view--scroll"
        }
      >
        <Suspense fallback={<TrainerFallback />}>
          {view === "game" ? (
            <GameMode onOpenTrainer={openTrainer} />
          ) : ActiveTrainer ? (
            <ActiveTrainer />
          ) : null}
        </Suspense>
      </div>
    </div>
  );
}
