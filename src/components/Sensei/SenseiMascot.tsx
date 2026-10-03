import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { subscribeToReactions } from "../../services/reactionBus";
import {
  SPEECH_RATE_NORMAL,
  speechService,
  type SpeakCallbacks,
} from "../../services/speechService";
import { getCurrentScene, subscribeToScene } from "../../services/sceneBus";
import {
  getSenseiSettings,
  setSenseiSettings,
  subscribeToSenseiSettings,
  subscribeToSenseiTips,
  type SenseiSettings,
  type SenseiTip,
} from "../../services/senseiBus";
import { SenseiArt, SenseiLeaf } from "./senseiArt";
import {
  candidateSpots,
  collectObstacles,
  findStageBox,
  pickSpot,
  spotIsClear,
  type Spot,
} from "./senseiSpots";
import {
  CELEBRATE_TIPS,
  ENCOURAGE_TIPS,
  GENERAL_TIPS,
  SCENE_TIPS,
  SENSEI_NAMES,
  pickTip,
  tipDurationMs,
} from "./senseiTips";
import "./sensei.css";

/** Delay before a scene's culture note pops, so it lands after the page settles. */
const SCENE_TIP_DELAY_MS = 1500;
/** Minimum gap between pop-ups the mascot starts on its own (not clicks). */
const AUTO_GAP_MS = 25_000;
const RECENT_LIMIT = 6;
const NUANCE_SELECTOR = ".lesson-nuance";
/** How often a showing mascot re-checks that no text has moved under it. */
const CLEAR_POLL_MS = 500;
/** Peek out every so often, briefly, from a random spot. */
const PEEK_EVERY_MS: [number, number] = [10_000, 22_000];
const PEEK_FOR_MS = 2600;
/** Let the slot mount at its new spot before sliding out, so it doesn't glide across. */
const PEEK_SETTLE_MS = 60;

/** The visible Nuance panel's box, if any. */
function findNuanceBox() {
  for (const el of document.querySelectorAll<HTMLElement>(NUANCE_SELECTOR)) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return r;
  }
  return null;
}

function spotsNow(): { cands: Spot[]; obstacles: ReturnType<typeof collectObstacles> } {
  const stage = findStageBox();
  const small = window.innerWidth <= 480;
  return {
    cands: candidateSpots(stage.box, findNuanceBox(), small),
    obstacles: collectObstacles(stage.el),
  };
}

/** A random spot that covers no text, or null when there is none. */
function chooseClearSpot(): Spot | null {
  const { cands, obstacles } = spotsNow();
  return pickSpot(cands, obstacles);
}

/** For a tip that must show: a clear spot, else the bottom-left corner. */
function chooseSpotForTip(): Spot | null {
  const { cands, obstacles } = spotsNow();
  return pickSpot(cands, obstacles) ?? cands.find((s) => s.edge === "bottom") ?? null;
}

function stillClear(spot: Spot): boolean {
  return spotIsClear(spot, collectObstacles(findStageBox().el));
}

function speakAsync(
  run: (callbacks: SpeakCallbacks) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    run({ onEnd: resolve, onError: reject });
  });
}

/**
 * Tanuki-sensei / Neko-sensei — a small mascot with culture notes and study
 * tips. It stays hidden and peeks out now and then from a random spot — the
 * stage's sides or bottom, or from behind the Nuance panel — never over text.
 *
 * Pops up on its own (silently) when:
 * - a new scene appears for the first time this session (a culture note),
 * - the learner misses three in a row (encouragement), or finishes strong,
 * - any code calls `showSenseiTip`.
 * Tap: stops any playing TTS and reads a tip aloud — Nanami for the Japanese
 * phrase, Andrew for the English note. Double-click swaps tanuki ↔ neko · ×
 * hides the mascot (the leaf tab brings it back). The head's M key toggles too.
 */
