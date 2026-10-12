import "../../../components/Retention/retention.css";
import { Furigana } from "../../../lib/japanese/furigana";
import type { CheckPhase, ReadHookState } from "../../../services/autoModeRunner";
import { plainJapanese } from "../everydayData";
import { objectWord } from "./scenes";
import { sceneCheckQuestion, type SceneCheck } from "./sceneShow";
import { fillCount, HOOK_EN, HOOK_JA, SPEAKER_NAME, type ShowLine } from "./sceneScripts";
import type { DiscoveryScene } from "./types";

/**
 * The show's on-screen parts. In the frame: a caption for the line being
 * spoken and the hook / Pause & answer banners (they are what a viewer
 * watches). In the side panel: the script, the hook card, the check card
 * and the outro recap.
 */

function LineText({ line, count }: { line: ShowLine; count: number }) {
  if (line.speaker === "nanami") {
    return (
      <>
        <span className="vd-line-jp" lang="ja">
          <Furigana text={line.text} />
        </span>
        {line.sub ? <span className="vd-line-sub">{line.sub}</span> : null}
      </>
    );
  }
  return <span className="vd-line-en">{fillCount(line.text, count)}</span>;
}

/** Caption over the scene for the line being spoken (intro / outro). */
export function ShowCaption({ line, count }: { line: ShowLine; count: number }) {
  return (
    <div className={`vd-caption vd-caption--${line.speaker}`} aria-live="polite" data-head-avoid>
      <span className="vd-speaker">{SPEAKER_NAME[line.speaker].en}</span>
      <LineText line={line} count={count} />
    </div>
  );
}

/** The script in the side panel; lines appear as they are spoken. */
export function ShowScript({
  title,
  lines,
  active,
  count,
}: {
  title: string;
  lines: readonly ShowLine[];
  active: number;
  count: number;
}) {
  return (
    <div className="vd-script" data-head-avoid>
      <p className="vd-script-title">{title}</p>
      <ol>
        {lines.map((l, i) => (
          <li
            key={i}
            className={[`vd-script-line vd-script-line--${l.speaker}`, i === active ? "vd-script-line--on" : "", i > active ? "vd-script-line--next" : ""]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="vd-speaker">{SPEAKER_NAME[l.speaker].en}</span>
            <LineText line={l} count={count} />
          </li>
        ))}
      </ol>
    </div>
  );
}

/** "What's this called?" over the scene, with the countdown ring. */
export function HookBanner({ hook }: { hook: ReadHookState }) {
  return (
    <div className="vd-banner" data-head-avoid>
      <span className="vd-banner-en">{HOOK_EN}</span>
      <span className="vd-banner-ja" lang="ja">
        <Furigana text={HOOK_JA} />
      </span>
      {hook.ms > 0 ? (
        <span key={hook.key} className="ret-ring" style={{ animationDuration: `${hook.ms}ms` }} aria-hidden="true" />
      ) : null}
    </div>
  );
}

/** Side card while the name is hidden. */
export function HookCard({ index, total }: { index: number; total: number }) {
  return (
    <div className="vd-card vd-hookcard" data-head-avoid>
      <span className="vd-hookcard-q" aria-hidden="true">
        ？
      </span>
      <p>Say it before the answer appears!</p>
      <span className="vd-tour-pos">
        {index + 1} / {total}
      </span>
    </div>
  );
}

export function CheckBanner({ check }: { check: SceneCheck }) {
  return (
    <div className="vd-banner vd-banner--check" data-head-avoid>
      <span className="vd-banner-tag">⏸ Pause &amp; answer</span>
      <span className="vd-banner-en" lang={check.kind === "where" ? "ja" : undefined}>
        {sceneCheckQuestion(check)}
      </span>
    </div>
  );
}

/** Pause & answer in the side panel: ask → think (ring) → reveal. */
export function SceneCheckCard({ check, phase, thinkMs }: { check: SceneCheck; phase: CheckPhase; thinkMs: number }) {
  const revealed = phase === "reveal";
  const word = objectWord(check.object);
  return (
    <div className={`vd-card vd-check vd-check--${phase}`} data-head-avoid>
      <span className="ret-check-tag vd-check-tag">⏸ Pause &amp; answer</span>
      <p className="vd-check-q">{check.kind === "name" ? "What's this in Japanese?" : "Where is it in the picture?"}</p>
      {check.kind === "where" ? (
        <p className="vd-check-word" lang="ja">
          <Furigana text={word.japanese} />
        </p>
      ) : (
        <ol className="vd-check-options">
          {check.options.map((o) => (
            <li
              key={o.label}
              lang="ja"
              className={revealed ? (o.correct ? "vd-opt vd-opt--correct" : "vd-opt vd-opt--wrong") : "vd-opt"}
            >
              <span className="vd-opt-label">{o.label}</span>
              {o.text}
              {revealed && o.correct ? <span className="vd-opt-tick">✓</span> : null}
            </li>
          ))}
        </ol>
      )}
      {revealed ? (
        <p className="vd-check-answer">
          <span lang="ja">{plainJapanese(word)}</span> — {word.english}
        </p>
      ) : (
        <p className="vd-check-think">
          {phase === "think" ? (
            <span className="ret-ring ret-ring--small" style={{ animationDuration: `${thinkMs}ms` }} aria-hidden="true" />
          ) : null}
          Pause the video if you need more time
        </p>
      )}
    </div>
  );
}

/** Outro recap: every word of the scene. */
export function ShowRecap({ scene }: { scene: DiscoveryScene }) {
  return (
    <ul className="vd-recap" aria-label="Words in this scene" data-head-avoid>
      {scene.objects.map((o) => {
        const w = objectWord(o);
        return (
          <li key={o.id}>
            <span lang="ja">{plainJapanese(w)}</span>
            <small>{w.english.split(/[,;(]/)[0]!.trim()}</small>
          </li>
        );
      })}
    </ul>
  );
}
