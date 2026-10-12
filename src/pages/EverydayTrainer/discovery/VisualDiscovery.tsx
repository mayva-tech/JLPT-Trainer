import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import "./discovery.css";
import { autoModeTiming } from "../../../config/autoModeTiming";
import { useRetentionSettings } from "../../../components/Retention/useRetentionSettings";
import { Furigana } from "../../../lib/japanese/furigana";
import { plainJapanese } from "../everydayData";
import type { EverydayProgressApi } from "../useEverydayProgress";
import type { EverydaySpeech } from "../useEverydaySpeech";
import { IconChevronLeft, IconPlay, IconSpeaker, IconStop } from "../components/icons";
import { SCENE_ART } from "./art";
import { discoveredIn, sceneCompletion } from "./discoveryProgress";
import {
  answerTap,
  currentTarget,
  findPrompt,
  newRound,
  roundDone,
  skipTarget,
  type RoundState,
} from "./discoveryQuiz";
import { DiscoveryCard } from "./DiscoveryCard";
import { HotspotEditor } from "./HotspotEditor";
import { SceneView, type Flash, type FlashKind } from "./SceneView";
import {
  CheckBanner,
  HookBanner,
  HookCard,
  SceneCheckCard,
  ShowCaption,
  ShowRecap,
  ShowScript,
} from "./ShowPanels";
import { useSceneShow } from "./useSceneShow";
import { DISCOVERY_SCENES, objectWord, sceneById } from "./scenes";
import type { DiscoveryObject, DiscoveryScene, NormPoint } from "./types";
import { useDiscoveryProgress, type DiscoveryProgressApi } from "./useDiscoveryProgress";

type Mode = "explore" | "find" | "listen" | "tour";

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: "explore", label: "Explore", hint: "Tap anything in the picture" },
  { id: "find", label: "Find it", hint: "Read the word, tap the object" },
  { id: "listen", label: "Listen", hint: "Hear the word, tap the object" },
  { id: "tour", label: "Guided", hint: "Intro, every object with quick quizzes, outro" },
];

/** Phone / narrow portrait window: the scene is laid out like a Short. */
const NARROW_QUERY = "(max-width: 700px)";

