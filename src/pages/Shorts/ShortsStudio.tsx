import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { vocabulary } from "../../data/vocabulary";
import {
  PLAYLIST_LEVEL_INFO,
  getPlaylistWordRange,
  playlistLessonsForLevel,
} from "../../data/playlists";
import { JLPT_LEVELS } from "../../utils/wordLevel";
import type { JlptLevel } from "../../types/level";
import type { VocabularyItem } from "../../types/vocabulary";
import { useAmbienceSetting } from "../../components/StageAmbience/useAmbienceSetting";
import { ShortStage } from "./ShortStage";
import { buildShortScript, estimateShortSeconds } from "./shortScript";
import { buildShortMeta, firstSense } from "./shortsMeta";
import { useShortPlayer } from "./useShortPlayer";
import "./shorts.css";

/**
 * Shorts studio — one JLPT word per vertical Short.
 *
 * Pick a level → lesson → word, press Space, and the Short plays itself.
 * F shows the stage alone for OBS; R shows it rotated 90° so a 1920×1080
 * screen carries a pixel-sharp 1080×1920 frame (rotate it back in OBS).
 * Auto-next plays the whole lesson with a short black gap between Shorts.
 */

const STORE_KEY = "jlpt-trainer:shorts:v1";
const BLACKOUT_MS = 1200;

type CleanMode = "off" | "fit" | "rotated";

interface Settings {
  level: JlptLevel;
  lessonId: string;
  index: number;
  seriesLabel: string;
  pan: boolean;
  autoNext: boolean;
  safeZones: boolean;
}

const DEFAULTS: Settings = {
  level: "N5",
  lessonId: "",
  index: 0,
  seriesLabel: "Japanese word of the day",
  pan: true,
  autoNext: false,
  safeZones: true,
};

