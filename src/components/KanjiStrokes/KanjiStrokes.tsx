import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { kanjiStrokesIfLoaded, loadKanjiStrokes } from "./loadStrokes";
import { planStrokes, type PlanOptions, type StrokeData } from "./strokePlan";
import "./kanjiStrokes.css";

/**
 * A word written stroke by stroke in correct stroke order (KanjiVG data).
 *
 *   state "blank"  nothing drawn yet (space is kept, so layout never jumps)
 *   state "draw"   strokes paint in order; kana appear in their turn
 *   state "done"   the finished word
 *
 * Change `runKey` to replay. Each kanji is one inline SVG sized 1em, so the
 * word takes the font-size of its parent. Until the data has loaded (or for
 * characters without data) the plain text is shown instead.
 */
export function KanjiStrokes({
  word,
  state,
  runKey = 0,
  ghost = true,
  className = "",
  timing,
}: {
  word: string;
  state: "blank" | "draw" | "done";
  runKey?: number | string;
  /** Faint outline of the finished kanji under the ink. */
  ghost?: boolean;
  className?: string;
  timing?: PlanOptions;
}) {
  const [data, setData] = useState<StrokeData | null>(kanjiStrokesIfLoaded);
  useEffect(() => {
    if (data) return;
    let alive = true;
    loadKanjiStrokes().then(
      (d) => alive && setData(d),
      () => undefined
    );
    return () => {
      alive = false;
    };
  }, [data]);

  const plan = useMemo(() => (data ? planStrokes(word, data, timing) : null), [word, data, timing]);

  if (!plan) {
    return (
      <span className={`ks ks--${state} ${className}`.trim()} aria-label={word}>
        <span className="ks-text ks-text--static">{word}</span>
      </span>
    );
  }

  return (
    <span
      key={`${word}-${runKey}`}
      className={`ks ks--${state} ${className}`.trim()}
      role="img"
      aria-label={word}
    >
      {plan.chars.map((c, i) =>
        c.kind === "kanji" ? (
          <svg key={i} className="ks-char" viewBox="0 0 109 109" aria-hidden="true">
            {ghost && (
              <g className="ks-ghost">
                {c.strokes.map((s, k) => (
                  <path key={k} d={s.d} />
                ))}
              </g>
            )}
            <g className="ks-ink">
              {c.strokes.map((s, k) => (
                <path
                  key={k}
                  d={s.d}
                  pathLength={1}
                  style={
                    {
                      animationDelay: `${s.delay}ms`,
                      animationDuration: `${s.duration}ms`,
                    } as CSSProperties
                  }
                />
              ))}
            </g>
          </svg>
        ) : (
          <span
            key={i}
            className="ks-text"
            aria-hidden="true"
            style={{ animationDelay: `${c.start}ms` }}
          >
            {c.ch}
          </span>
        )
      )}
    </span>
  );
}
