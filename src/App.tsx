import { lazy, Suspense, useEffect, useState } from "react";
import { speechService } from "./services/speechService";

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

type AppView =
  | "player"
  | "konbini"
  | "trip"
  | "relations"
  | "phone"
  | "style";

const VIEW_COMPONENTS: Record<AppView, React.ComponentType> = {
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
  const ActiveTrainer = VIEW_COMPONENTS[view];

  // Switching views now unmounts the previous trainer, which would otherwise
  // leave its audio playing with no controls left on screen to stop it.
  useEffect(() => {
    return () => speechService.stop();
  }, [view]);

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
          onClick={() => setView("player")}
        >
          Player
        </button>
        <button
          type="button"
          className={
            view === "konbini"
              ? "app-nav-btn app-nav-btn--active"
              : "app-nav-btn"
          }
          title="Konbini Trainer"
          onClick={() => setView("konbini")}
        >
          コンビニ
        </button>
        <button
          type="button"
          className={
            view === "trip" ? "app-nav-btn app-nav-btn--active" : "app-nav-btn"
          }
          title="Trip Trainer"
          onClick={() => setView("trip")}
        >
          旅
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
          類義
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
          電話
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
          話し方
        </button>
      </nav>

      <div
        className={
          view === "player" ? "app-view" : "app-view app-view--scroll"
        }
      >
        <Suspense fallback={<TrainerFallback />}>
          <ActiveTrainer />
        </Suspense>
      </div>
    </div>
  );
}
