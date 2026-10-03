import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
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
const NUANCE_POLL_MS = 500;
/** Peek from behind the nuance panel every so often, briefly. */
const PEEK_EVERY_MS: [number, number] = [10_000, 22_000];
const PEEK_FOR_MS = 2600;

/** The visible Nuance panel the mascot hides behind, if any. */
function findNuancePanel(): HTMLElement | null {
  for (const el of document.querySelectorAll<HTMLElement>(NUANCE_SELECTOR)) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
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
 * tips. It hides behind the Player's Nuance panel and peeks out now and then;
 * with no panel on screen it peeks up from the bottom-left corner instead.
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
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [peeking, setPeeking] = useState(false);
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
    setTip(next);
  }, []);

  const poolNow = useCallback(() => {
    const scene = getCurrentScene();
    return scene ? [...SCENE_TIPS[scene.backdrop], ...GENERAL_TIPS] : GENERAL_TIPS;
  }, []);

  useEffect(() => subscribeToSenseiSettings(setSettings), []);
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

  // Hide behind the Nuance panel whenever one is on screen.
  useEffect(() => {
    const check = () => {
      const next = findNuancePanel();
      setAnchor((prev) => (prev === next ? prev : next));
    };
    check();
    const id = window.setInterval(check, NUANCE_POLL_MS);
    return () => window.clearInterval(id);
  }, []);

  // Behind the panel: peek out once in a while.
  useEffect(() => {
    if (!anchor || tip) {
      setPeeking(false);
      return;
    }
    let timer = 0;
    const schedule = () => {
      const [min, max] = PEEK_EVERY_MS;
      timer = window.setTimeout(() => {
        setPeeking(true);
        timer = window.setTimeout(() => {
          setPeeking(false);
          schedule();
        }, PEEK_FOR_MS);
      }, min + Math.random() * (max - min));
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, [anchor, tip]);

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

  if (anchor) {
    // Clipped slot on the panel's top edge, so the mascot looks hidden behind it.
    return createPortal(
      <div className={`sensei sensei--nuance${stateClass}`}>
        {bubble}
        <div className="sensei-slot">{body}</div>
      </div>,
      anchor
    );
  }

  return (
    <div className={`sensei${stateClass}`}>
      {body}
      {bubble}
    </div>
  );
}
