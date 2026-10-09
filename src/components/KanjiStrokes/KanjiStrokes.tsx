import { useEffect, useId, useMemo, useRef, type CSSProperties } from "react";
import "@fontsource/klee-one/400.css";
import { useKanjiStrokeData } from "./loadStrokes";
import { planStrokes, type PlanOptions } from "./strokePlan";
import { brushShape, brushWidth } from "./brushGeometry";
import { playBrushStrokes } from "./brushSfx";
import "./kanjiStrokes.css";

/**
 * A word written with a brush, stroke by stroke, in correct stroke order
 * (KanjiVG data).
 *
 *   state "blank"  nothing drawn yet (space is kept, so layout never jumps)
 *   state "draw"   strokes paint one at a time; kana appear in their turn
 *   state "done"   the finished word
 *
 * Each stroke is a filled brush shape (heavy where the brush lands, thin
 * where it leaves), revealed along its centre line by a mask, so only one
 * stroke is ever moving. Busy kanji get a lighter brush so small strokes
 * stay apart. Change `runKey` to replay. Each kanji is one inline SVG sized
 * 1em, so the word takes the font-size of its parent. Until the data has
 * loaded (or for characters without data) the plain text is shown instead.
 */
export function KanjiStrokes({
  word,
  state,
  runKey = 0,
  ghost = true,
  weight = 1,
  delayMs = 0,
  className = "",
  timing,
}: {
  word: string;
  state: "blank" | "draw" | "done";
  runKey?: number | string;
  /** Faint outline of the finished kanji under the ink. */
  ghost?: boolean;
  /** Brush width multiplier (1 = default). */
  weight?: number;
  /** Wait this long before the first stroke (e.g. the second word of a pair). */
  delayMs?: number;
  className?: string;
  timing?: PlanOptions;
}) {
  const data = useKanjiStrokeData();
  const uid = `ks${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const plan = useMemo(() => (data ? planStrokes(word, data, timing) : null), [word, data, timing]);
  const shapes = useMemo(
    () =>
      plan?.chars.map((c) =>
        c.kind === "kanji"
          ? c.strokes.map((s) => brushShape(s.d, brushWidth(c.strokes.length) * weight))
          : []
      ) ?? [],
    [plan, weight]
  );

  const rootRef = useRef<HTMLSpanElement>(null);
  // One brush swish per stroke, in step with the ink. Only for a word that is
  // on screen, so a hidden view or off-screen preview stays silent.
  useEffect(() => {
    if (state !== "draw" || !plan) return;
    const el = rootRef.current;
    if (!el || el.getClientRects().length === 0 || el.closest(".app-view--hidden")) return;
    const strokes = plan.chars.flatMap((c) => (c.kind === "kanji" ? c.strokes : []));
    return playBrushStrokes(strokes, delayMs);
  }, [plan, state, runKey, delayMs]);

  if (!plan) {
    return (
      <span className={`ks ks--${state} ${className}`.trim()} aria-label={word}>
        <span className="ks-text ks-text--static">{word}</span>
      </span>
    );
  }

  return (
    <span
      ref={rootRef}
      key={`${word}-${runKey}`}
      className={`ks ks--${state} ${className}`.trim()}
      role="img"
      aria-label={word}
    >
      {plan.chars.map((c, i) => {
        if (c.kind !== "kanji") {
          return (
            <span
              key={i}
              className="ks-text"
              aria-hidden="true"
              style={{ animationDelay: `${c.start + delayMs}ms` }}
            >
              {c.ch}
            </span>
          );
        }
        const charShapes = shapes[i] ?? [];
        return (
          <svg key={i} className="ks-char" viewBox="0 0 109 109" aria-hidden="true">
            <defs>
              {c.strokes.map((s, k) => (
                <mask
                  key={k}
                  id={`${uid}-${i}-${k}`}
                  maskUnits="userSpaceOnUse"
                  x={-20}
                  y={-20}
                  width={149}
                  height={149}
                >
                  <path
                    className="ks-reveal"
                    d={s.d}
                    pathLength={1}
                    strokeWidth={(charShapes[k]?.maxWidth ?? 6) * 1.6 + 2}
                    style={
                      {
                        animationDelay: `${s.delay + delayMs}ms`,
                        animationDuration: `${s.duration}ms`,
                      } as CSSProperties
                    }
                  />
                </mask>
              ))}
            </defs>
            {ghost && (
              <g className="ks-ghost">
                {charShapes.map((b, k) => (
                  <g key={k}>
                    <path d={b.body} />
                    <ellipse
                      cx={b.tip.cx}
                      cy={b.tip.cy}
                      rx={b.tip.rx}
                      ry={b.tip.ry}
                      transform={`rotate(${b.tip.angle} ${b.tip.cx} ${b.tip.cy})`}
                    />
                  </g>
                ))}
              </g>
            )}
            <g className="ks-ink">
              {charShapes.map((b, k) => (
                <g key={k} className="ks-stroke" mask={`url(#${uid}-${i}-${k})`}>
                  <path d={b.body} />
                  <ellipse
                    cx={b.tip.cx}
                    cy={b.tip.cy}
                    rx={b.tip.rx}
                    ry={b.tip.ry}
                    transform={`rotate(${b.tip.angle} ${b.tip.cx} ${b.tip.cy})`}
                  />
                </g>
              ))}
            </g>
          </svg>
        );
      })}
    </span>
  );
}