export default function SenseiMascot() {
  const [settings, setSettings] = useState<SenseiSettings>(getSenseiSettings);
  const [tip, setTip] = useState<SenseiTip | null>(null);
  const [hover, setHover] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [spot, setSpot] = useState<Spot | null>(null);
  const [peeking, setPeeking] = useState(false);
  const spotRef = useRef(spot);
  spotRef.current = spot;
  const recent = useRef<string[]>([]);
  const lastAuto = useRef(0);
  const tippedScenes = useRef(new Set<string>());
  const speakGen = useRef(0);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const show = useCallback((next: SenseiTip | null, auto: boolean) => {
    if (!next || !settingsRef.current.enabled) return;
    const now = Date.now();
    if (auto && now - lastAuto.current < AUTO_GAP_MS) return;
    if (auto) lastAuto.current = now;
    recent.current = [next.id, ...recent.current.filter((id) => id !== next.id)].slice(
      0,
      RECENT_LIMIT
    );
    const at = spotRef.current;
    if (!at || !stillClear(at)) setSpot(chooseSpotForTip());
    setTip(next);
  }, []);

  const poolNow = useCallback(() => {
    const scene = getCurrentScene();
    return scene ? [...SCENE_TIPS[scene.backdrop], ...GENERAL_TIPS] : GENERAL_TIPS;
  }, []);

  useEffect(() => subscribeToSenseiSettings(setSettings), []);
  useEffect(() => {
    if (!spotRef.current) setSpot(chooseSpotForTip());
  }, [settings.enabled]);
  useEffect(() => subscribeToSenseiTips((t) => show(t, false)), [show]);

  // Culture note the first time each scene shows up.
  useEffect(() => {
    let timer = 0;
    const onScene = (scene: ReturnType<typeof getCurrentScene>) => {
      window.clearTimeout(timer);
      if (!scene || tippedScenes.current.has(scene.backdrop)) return;
      const backdrop = scene.backdrop;
      timer = window.setTimeout(() => {
        tippedScenes.current.add(backdrop);
        show(pickTip(SCENE_TIPS[backdrop], recent.current, Math.random()), true);
      }, SCENE_TIP_DELAY_MS);
    };
    onScene(getCurrentScene());
    const off = subscribeToScene(onScene);
    return () => {
      off();
      window.clearTimeout(timer);
    };
  }, [show]);

  // Encouragement / praise from the answer reactions.
  useEffect(
    () =>
      subscribeToReactions((e) => {
        if (e.kind === "encourage") show(pickTip(ENCOURAGE_TIPS, recent.current, Math.random()), true);
        else if (e.kind === "celebrate") show(pickTip(CELEBRATE_TIPS, recent.current, Math.random()), true);
      }),
    [show]
  );

  // Auto-hide after a reading time; hovering the bubble or the voiceover holds it.
  useEffect(() => {
    if (!tip || hover || speaking) return;
    const id = window.setTimeout(() => setTip(null), tipDurationMs(tip));
    return () => window.clearTimeout(id);
  }, [tip, hover, speaking]);

  // Peek out once in a while, each time from a new random spot clear of text.
  useEffect(() => {
    if (tip || !settings.enabled) {
      setPeeking(false);
      return;
    }
    let timer = 0;
    const schedule = () => {
      const [min, max] = PEEK_EVERY_MS;
      timer = window.setTimeout(() => {
        const next = chooseClearSpot();
        if (!next) {
          schedule();
          return;
        }
        setSpot(next);
        timer = window.setTimeout(() => {
          setPeeking(true);
          timer = window.setTimeout(() => {
            setPeeking(false);
            schedule();
          }, PEEK_FOR_MS);
        }, PEEK_SETTLE_MS);
      }, min + Math.random() * (max - min));
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, [tip, settings.enabled]);

  // While showing, step away if text moves under the mascot (card change, resize).
  useEffect(() => {
    if (!peeking && !tip) return;
    const id = window.setInterval(() => {
      const at = spotRef.current;
      if (!at || stillClear(at)) return;
      if (tip) {
        const next = chooseClearSpot();
        if (next) setSpot(next);
      } else {
        setPeeking(false);
      }
    }, CLEAR_POLL_MS);
    return () => window.clearInterval(id);
  }, [peeking, tip]);

  useEffect(
    () => () => {
      speakGen.current += 1;
    },
    []
  );

  /** Stop whatever is playing, then read the tip: Nanami (JA), then Andrew (EN). */
  const speakTip = (t: SenseiTip) => {
    const gen = ++speakGen.current;
    speechService.stop();
    setSpeaking(true);
    void (async () => {
      try {
        const ja = t.ja?.replace(/[〜~]/gu, "").trim();
        if (ja) {
          await speakAsync((cb) => speechService.speakJapanese(ja, cb, SPEECH_RATE_NORMAL));
        }
        if (gen !== speakGen.current) return;
        await speakAsync((cb) => speechService.speakEnglish(t.en, cb, SPEECH_RATE_NORMAL));
      } catch {
        // Stopped or superseded.
      } finally {
        if (gen === speakGen.current) setSpeaking(false);
      }
    })();
  };

  const nextTip = () => {
    const t = pickTip(poolNow(), recent.current, Math.random());
    if (!t) return;
    show(t, false);
    speakTip(t);
  };
  const swap = () =>
    setSenseiSettings({ character: settings.character === "tanuki" ? "neko" : "tanuki" });
  const hide = () => {
    if (speaking) {
      speakGen.current += 1;
      speechService.stop();
      setSpeaking(false);
    }
    setTip(null);
    setSenseiSettings({ enabled: false });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "s" || e.key === "S") {
      e.preventDefault();
      swap();
    } else if (e.key === "Escape") {
      setTip(null);
    }
  };

  if (!settings.enabled) {
    return (
      <button
        type="button"
        className="sensei-tab"
        onClick={() => setSenseiSettings({ enabled: true })}
        aria-label={`Bring back ${SENSEI_NAMES[settings.character].en}`}
        title={`Bring back ${SENSEI_NAMES[settings.character].en}`}
      >
        <SenseiLeaf />
      </button>
    );
  }

  const name = SENSEI_NAMES[settings.character];
  const body = (
    <button
      type="button"
      className="sensei-body"
      onClick={nextTip}
      onDoubleClick={(e) => {
        e.preventDefault();
        swap();
      }}
      onKeyDown={onKeyDown}
      aria-label={`${name.en}: tap to hear a tip, double-click or S to swap mascot`}
      title={`${name.ja} — tap to hear a tip · double-click to swap`}
    >
      <SenseiArt character={settings.character} talking={Boolean(tip)} />
    </button>
  );
  const bubble = tip && (
    <div
      key={tip.id}
      className="sensei-bubble"
      role="status"
      aria-live="polite"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="sensei-bubble-head">
        <span className="sensei-name" lang="ja">
          {name.ja}
        </span>
        <button
          type="button"
          className="sensei-close"
          onClick={hide}
          aria-label={`Hide ${name.en}`}
          title="Hide the mascot (the leaf brings it back)"
        >
          ×
        </button>
      </div>
      {tip.ja && (
        <p className="sensei-phrase" lang="ja">
          {tip.reading ? (
            <ruby>
              {tip.ja}
              <rt>{tip.reading}</rt>
            </ruby>
          ) : (
            tip.ja
          )}
        </p>
      )}
      <p className="sensei-text">{tip.en}</p>
    </div>
  );
  const stateClass = `${tip ? " sensei--up" : ""}${peeking ? " sensei--peek" : ""}`;
  const at = spot;
  if (!at) return null;
  const placeClass = ` sensei--${at.edge} sensei--toward-${at.inward}${at.dropBubble ? " sensei--drop" : ""}`;

  // A clipped slot on an edge: the mascot slides out of it, so it seems to be
  // hiding just off the stage or behind the Nuance panel.
  return (
    <div
      key={`${at.edge}-${at.x}-${at.y}`}
      className={`sensei${placeClass}${stateClass}`}
      style={{ left: at.x, top: at.y, width: at.w, height: at.h } as CSSProperties}
    >
      <div className="sensei-slot">{body}</div>
      {bubble}
    </div>
  );
}