function useNarrow(): boolean {
  const [narrow, setNarrow] = useState(() => typeof window !== "undefined" && window.matchMedia?.(NARROW_QUERY).matches === true);
  useEffect(() => {
    const mq = window.matchMedia?.(NARROW_QUERY);
    if (!mq) return;
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return narrow;
}

type Props = {
  everyday: EverydayProgressApi;
  speech: EverydaySpeech;
  /** Open this scene straight away (deep link); null = the gallery. */
  initialSceneId: string | null;
  /** Hotspot editor for mapping new pictures (?discoverEdit=1). */
  editor: boolean;
  onExit: () => void;
  /** Location of the open scene (talking-head backdrop, ambience), or null. */
  onSceneChange: (categoryId: string | null) => void;
};

/**
 * Visual Discovery — 写真で日本語. A gallery of scenes; in a scene, tap
 * objects to discover their Japanese names, then test yourself with Find it
 * and Listen, or let the guided tour walk through every object.
 */
export default function VisualDiscovery({ everyday, speech, initialSceneId, editor, onExit, onSceneChange }: Props) {
  const discovery = useDiscoveryProgress();
  const [sceneId, setSceneId] = useState<string | null>(
    initialSceneId && sceneById(initialSceneId) ? initialSceneId : null,
  );
  const scene = sceneId ? sceneById(sceneId) ?? null : null;
  const { setLastScene } = discovery;

  useEffect(() => {
    onSceneChange(scene?.categoryId ?? null);
    if (scene) setLastScene(scene.id);
  }, [scene, onSceneChange, setLastScene]);

  const open = (id: string | null) => {
    speech.stop();
    setSceneId(id);
    window.scrollTo?.({ top: 0 });
  };

  return scene ? (
    <SceneScreen
      key={scene.id}
      scene={scene}
      everyday={everyday}
      discovery={discovery}
      speech={speech}
      editor={editor}
      onBack={() => open(null)}
    />
  ) : (
    <Gallery everyday={everyday} discovery={discovery} onOpen={(id) => open(id)} onExit={onExit} />
  );
}

/* ───────────────────────── gallery ───────────────────────── */

function Gallery({
  everyday,
  discovery,
  onOpen,
  onExit,
}: {
  everyday: EverydayProgressApi;
  discovery: DiscoveryProgressApi;
  onOpen: (id: string) => void;
  onExit: () => void;
}) {
  const { progress } = discovery;
  return (
    <section className="vd-gallery-page">
      <header className="vd-head">
        <button type="button" className="ev-back" onClick={onExit}>
          <IconChevronLeft size={16} /> Everyday Japanese
        </button>
        <h1 className="vd-title">
          Visual Discovery{" "}
          <span lang="ja">
            <Furigana text="写真(しゃしん)で日本語(にほんご)" />
          </span>
        </h1>
        <p className="vd-tagline">Discover the Japanese names of things around you.</p>
      </header>

      <ul className="vd-gallery">
        {DISCOVERY_SCENES.map((s) => {
          const c = sceneCompletion(progress, s);
          const learned = s.objects.filter((o) => everyday.progress.known.includes(o.vocabularyId)).length;
          const Art = s.imagePath.startsWith("art:") ? SCENE_ART[s.imagePath.slice(4)] : undefined;
          const last = progress.lastSceneId === s.id;
          return (
            <li key={s.id} className="vd-scene-card">
              <button type="button" className="vd-scene-open" onClick={() => onOpen(s.id)} aria-label={`${c.found ? "Continue" : "Explore"}: ${s.titleEnglish}`}>
                <span className="vd-thumb">
                  <svg viewBox={`0 0 ${s.imageWidth} ${s.imageHeight}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                    <rect width={s.imageWidth} height={s.imageHeight} fill="#1b2433" />
                    {Art ? (
                      <Suspense fallback={null}>
                        <Art />
                      </Suspense>
                    ) : (
                      <image
                        href={`${import.meta.env.BASE_URL}discovery/${s.imagePath.slice(6)}`}
                        width={s.imageWidth}
                        height={s.imageHeight}
                        preserveAspectRatio="none"
                      />
                    )}
                  </svg>
                  {c.percent === 100 ? <span className="vd-thumb-badge">Complete</span> : last ? <span className="vd-thumb-badge vd-thumb-badge--soft">Last visited</span> : null}
                </span>
                <span className="vd-scene-info">
                  <span className="vd-scene-name">
                    {s.titleEnglish}{" "}
                    <span lang="ja">
                      <Furigana text={s.titleJapanese} />
                    </span>
                  </span>
                  <span className="vd-scene-blurb">{s.blurb}</span>
                  <span className="vd-scene-stats">
                    {c.total} objects · {c.found} discovered · {learned} learned
                  </span>
                  <span className="vd-bar" aria-hidden="true">
                    <span style={{ width: `${c.percent}%` }} />
                  </span>
                  <span className="vd-scene-cta">
                    {c.percent}% · {c.found === 0 ? "Explore" : c.percent === 100 ? "Explore again" : "Continue"} →
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="vd-more">More places are on the way — living room, bathroom, station, konbini and more.</p>
    </section>
  );
}

/* ───────────────────────── scene ───────────────────────── */

interface Feedback {
  kind: "correct" | "wrong" | "skip";
  /** The object tapped (wrong) or found (correct / skipped). */
  objectId: string;
}

function SceneScreen({
  scene,
  everyday,
  discovery,
  speech,
  editor,
  onBack,
}: {
  scene: DiscoveryScene;
  everyday: EverydayProgressApi;
  discovery: DiscoveryProgressApi;
  speech: EverydaySpeech;
  editor: boolean;
  onBack: () => void;
}) {
  const { progress, updatePrefs } = discovery;
  const prefs = progress.prefs;
  const found = useMemo(() => new Set(discoveredIn(progress, scene.id)), [progress, scene.id]);
  const completion = sceneCompletion(progress, scene);
  const byId = useMemo(() => new Map(scene.objects.map((o) => [o.id, o])), [scene]);

  const [mode, setMode] = useState<Mode>("explore");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newId, setNewId] = useState<string | null>(null);
  const [flash, setFlash] = useState<Flash | null>(null);
  const flashKey = useRef(0);
  const timers = useRef(new Set<number>());
  const later = useCallback((ms: number, fn: () => void) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id);
      fn();
    }, ms);
    timers.current.add(id);
  }, []);
  const clearTimers = () => {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current.clear();
  };
  useEffect(() => () => clearTimers(), []);

  const pulse = useCallback((id: string, kind: FlashKind) => {
    flashKey.current += 1;
    setFlash({ id, kind, key: flashKey.current });
  }, []);

  /** Found in any mode: scene progress + the word explored everywhere. */
  const discover = useCallback(
    (obj: DiscoveryObject) => {
      const wasNew = !found.has(obj.id);
      discovery.markDiscovered(scene.id, obj.id);
      everyday.markExplored(obj.vocabularyId);
      return wasNew;
    },
    [found, discovery, everyday, scene.id],
  );

  /* ── Explore ── */

  const exploreSelect = (obj: DiscoveryObject) => {
    const wasNew = discover(obj);
    setSelectedId(obj.id);
    setNewId(wasNew ? obj.id : null);
    if (wasNew) pulse(obj.id, "new");
    if (prefs.autoSpeak) speech.say(objectWord(obj), "ja");
  };

  const nextUndiscovered = (() => {
    const start = selectedId ? scene.objects.findIndex((o) => o.id === selectedId) + 1 : 0;
    for (let k = 0; k < scene.objects.length; k++) {
      const o = scene.objects[(start + k) % scene.objects.length]!;
      if (!found.has(o.id)) return o;
    }
    return null;
  })();

  /* ── Find it / Listen ── */

  const [round, setRound] = useState<RoundState | null>(null);
  const [listenStarted, setListenStarted] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const answeredRef = useRef(new Set<string>()); // targets already counted in Everyday stats
  const roundRef = useRef<RoundState | null>(null);
  roundRef.current = round;

  const speakTarget = useCallback(
    (state: RoundState, m: Mode) => {
      const id = currentTarget(state);
      const obj = id ? byId.get(id) : undefined;
      if (!obj) return;
      const word = objectWord(obj);
      if (m === "listen") {
        speech.say(word, "ja");
        return;
      }
      if (!prefs.speakPrompt) return;
      const p = findPrompt(obj, word);
      if (prefs.promptLang === "ja") speech.sayLine(p.ja, "ja", p.jaReading);
      else speech.sayLine(p.en, "en");
    },
    [byId, speech, prefs.speakPrompt, prefs.promptLang],
  );

  const startRound = (m: Mode, ids: readonly string[] = scene.objects.map((o) => o.id)) => {
    clearTimers();
    speech.stop();
    const r = newRound(ids, `${scene.id}:${m}:${Date.now()}`);
    answeredRef.current = new Set();
    setRound(r);
    setFeedback(null);
    setSelectedId(null);
    setFlash(null);
    speakTarget(r, m);
  };

  const finishRound = (r: RoundState, m: Mode) => {
    everyday.recordSession({ mode: m === "listen" ? "listen" : "picture", categoryId: scene.categoryId, total: r.queue.length, correct: r.firstTry });
    discovery.recordQuizRound(scene.id, r.firstTry, r.queue.length);
  };

  const quizTap = (obj: DiscoveryObject) => {
    const r = roundRef.current;
    if (!r || roundDone(r)) return;
    const targetId = currentTarget(r)!;
    const target = byId.get(targetId)!;
    const { state, result } = answerTap(r, obj.id);
    if (result === "ignored") return;
    discovery.recordQuizTap(scene.id, result === "correct");
    if (!answeredRef.current.has(targetId)) {
      answeredRef.current.add(targetId);
      everyday.recordAnswer(target.vocabularyId, result === "correct");
    }
    setRound(state);
    if (result === "correct") {
      discover(target);
      pulse(target.id, "correct");
      setFeedback({ kind: "correct", objectId: target.id });
      const done = roundDone(state);
      if (done) finishRound(state, mode);
      // Say the word found, then the next prompt.
      const word = objectWord(target);
      speech.playSequence(word, "jp", () => {
        if (!done && roundRef.current === state) later(350, () => speakTarget(state, mode));
      });
    } else {
      pulse(obj.id, "wrong");
      setFeedback({ kind: "wrong", objectId: obj.id });
      if (prefs.hints) later(700, () => pulse(targetId, "hint"));
    }
  };

  const skip = () => {
    const r = roundRef.current;
    if (!r || roundDone(r)) return;
    const targetId = currentTarget(r)!;
    if (!answeredRef.current.has(targetId)) {
      answeredRef.current.add(targetId);
      everyday.recordAnswer(byId.get(targetId)!.vocabularyId, false);
    }
    const next = skipTarget(r);
    setRound(next);
    pulse(targetId, "hint");
    setFeedback({ kind: "skip", objectId: targetId });
    if (roundDone(next)) finishRound(next, mode);
    else later(900, () => speakTarget(next, mode));
  };

  /* ── Play all / Guided: the scene show ── */

  const [retention, toggleRetention] = useRetentionSettings();
  const show = useSceneShow({
    scene,
    speech,
    getOptions: () => ({ hook: retention.hook, check: retention.check, introOutro: prefs.introOutro }),
    onReveal: (obj) => {
      const wasNew = discover(obj);
      setNewId(wasNew ? obj.id : null);
    },
  });

  /* ── mode switching ── */

  const switchMode = (m: Mode) => {
    clearTimers();
    speech.stop();
    setMode(m);
    setFeedback(null);
    setFlash(null);
    show.reset();
    setNewId(null);
    setListenStarted(false);
    if (m === "find") startRound("find");
    else if (m === "listen") {
      setRound(newRound(scene.objects.map((o) => o.id), `${scene.id}:listen:${Date.now()}`));
      answeredRef.current = new Set();
      setSelectedId(null);
    } else if (m === "tour") {
      setSelectedId(null);
      setRound(null);
    } else {
      setRound(null);
      setSelectedId(null);
    }
  };

  const onSelect = (obj: DiscoveryObject) => {
    if (mode === "explore") exploreSelect(obj);
    else if (mode === "find" || (mode === "listen" && listenStarted)) quizTap(obj);
    else if (mode === "tour") {
      show.goTo(scene.objects.indexOf(obj), false);
      speech.say(objectWord(obj), "ja");
    }
  };

  const quiz = mode === "find" || mode === "listen";
  const labelFor = (obj: DiscoveryObject, i: number) =>
    quiz ? `Object ${i + 1}` : `${objectWord(obj).english} — ${plainJapanese(objectWord(obj))}`;

  // In the show the card follows the object being presented (hidden during a hook or check).
  const tourCardId = mode === "tour" && show.phase === "object" ? show.focusId : null;
  const cardId = mode === "tour" ? tourCardId : selectedId;
  const selectedObj = cardId ? byId.get(cardId) ?? null : null;
  const selectedWord = selectedObj ? objectWord(selectedObj) : null;

  /* ── editor ── */
  const [editorPoint, setEditorPoint] = useState<((pt: NormPoint) => void) | null>(null);
  const [editorOverlay, setEditorOverlay] = useState<ReactNode>(null);
  const [editing, setEditing] = useState(false);

  /* ── narrow window: controls fold away above the scene ── */
  const narrow = useNarrow();
  const [controlsOpen, setControlsOpen] = useState(false);
  const [zoomSlot, setZoomSlot] = useState<HTMLDivElement | null>(null);

  const card = selectedWord ? (
    <DiscoveryCard
      compact={narrow && mode === "tour"}
      word={selectedWord}
      isNew={newId === cardId}
      activeLang={speech.activeLang}
      nuanceActive={speech.nuanceFor === selectedWord.id}
      onSay={(lang) => speech.say(selectedWord, lang)}
      onSayNuance={() => speech.sayNuance(selectedWord)}
      known={everyday.progress.known.includes(selectedWord.id)}
      saved={everyday.progress.favorites.includes(selectedWord.id)}
      onToggleKnown={() => everyday.toggleKnown(selectedWord.id)}
      onToggleSaved={() => everyday.toggleFavorite(selectedWord.id)}
      onNext={mode === "explore" && nextUndiscovered ? () => exploreSelect(nextUndiscovered) : undefined}
      onClose={mode === "explore" ? () => setSelectedId(null) : undefined}
    />
  ) : null;

  const script = show.script;
  const count = scene.objects.length;
  const currentLine =
    show.phase === "intro" ? script?.intro[show.line] : show.phase === "outro" ? script?.outro[show.line] : undefined;
  const showCaption =
    show.phase === "hook" && show.hook ? (
      <HookBanner hook={show.hook} />
    ) : show.phase === "check" && show.check ? (
      <CheckBanner check={show.check.card} />
    ) : currentLine && show.playing && !narrow ? (
      <ShowCaption line={currentLine} count={count} />
    ) : null;
  /** Narrow window: just the line being spoken, so the panel keeps one height. */
  const outroLine = show.phase === "done" ? (script?.outro.length ?? 1) - 1 : show.line;

  const showPanel =
    show.phase === "idle" ? (
      <p className="vd-hint">
        <strong>Play all</strong> plays the whole scene hands-free: Nanami and Andrew introduce it, each object is hidden for a
        moment (“What's this called?”) then named in Japanese and English, with a quick Pause &amp; answer every{" "}
        {autoModeTiming.checkEvery} objects, and an outro to finish.
      </p>
    ) : show.phase === "intro" && script ? (
      narrow ? (
        <ShowScript title="Intro" lines={script.intro.slice(show.line, show.line + 1)} active={0} count={count} />
      ) : (
        <ShowScript title="Intro" lines={script.intro} active={show.line} count={count} />
      )
    ) : (show.phase === "outro" || show.phase === "done") && script && prefs.introOutro && narrow ? (
      <ShowScript title="Outro" lines={script.outro.slice(outroLine, outroLine + 1)} active={0} count={count} />
    ) : show.phase === "hook" ? (
      <HookCard index={show.index} total={count} />
    ) : show.phase === "check" && show.check ? (
      <SceneCheckCard check={show.check.card} phase={show.check.phase} thinkMs={autoModeTiming.checkThinkMs} />
    ) : (show.phase === "outro" || show.phase === "done") && script && prefs.introOutro ? (
      <>
        <ShowScript title="Outro" lines={script.outro} active={show.phase === "done" ? script.outro.length - 1 : show.line} count={count} />
        <ShowRecap scene={scene} />
      </>
    ) : show.phase === "done" ? (
      <p className="vd-hint">🎉 That's all {count} objects in this scene.</p>
    ) : (
      card
    );

  const tourControls =
    mode === "tour" ? (
      <>
        <div className="vd-tour-controls" role="group" aria-label="Play all controls">
          <button
            type="button"
            className="ev-btn"
            onClick={() => show.goTo(show.index - 1, show.playing)}
            disabled={show.index === 0 || show.phase === "idle" || show.phase === "intro"}
            aria-label="Previous object"
          >
            ⏮
          </button>
          <button type="button" className="ev-btn ev-btn--primary vd-tour-play" onClick={() => (show.playing ? show.pause() : show.play())}>
            {show.playing ? <IconStop /> : <IconPlay />} {show.playing ? "Pause" : show.phase === "idle" || show.phase === "done" ? "Play all" : "Resume"}
          </button>
          <button
            type="button"
            className="ev-btn"
            onClick={() => show.goTo(show.phase === "idle" || show.phase === "intro" ? 0 : show.index + 1, show.playing)}
            disabled={show.index >= scene.objects.length - 1 && show.phase !== "idle" && show.phase !== "intro"}
            aria-label="Next object"
          >
            ⏭
          </button>
          <span className="vd-tour-pos">
            {show.phase === "intro" ? "Intro" : show.phase === "outro" || show.phase === "done" ? "Outro" : `${show.index + 1} / ${scene.objects.length}`}
          </span>
        </div>
        <div className="vd-show-toggles" role="group" aria-label="Show options">
          <button type="button" className={prefs.introOutro ? "vd-chip vd-chip--on" : "vd-chip"} aria-pressed={prefs.introOutro} onClick={() => updatePrefs({ introOutro: !prefs.introOutro })}>
            🎬 Intro &amp; outro
          </button>
          <button type="button" className={retention.hook ? "vd-chip vd-chip--on" : "vd-chip"} aria-pressed={retention.hook} onClick={() => toggleRetention("hook")} title="Hide each name for a moment: “What's this called?”">
            読 Hook
          </button>
          <button
            type="button"
            className={retention.check ? "vd-chip vd-chip--on" : "vd-chip"}
            aria-pressed={retention.check}
            onClick={() => toggleRetention("check")}
            title={`Pause & answer every ${autoModeTiming.checkEvery} objects`}
          >
            ⏸ Quiz
          </button>
        </div>
      </>
    ) : null;

  return (
    <section className={narrow ? "vd-scene-page vd-scene-page--narrow" : "vd-scene-page"}>
      <header className="vd-scene-head">
        <button type="button" className="ev-back" onClick={onBack}>
          <IconChevronLeft size={16} /> Scenes
        </button>
        <div className="vd-scene-title">
          <h2>
            {scene.titleEnglish} ·{" "}
            <span lang="ja">
              <Furigana text={scene.titleJapanese} />
            </span>
          </h2>
          <span className="vd-count" aria-live="polite">
            {completion.found} / {completion.total} discovered
          </span>
        </div>
        <span className="vd-bar vd-bar--wide" aria-hidden="true">
          <span style={{ width: `${completion.percent}%` }} />
        </span>
      </header>

      {narrow ? (
        <button
          type="button"
          className="vd-controls-toggle"
          aria-expanded={controlsOpen}
          aria-controls="vd-controls"
          onClick={() => setControlsOpen((o) => !o)}
        >
          <span aria-hidden="true">{controlsOpen ? "▴" : "▾"}</span> {controlsOpen ? "Hide controls" : "Controls"}
        </button>
      ) : null}

      {!narrow || controlsOpen ? (
      <div className="vd-toolbar" id="vd-controls">
        <nav className="ev-tabs vd-tabs" aria-label="Mode">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={mode === m.id ? "ev-tab ev-tab--on" : "ev-tab"}
              aria-pressed={mode === m.id}
              title={m.hint}
              onClick={() => switchMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </nav>
        <div className="vd-tools">
          <button
            type="button"
            className="ev-btn ev-btn--primary vd-playall"
            onClick={() => {
              if (mode === "tour" && show.playing) {
                show.pause();
                return;
              }
              if (mode !== "tour") switchMode("tour");
              void show.start();
              // A clean, Short-shaped frame for screen recording.
              if (narrow) setControlsOpen(false);
            }}
            title="Intro, every object with quick quizzes, outro — hands-free for recording"
          >
            {mode === "tour" && show.playing ? <IconStop /> : <IconPlay />} {mode === "tour" && show.playing ? "Stop" : "Play all"}
          </button>
          <button
            type="button"
            className={prefs.showObjects ? "ev-btn ev-btn--on" : "ev-btn"}
            aria-pressed={prefs.showObjects}
            onClick={() => updatePrefs({ showObjects: !prefs.showObjects })}
            disabled={quiz}
            title={quiz ? "Hidden during a quiz" : undefined}
          >
            {prefs.showObjects ? "Hide objects" : "Show objects"}
          </button>
          <AudioSettings discovery={discovery} speech={speech} />
          {editor ? (
            <button type="button" className={editing ? "ev-btn ev-btn--on" : "ev-btn"} onClick={() => setEditing((e) => !e)}>
              Edit hotspots
            </button>
          ) : null}
        </div>
        {narrow ? (
          <div className="vd-controls-extra">
            {tourControls}
            <div className="vd-zoom-slot" ref={setZoomSlot} />
          </div>
        ) : null}
      </div>
      ) : null}

      <div className={`vd-stage${(selectedWord && (mode === "explore" || mode === "tour")) || (mode === "tour" && show.phase !== "idle") ? " vd-stage--card" : ""}`}>
        <SceneView
          scene={scene}
          selectedId={quiz ? null : mode === "tour" ? show.focusId : selectedId}
          onSelect={onSelect}
          labelFor={labelFor}
          showObjects={prefs.showObjects && !quiz && !editing}
          foundIds={found}
          flash={flash}
          spotlight={!quiz}
          disabled={mode === "listen" && !listenStarted}
          onScenePoint={editing && editorPoint ? editorPoint : undefined}
          overlay={editing ? editorOverlay : null}
          caption={mode === "tour" ? showCaption : null}
          zoomTarget={narrow ? (controlsOpen ? zoomSlot : null) : undefined}
        />

        {mode === "explore" ? (
          card ?? (
            <p className="vd-hint">
              {completion.found === completion.total ? (
                <>
                  🎉 All {completion.total} objects found! Try <button type="button" className="vd-link" onClick={() => switchMode("find")}>Find it</button> to test yourself.
                </>
              ) : (
                <>Tap anything in the picture to hear its Japanese name. Zoom in with ＋ (or pinch) for small things.</>
              )}
            </p>
          )
        ) : null}

        {mode === "tour" ? (
          <div className="vd-tour">
            {narrow ? null : tourControls}
            {narrow && show.phase !== "idle" ? (
              <div className="vd-show-panel">
                {showPanel}
                {/* The talking heads' seat, the same in every step of the show. */}
                <div className="vd-show-dock" data-head-dock aria-hidden="true" />
              </div>
            ) : (
              showPanel
            )}
          </div>
        ) : null}

        {quiz && round ? (
          <QuizPanel
            mode={mode}
            scene={scene}
            round={round}
            feedback={feedback}
            started={mode === "find" || listenStarted}
            promptLang={prefs.promptLang}
            onStart={() => {
              setListenStarted(true);
              speakTarget(round, "listen");
            }}
            onReplay={() => speakTarget(round, mode)}
            onSkip={skip}
            onRetry={() => {
              if (mode === "listen") startRoundListen();
              else startRound(mode);
            }}
            onRetryMissed={() => {
              if (mode === "listen") startRoundListen(round.missed);
              else startRound(mode, round.missed);
            }}
            onExplore={() => switchMode("explore")}
          />
        ) : null}

        {editing ? (
          <HotspotEditor
            scene={scene}
            setPointHandler={setEditorPoint}
            setOverlay={setEditorOverlay}
          />
        ) : null}
      </div>
    </section>
  );

  function startRoundListen(ids?: readonly string[]) {
    clearTimers();
    speech.stop();
    const r = newRound(ids ?? scene.objects.map((o) => o.id), `${scene.id}:listen:${Date.now()}`);
    answeredRef.current = new Set();
    setRound(r);
    setFeedback(null);
    setFlash(null);
    setListenStarted(true);
    speakTarget(r, "listen");
  }
}

/* ───────────────────────── quiz panel ───────────────────────── */

function QuizPanel({
  mode,
  scene,
  round,
  feedback,
  started,
  promptLang,
  onStart,
  onReplay,
  onSkip,
  onRetry,
  onRetryMissed,
  onExplore,
}: {
  mode: Mode;
  scene: DiscoveryScene;
  round: RoundState;
  feedback: Feedback | null;
  started: boolean;
  promptLang: "en" | "ja";
  onStart: () => void;
  onReplay: () => void;
  onSkip: () => void;
  onRetry: () => void;
  onRetryMissed: () => void;
  onExplore: () => void;
}) {
  const byId = new Map(scene.objects.map((o) => [o.id, o]));
  const targetId = currentTarget(round);
  const target = targetId ? byId.get(targetId) : undefined;
  const fbObj = feedback ? byId.get(feedback.objectId) : undefined;
  const fbWord = fbObj ? objectWord(fbObj) : null;

  if (roundDone(round)) {
    return (
      <div className="vd-quiz vd-quiz--done" role="status">
        <p className="vd-score">
          {round.firstTry} / {round.queue.length}
          <span>found on the first try</span>
        </p>
        <div className="vd-quiz-actions">
          <button type="button" className="ev-btn ev-btn--primary" onClick={onRetry}>
            Play again
          </button>
          {round.missed.length > 0 ? (
            <button type="button" className="ev-btn" onClick={onRetryMissed}>
              Retry missed ({round.missed.length})
            </button>
          ) : null}
          <button type="button" className="ev-btn" onClick={onExplore}>
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="vd-quiz">
        <p className="vd-prompt-sub">Nanami says a word — tap that object in the picture.</p>
        <button type="button" className="ev-btn ev-btn--primary vd-start" onClick={onStart}>
          <IconSpeaker size={20} /> Start listening
        </button>
      </div>
    );
  }

  const word = target ? objectWord(target) : null;
  const prompt = target && word ? findPrompt(target, word) : null;

  return (
    <div className="vd-quiz" aria-live="polite">
      <div className="vd-quiz-top">
        <span className="vd-quiz-pos">
          {round.index + 1} / {round.queue.length} · {round.firstTry} first try
        </span>
        <button type="button" className="ev-btn" onClick={onSkip}>
          Show me
        </button>
      </div>
      {mode === "find" && prompt && word ? (
        <button type="button" className="vd-prompt" onClick={onReplay} title="Hear the prompt again">
          {promptLang === "ja" ? (
            <span lang="ja">{target?.prompt ? prompt.ja : <Furigana text={`${word.japanese}を探(さが)してください。`} />}</span>
          ) : (
            prompt.en
          )}
          <IconSpeaker size={20} />
        </button>
      ) : (
        <button type="button" className="vd-prompt vd-prompt--listen" onClick={onReplay}>
          <IconSpeaker size={24} /> Listen again
        </button>
      )}
      <p className={`vd-feedback${feedback ? ` vd-feedback--${feedback.kind}` : ""}`}>
        {feedback && fbWord ? (
          feedback.kind === "correct" ? (
            <>
              ✓ <span lang="ja">{plainJapanese(fbWord)}</span> — {fbWord.english}
            </>
          ) : feedback.kind === "skip" ? (
            <>
              It was the <span lang="ja">{plainJapanese(fbWord)}</span> — {fbWord.english}.
            </>
          ) : (
            <>
              That's the <span lang="ja">{plainJapanese(fbWord)}</span> ({fbWord.english}). Try again.
            </>
          )
        ) : mode === "find" ? (
          "Tap the object in the picture."
        ) : (
          "Tap what you hear."
        )}
      </p>
    </div>
  );
}

/* ───────────────────────── audio settings ───────────────────────── */

function AudioSettings({ discovery, speech }: { discovery: DiscoveryProgressApi; speech: EverydaySpeech }) {
  const { prefs } = discovery.progress;
  const set = discovery.updatePrefs;
  return (
    <details className="vd-audio-settings">
      <summary className="ev-btn">Audio settings</summary>
      <div className="vd-audio-panel">
        <label>
          <input type="checkbox" checked={prefs.autoSpeak} onChange={(e) => set({ autoSpeak: e.target.checked })} />
          Say the Japanese when I tap (Explore)
        </label>
        <fieldset>
          <legend>Speed</legend>
          {(["slow", "normal", "fast"] as const).map((r) => (
            <label key={r}>
              <input type="radio" name="vd-rate" checked={speech.rateMode === r} onChange={() => speech.setRateMode(r)} />
              {r === "slow" ? "Slow" : r === "normal" ? "Normal" : "1.25×"}
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend>Find it</legend>
          <label>
            <input type="radio" name="vd-plang" checked={prefs.promptLang === "en"} onChange={() => set({ promptLang: "en" })} />
            English prompt
          </label>
          <label>
            <input type="radio" name="vd-plang" checked={prefs.promptLang === "ja"} onChange={() => set({ promptLang: "ja" })} />
            日本語の指示
          </label>
          <label>
            <input type="checkbox" checked={prefs.speakPrompt} onChange={(e) => set({ speakPrompt: e.target.checked })} />
            Read the prompt aloud
          </label>
          <label>
            <input type="checkbox" checked={prefs.hints} onChange={(e) => set({ hints: e.target.checked })} />
            Hints: point out the answer after a wrong tap
          </label>
        </fieldset>
      </div>
    </details>
  );
}
