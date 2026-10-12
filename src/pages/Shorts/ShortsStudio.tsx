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
import { firstSense } from "./shortsMeta";
import { SocialPostBody } from "../../components/Social/SocialPostPanel";
import { shortAngle } from "./shortAngle";
import { useShortPlayer } from "./useShortPlayer";
import { HOOK_STYLES, MESSAGE_HOOK_LABEL, usesMessage, type HookStyle } from "./shortMessage";
import { kanjiStrokesIfLoaded, loadKanjiStrokes } from "../../components/KanjiStrokes/loadStrokes";
import { hasStrokes, planStrokes, type StrokeData } from "../../components/KanjiStrokes/strokePlan";
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
  /** Stroke-order writing of the word before it is revealed. */
  brush: boolean;
  /** Opener: classic angles, Nanami's text message, or a mix by word. */
  hookStyle: HookStyle;
}

const DEFAULTS: Settings = {
  level: "N5",
  lessonId: "",
  index: 0,
  seriesLabel: "Japanese word of the day",
  pan: true,
  autoNext: false,
  safeZones: true,
  brush: true,
  hookStyle: "mix",
};

function loadSettings(): Settings {
  try {
    const raw = globalThis.localStorage?.getItem(STORE_KEY);
    if (!raw) return DEFAULTS;
    const saved = { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) };
    if (!HOOK_STYLES.some((h) => h.id === saved.hookStyle)) saved.hookStyle = DEFAULTS.hookStyle;
    return saved;
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

const BY_ID = new Map(vocabulary.map((v) => [v.id, v]));

export default function ShortsStudio() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [clean, setClean] = useState<CleanMode>("off");
  const [blackout, setBlackout] = useState(false);
  const [showAmbience] = useAmbienceSetting();
  const pendingPlay = useRef(false);
  const [strokeData, setStrokeData] = useState<StrokeData | null>(kanjiStrokesIfLoaded);
  const [runKey, setRunKey] = useState(0);

  // Load the stroke data up front so the first Short draws without a gap.
  useEffect(() => {
    if (strokeData) return;
    let alive = true;
    loadKanjiStrokes().then(
      (d) => alive && setStrokeData(d),
      () => undefined
    );
    return () => {
      alive = false;
    };
  }, [strokeData]);

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

  const brush = Boolean(settings.brush && item && strokeData && hasStrokes(item.word, strokeData));
  const drawMs = brush && item && strokeData ? planStrokes(item.word, strokeData).totalMs : 0;
  const hookStyle = settings.hookStyle;
  const steps = useMemo(() => (item ? buildShortScript(item, { drawMs, hookStyle }) : []), [item, drawMs, hookStyle]);
  const panSeconds = useMemo(
    () => (item ? estimateShortSeconds(item, { drawMs, hookStyle }) : 30),
    [item, drawMs, hookStyle]
  );

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
  const { stop } = player;
  const playShort = player.play;
  const play = useCallback(() => {
    setRunKey((k) => k + 1);
    playShort();
  }, [playShort]);

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
      brush={brush}
      runKey={runKey}
      hookStyle={hookStyle}
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
                <span className="sh-word-btn-en">
                  {firstSense(w.meaning)}
                  {usesMessage(w, hookStyle) ? (
                    <span className="sh-hook-dot sh-hook-tag--message" title={MESSAGE_HOOK_LABEL} />
                  ) : (
                    shortAngle(w).kind !== "read" && (
                      <span className={`sh-hook-dot sh-hook-tag--${shortAngle(w).kind}`} title={shortAngle(w).label} />
                    )
                  )}
                </span>
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

        <div className="sh-field">
          <span>Hook style</span>
          <div className="sh-levels sh-hook-styles" role="radiogroup" aria-label="Hook style">
            {HOOK_STYLES.map((h) => (
              <button
                key={h.id}
                type="button"
                role="radio"
                aria-checked={hookStyle === h.id}
                className={hookStyle === h.id ? "sh-btn sh-btn--on" : "sh-btn"}
                title={h.hint}
                onClick={() => {
                  stop();
                  update({ hookStyle: h.id });
                }}
              >
                {h.label}
              </button>
            ))}
          </div>
          <small className="sh-field-hint">{HOOK_STYLES.find((h) => h.id === hookStyle)?.hint}</small>
        </div>

        <fieldset className="sh-options">
          <label>
            <input type="checkbox" checked={settings.pan} onChange={(e) => update({ pan: e.target.checked })} />
            Camera pan across the backdrop
          </label>
          <label>
            <input type="checkbox" checked={settings.brush} onChange={(e) => update({ brush: e.target.checked })} />
            Brush-stroke reveal (stroke order)
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

        <section className="sh-meta social-inline" aria-label="Upload text">
          <SocialPostBody
            key={`${item.id}-${brush}`}
            target={{ type: "short", id: item.id, strokeCredit: brush, hookStyle }}
            platformStoreKey="jlpt-trainer:shorts-social-platform:v1"
            defaultPlatform="youtube-shorts"
          />
        </section>
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
