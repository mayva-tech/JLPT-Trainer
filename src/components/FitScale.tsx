import {
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";

type Props = {
  /** Maximum number of visual lines allowed before shrinking. */
  maxLines: number;
  /** Re-run fitting when this value changes (text, furigana, etc.). */
  watch: unknown;
  className?: string;
  children: ReactNode;
  minScale?: number;
};

function countJpLines(root: HTMLElement): number {
  const words = root.querySelectorAll<HTMLElement>(".jp-word");
  if (words.length === 0) return 1;
  let lines = 0;
  let lastTop = Number.NaN;
  words.forEach((w) => {
    if (w.offsetTop !== lastTop) {
      lines += 1;
      lastTop = w.offsetTop;
    }
  });
  return Math.max(1, lines);
}

function overlapsTopChrome(wrap: HTMLElement): boolean {
  const stage = wrap.closest(".stage");
  if (!stage) return false;
  const label =
    (stage.querySelector(".progress-label") as HTMLElement | null) ??
    (stage.querySelector(".lesson-label") as HTMLElement | null);
  if (!label) return false;
  const wrapTop = wrap.getBoundingClientRect().top;
  const labelBottom = label.getBoundingClientRect().bottom;
  return wrapTop < labelBottom + 10;
}

function exceedsJaHeightBudget(root: HTMLElement, wrap: HTMLElement): boolean {
  const safe = root.closest(".safe-area") as HTMLElement | null;
  if (!safe) return false;

  const meaning = safe.querySelector(
    ".sentence-meaning"
  ) as HTMLElement | null;
  const cue = safe.querySelector(
    ".shadowing-cue, .shadowing-ellipsis"
  ) as HTMLElement | null;
  const reserved =
    (meaning?.offsetHeight ?? 0) +
    (cue?.offsetHeight ?? 0) +
    safe.clientHeight * 0.08;
  const maxH = Math.max(safe.clientHeight - reserved, safe.clientHeight * 0.35);
  return wrap.scrollHeight > maxH + 1;
}

function overflowsSingleLine(root: HTMLElement): boolean {
  const el =
    (root.querySelector(
      ".sentence-meaning, .phrase-meaning"
    ) as HTMLElement | null) ??
    (root.firstElementChild as HTMLElement | null) ??
    root;
  // Width-only check. Do not use getClientRects() — inline word spans can
  // report multiple rects on a single visual line and over-shrink to minScale.
  return el.scrollWidth > el.clientWidth + 1;
}

function overflowsMaxLines(root: HTMLElement, maxLines: number): boolean {
  if (maxLines <= 1) return overflowsSingleLine(root);

  if (countJpLines(root) > maxLines) return true;

  const wrap =
    (root.querySelector(".jp-wrap") as HTMLElement | null) ?? root;
  if (exceedsJaHeightBudget(root, wrap)) return true;
  if (overlapsTopChrome(wrap)) return true;
  return false;
}

/**
 * Shrinks `--fit-scale` on this wrapper until children fit within `maxLines`
 * (and for Japanese, clear top labels / stay within safe-area height).
 * Descendants use `font-size: calc(Ncqw * var(--fit-scale, 1))`.
 */
export function FitScale({
  maxLines,
  watch,
  className,
  children,
  minScale,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  // English single-line fit must stay readable; JP can shrink further.
  const floor = minScale ?? (maxLines <= 1 ? 0.72 : 0.36);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const apply = (scale: number) => {
      root.style.setProperty("--fit-scale", String(scale));
    };

    let lastWidth = -1;
    let lastHeight = -1;

    const fit = () => {
      apply(1);
      void root.offsetHeight;
      if (!overflowsMaxLines(root, maxLines)) {
        lastWidth = root.clientWidth;
        lastHeight = root.clientHeight;
        return;
      }

      let lo = floor;
      let hi = 1;
      for (let i = 0; i < 16; i++) {
        const mid = (lo + hi) / 2;
        apply(mid);
        void root.offsetHeight;
        if (overflowsMaxLines(root, maxLines)) hi = mid;
        else lo = mid;
      }
      apply(lo);
      lastWidth = root.clientWidth;
      lastHeight = root.clientHeight;
    };

    fit();

    const ro = new ResizeObserver(() => {
      const w = root.clientWidth;
      const h = root.clientHeight;
      if (Math.abs(w - lastWidth) < 1 && Math.abs(h - lastHeight) < 1) return;
      fit();
    });
    const stage = root.closest(".stage");
    if (stage) ro.observe(stage);
    else if (root.parentElement) ro.observe(root.parentElement);

    return () => ro.disconnect();
  }, [watch, maxLines, floor]);

  const style = { ["--fit-scale" as string]: 1 } as CSSProperties;

  return (
    <div
      ref={ref}
      className={["fit-scale", className].filter(Boolean).join(" ")}
      style={style}
    >
      {children}
    </div>
  );
}
