import { useEffect, useRef, useState } from "react";
import { autoModeTiming } from "../../../config/autoModeTiming";
import type { EverydayProgressApi } from "../useEverydayProgress";
import type { EverydaySpeech } from "../useEverydaySpeech";
import type { EverydayCategory, EverydayWord } from "../types";
import { PlaybackControls } from "./PlaybackControls";
import { WordCard } from "./WordCard";
import { IconChevronLeft, IconChevronRight, IconPlay, IconStop } from "./icons";

const SWIPE_PX = 45;

/**
 * Explore mode: one card at a time, tap or swipe through a location.
 * Auto-play is the hands-free loop — picture, Japanese, pause, English,
 * pause, next card — using the same pauses as the player's Auto Mode.
 */
export function ExploreDeck({
  category,
  words,
  initialWordId,
  progressApi,
  speech,
}: {
  category: EverydayCategory;
  words: readonly EverydayWord[];
  initialWordId: string | null;
  progressApi: EverydayProgressApi;
  speech: EverydaySpeech;
}) {
  const { progress, toggleKnown, toggleFavorite, markExplored, setResume, updatePrefs } = progressApi;
  const { order, imageOnly, picturesOnly } = progress.prefs;
  const [index, setIndex] = useState(() => Math.max(0, words.findIndex((w) => w.id === initialWordId)));
  const [revealed, setRevealed] = useState(false);
  const [autoPlaying, setAutoPlaying] = useState(false);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  const safeIndex = Math.min(index, Math.max(0, words.length - 1));
  const word = words[safeIndex];
  const hidden = imageOnly && !revealed && word?.picture !== null;

  // Opening a card counts as exploring it, and is where the page resumes.
  useEffect(() => {
    if (!word) return;
    markExplored(word.id);
    setResume(category.id, word.id);
  }, [word, category.id, markExplored, setResume]);

  const stopAuto = () => {
    speech.stop();
    setAutoPlaying(false);
  };

  const go = (delta: number) => {
    if (words.length === 0) return;
    stopAuto();
    setRevealed(false);
    setIndex((i) => (Math.min(i, words.length - 1) + delta + words.length) % words.length);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const startAuto = () => {
    if (words.length === 0) return;
    const session = speech.newSession();
    setAutoPlaying(true);
    const step = (i: number) => {
      if (!speech.isCurrent(session)) return;
      const item = words[i];
      if (!item) {
        setAutoPlaying(false);
        return;
      }
      setIndex(i);
      setRevealed(false);
      // 1. the picture on its own for a moment, 2–5. the words as spoken, 6. next.
      const look = imageOnly && item.picture ? autoModeTiming.readHookMs : autoModeTiming.shortPause;
      speech.wait(look, session, () => {
        setRevealed(true);
        speech.playSequence(
          item,
          order,
          () => {
            if (i + 1 >= words.length) {
              setAutoPlaying(false);
              return;
            }
            speech.wait(autoModeTiming.betweenItemsPause, session, () => step(i + 1));
          },
          session,
        );
      });
    };
    step(safeIndex);
  };

  if (!word) {
    return (
      <div className="ev-empty">
        <p>No picture cards in {category.english} yet.</p>
        <button type="button" className="ev-btn" onClick={() => updatePrefs({ picturesOnly: false })}>
          Show all words
        </button>
      </div>
    );
  }

  const exploredHere = words.filter((w) => progress.practiced.includes(w.id)).length;

  return (
    <div className="ev-deck">
      <div className="ev-deck-bar">
        <span className="ev-counter">
          {safeIndex + 1} / {words.length}
        </span>
        <span className="ev-progress-text">
          {exploredHere} explored · {words.filter((w) => progress.known.includes(w.id)).length} learned
        </span>
      </div>
      <div className="ev-bar" aria-hidden="true">
        <span style={{ width: `${((safeIndex + 1) / words.length) * 100}%` }} />
      </div>

      <div
        className="ev-swipe"
        onPointerDown={(e) => {
          swipeStart.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={(e) => {
          const start = swipeStart.current;
          swipeStart.current = null;
          if (!start) return;
          const dx = e.clientX - start.x;
          if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(e.clientY - start.y)) go(dx < 0 ? 1 : -1);
        }}
      >
        <WordCard
          key={word.id}
          word={word}
          hidden={hidden}
          onReveal={() => {
            setRevealed(true);
            speech.say(word, "ja");
          }}
          activeLang={speech.activeLang}
          onSay={(lang) => {
            setAutoPlaying(false);
            speech.say(word, lang);
          }}
          known={progress.known.includes(word.id)}
          favorite={progress.favorites.includes(word.id)}
          onToggleKnown={() => toggleKnown(word.id)}
          onToggleFavorite={() => toggleFavorite(word.id)}
        />
      </div>

      <div className="ev-nav">
        <button type="button" className="ev-navbtn" onClick={() => go(-1)} aria-label="Previous word">
          <IconChevronLeft />
        </button>
        <button
          type="button"
          className="ev-btn ev-btn--primary"
          onClick={() => {
            setAutoPlaying(false);
            setRevealed(true);
            speech.playSequence(word, order);
          }}
        >
          <IconPlay /> Play
        </button>
        <button
          type="button"
          className={`ev-btn${autoPlaying ? " ev-btn--on" : ""}`}
          aria-pressed={autoPlaying}
          onClick={() => (autoPlaying ? stopAuto() : startAuto())}
        >
          {autoPlaying ? <IconStop /> : <IconPlay />} {autoPlaying ? "Stop" : "Auto-play"}
        </button>
        <button type="button" className="ev-navbtn" onClick={() => go(1)} aria-label="Next word">
          <IconChevronRight />
        </button>
      </div>

      <PlaybackControls
        order={order}
        onOrder={(o) => updatePrefs({ order: o })}
        rateMode={speech.rateMode}
        onRateMode={(m) => {
          stopAuto();
          speech.setRateMode(m);
        }}
      />

      <div className="ev-switches">
        <label className="ev-switch">
          <input
            type="checkbox"
            checked={imageOnly}
            onChange={(e) => {
              setRevealed(false);
              updatePrefs({ imageOnly: e.target.checked });
            }}
          />
          Picture first (hide the words)
        </label>
        <label className="ev-switch">
          <input
            type="checkbox"
            checked={picturesOnly}
            onChange={(e) => {
              stopAuto();
              setIndex(0);
              updatePrefs({ picturesOnly: e.target.checked });
            }}
          />
          Picture cards only
        </label>
      </div>
    </div>
  );
}
