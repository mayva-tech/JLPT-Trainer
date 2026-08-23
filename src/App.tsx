import { useState } from "react";
import { PlayerPage } from "./pages/PlayerPage";
import KonbiniTrainer from "./pages/KonbiniTrainer/KonbiniTrainer";
import TripTrainer from "./pages/TripTrainer/TripTrainer";
import RelationTrainer from "./pages/RelationTrainer/RelationTrainer";
import PhoneTrainer from "./pages/PhoneTrainer/PhoneTrainer";
import StyleTrainer from "./pages/StyleTrainer/StyleTrainer";

type AppView =
  | "player"
  | "konbini"
  | "trip"
  | "relations"
  | "phone"
  | "style";

export default function App() {
  const [view, setView] = useState<AppView>("player");

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
      <div
        className={
          view === "trip"
            ? "app-view app-view--scroll"
            : "app-view app-view--hidden"
        }
      >
        <TripTrainer />
      </div>
      <div
        className={
          view === "relations"
            ? "app-view app-view--scroll"
            : "app-view app-view--hidden"
        }
      >
        <RelationTrainer />
      </div>
      <div
        className={
          view === "phone"
            ? "app-view app-view--scroll"
            : "app-view app-view--hidden"
        }
      >
        <PhoneTrainer />
      </div>
      <div
        className={
          view === "style"
            ? "app-view app-view--scroll"
            : "app-view app-view--hidden"
        }
      >
        <StyleTrainer />
      </div>
    </div>
  );
}