function loadSettings(): Settings {
  try {
    const raw = globalThis.localStorage?.getItem(STORE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    return DEFAULTS;
  }
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT" ||
    target.isContentEditable
  );
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

const BY_ID = new Map(vocabulary.map((v) => [v.id, v]));

export default function ShortsStudio() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [clean, setClean] = useState<CleanMode>("off");
  const [blackout, setBlackout] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [showAmbience] = useAmbienceSetting();
  const pendingPlay = useRef(false);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  useEffect(() => {
    try {
      globalThis.localStorage?.setItem(STORE_KEY, JSON.stringify(settings));
    } catch {
      // private mode / quota
    }
  }, [settings]);

  const lessons = useMemo(() => playlistLessonsForLevel(settings.level), [settings.level]);
  const lesson = lessons.find((l) => l.id === settings.lessonId) ?? lessons[0];
  const words: VocabularyItem[] = useMemo(
    () =>
      (lesson?.vocabularyIds ?? [])
        .map((id) => BY_ID.get(id))
        .filter((v): v is VocabularyItem => Boolean(v)),
    [lesson]
  );
  const index = Math.min(settings.index, Math.max(0, words.length - 1));
  const item = words[index];
  const next = words[index + 1] ?? null;
  const range = lesson ? getPlaylistWordRange(lesson.id) : null;
  const wordNumber = (range?.firstWordNumber ?? 1) + index;

  const steps = useMemo(() => (item ? buildShortScript(item) : []), [item]);
  const panSeconds = useMemo(() => (item ? estimateShortSeconds(item) : 30), [item]);

  const onDone = useCallback(() => {
    if (!settings.autoNext || index >= words.length - 1) return;
    setBlackout(true);
    window.setTimeout(() => {
      pendingPlay.current = true;
      update({ index: index + 1 });
      setBlackout(false);
    }, BLACKOUT_MS);
  }, [settings.autoNext, index, words.length, update]);

  const player = useShortPlayer(steps, onDone);
  const { play, stop } = player;

  // Auto-next: start the next Short once its script is in place.
  useEffect(() => {
    if (!pendingPlay.current) return;
    pendingPlay.current = false;
    play();
  }, [item, play]);

  const go = useCallback(
    (delta: number) => {
      stop();
      setBlackout(false);
      const nextIndex = Math.max(0, Math.min(words.length - 1, index + delta));
      update({ index: nextIndex });
    },
    [stop, words.length, index, update]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const key = event.key;
      if (key === " ") {
        event.preventDefault();
        if (!event.repeat) play();
      } else if (key === "s" || key === "S") {
        event.preventDefault();
        stop();
      } else if (key === "ArrowRight") {
        event.preventDefault();
        go(1);
      } else if (key === "ArrowLeft") {
        event.preventDefault();
        go(-1);
      } else if (key === "f" || key === "F") {
        event.preventDefault();
        setClean((c) => (c === "fit" ? "off" : "fit"));
      } else if (key === "r" || key === "R") {
        event.preventDefault();
        setClean((c) => (c === "rotated" ? "off" : "rotated"));
      } else if (key === "Escape") {
        setClean("off");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [play, stop, go]);

  const meta = useMemo(
    () =>
      item && lesson && range
        ? buildShortMeta(item, {
            level: settings.level,
            wordNumber,
            lessonNumber: range.lessonNumber,
            lessonTheme: lesson.subtitle,
          })
        : null,
    [item, lesson, range, settings.level, wordNumber]
  );

  const copy = async (label: string, text: string) => {
    const ok = await copyText(text);
    setCopied(ok ? label : `${label} (copy failed — select and copy manually)`);
    window.setTimeout(() => setCopied(null), 1800);
  };

  if (!item || !lesson) {
    return <div className="sh-studio sh-empty">No words found for this level.</div>;
  }

  const stage = (
    <ShortStage
      item={item}
      level={settings.level}
      wordNumber={wordNumber}
      seriesLabel={settings.seriesLabel}
      phase={player.phase}
      cue={player.cue}
      highlight={player.highlight}
      activeLang={player.activeLang}
      next={next}
      ambience={showAmbience}
      pan={settings.pan}
      panSeconds={panSeconds}
      showSafeZones={clean === "off" && settings.safeZones}
      blackout={blackout}
    />
  );

  if (clean !== "off") {
    return (
      <div className={`sh-clean sh-clean--${clean}`} onDoubleClick={() => setClean("off")}>
        <div className="sh-clean-stage">{stage}</div>
      </div>
    );
  }

  return (
    <div
      className="sh-studio"
      onClick={(e) => {
        // Clicked buttons and checkboxes give focus back, so Space / arrows
        // always reach the studio (Space would otherwise re-press the button
        // or untick the checkbox). Text fields keep focus for typing.
        const el = e.target as HTMLElement;
        const control = el.closest("button, input[type='checkbox'], label");
        if (control && !el.closest("input[type='text'], textarea, select")) {
          (document.activeElement as HTMLElement | null)?.blur?.();
        }
      }}
    >
      <aside className="sh-panel">
        <h2 className="sh-panel-title">
          Shorts <span lang="ja">ショート</span>
        </h2>

        <div className="sh-levels" role="group" aria-label="Level">
          {JLPT_LEVELS.map((lv) => (
            <button
              key={lv}
              type="button"
              className={lv === settings.level ? "sh-btn sh-btn--on" : "sh-btn"}
              title={PLAYLIST_LEVEL_INFO[lv].name}
              onClick={() => {
                stop();
                update({ level: lv, lessonId: "", index: 0 });
              }}
            >
              {lv}
            </button>
          ))}
        </div>

        <label className="sh-field">
          <span>Lesson</span>
          <select
            value={lesson.id}
            onChange={(e) => {
              stop();
              update({ lessonId: e.target.value, index: 0 });
              e.target.blur();
            }}
          >
            {lessons.map((l, i) => (
              <option key={l.id} value={l.id}>
                {`#${i + 1} · ${l.subtitle}`}
              </option>
            ))}
          </select>
        </label>

        <ol className="sh-words">
          {words.map((w, i) => (
            <li key={w.id}>
              <button
                type="button"
                className={i === index ? "sh-word-btn sh-word-btn--on" : "sh-word-btn"}
                onClick={() => {
                  stop();
                  setBlackout(false);
                  update({ index: i });
                }}
              >
                <span className="sh-word-btn-ja" lang="ja">
                  {w.word}
                </span>
                <span className="sh-word-btn-en">{firstSense(w.meaning)}</span>
              </button>
            </li>
          ))}
        </ol>

        <div className="sh-actions">
          <button type="button" className="sh-btn sh-btn--primary" onClick={play}>
            {player.phase === "done" ? "↻ Replay" : "▶ Play"} <kbd>Space</kbd>
          </button>
          <button type="button" className="sh-btn" onClick={stop}>
            ■ Stop <kbd>S</kbd>
          </button>
          <button type="button" className="sh-btn" onClick={() => setClean("fit")}>
            ⛶ Clean <kbd>F</kbd>
          </button>
          <button type="button" className="sh-btn" onClick={() => setClean("rotated")}>
            ⟲ Rotated <kbd>R</kbd>
          </button>
        </div>

        <fieldset className="sh-options">
          <label>
            <input type="checkbox" checked={settings.pan} onChange={(e) => update({ pan: e.target.checked })} />
            Camera pan across the backdrop
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.autoNext}
              onChange={(e) => update({ autoNext: e.target.checked })}
            />
            Auto-next (whole lesson, black gap between Shorts)
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.safeZones}
              onChange={(e) => update({ safeZones: e.target.checked })}
            />
            Show YouTube safe zones (preview only)
          </label>
          <label className="sh-field">
            <span>Series label</span>
            <input
              type="text"
              value={settings.seriesLabel}
              maxLength={40}
              onChange={(e) => update({ seriesLabel: e.target.value })}
            />
          </label>
        </fieldset>

        {meta && (
          <section className="sh-meta" aria-label="Upload text">
            <h3>Upload text</h3>
            {(
              [
                ["Title", meta.title],
                ["Description", meta.description],
                ["Pinned comment", meta.pinnedComment],
              ] as const
            ).map(([label, text]) => (
              <div key={label} className="sh-meta-row">
                <div className="sh-meta-head">
                  <span>{label}</span>
                  {label === "Title" && <span className="sh-meta-count">{[...text].length}/100</span>}
                  <button type="button" className="sh-btn sh-btn--small" onClick={() => copy(label, text)}>
                    Copy
                  </button>
                </div>
                <textarea readOnly value={text} rows={label === "Description" ? 9 : 2} />
              </div>
            ))}
            {copied && <div className="sh-copied">{copied}</div>}
          </section>
        )}
        <p className="sh-hint">
          ← → word · Space play · S stop · F clean · R rotated · Esc exit · H backdrop on/off · ~{panSeconds}s
        </p>
      </aside>

      <main className="sh-preview-wrap">
        <div className="sh-preview">{stage}</div>
      </main>
    </div>
  );
}
