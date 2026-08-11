import { useState } from "react";
import { PlayerPage } from "./pages/PlayerPage";
import KonbiniTrainer from "./pages/KonbiniTrainer/KonbiniTrainer";

type AppView = "player" | "konbini";

export default function App() {
  const [view, setView] = useState<AppView>("player");

  return (
    <div
      className={
        view === "konbini" ? "app-shell app-shell--scroll" : "app-shell"
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
      </nav>

      <div
        className={
          view === "player" ? "app-view" : "app-view app-view--hidden"
        }
      >
        <PlayerPage />
      </div>
      <div
        className={
          view === "konbini"
            ? "app-view app-view--scroll"
            : "app-view app-view--hidden"
        }
      >
        <KonbiniTrainer />
      </div>
    </div>
  );
}
