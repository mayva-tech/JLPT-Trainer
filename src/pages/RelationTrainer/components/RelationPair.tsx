import { useLayoutEffect, useRef, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  watch: string;
}

function wordNeed(word: HTMLElement): number {
  const jp = word.querySelector<HTMLElement>(".rt-word-jp");
  if (!jp) return word.scrollWidth;
  const line = jp.querySelector<HTMLElement>(".jp-wrap-line") ?? jp;
  return Math.max(line.scrollWidth, jp.scrollWidth, word.scrollWidth);
}

function fitPairToSingleLine(pair: HTMLElement) {
  pair.style.setProperty("--fit-scale", "1");
  void pair.offsetWidth;

  const words = [
    ...pair.querySelectorAll<HTMLElement>(":scope > .rt-word"),
  ];
  const flex = getComputedStyle(pair).display === "flex";

  if (!flex) {
    let scale = 1;
    for (const word of words) {
      const need = wordNeed(word);
      const cap = Math.max(64, word.clientWidth);
      if (need > cap + 1) {
        scale = Math.min(scale, Math.max(0.32, cap / need));
      }
    }
    pair.style.setProperty("--fit-scale", String(scale));
    return;
  }

  const style = getComputedStyle(pair);
  const gap = Number.parseFloat(style.columnGap || style.gap || "0") || 0;
  const symbol = pair.querySelector<HTMLElement>(":scope > .rt-symbol");
  const items = words.length + (symbol ? 1 : 0);
  const total =
    words.reduce((sum, word) => sum + wordNeed(word), 0) +
    (symbol?.offsetWidth ?? 0) +
    gap * Math.max(0, items - 1);

  const cap = pair.clientWidth;
  const scale = total > cap + 1 ? Math.max(0.32, cap / total) : 1;
  pair.style.setProperty("--fit-scale", String(scale));
}

export function RelationPair({ children, watch }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const pair = ref.current;
    if (!pair) return;

    const fit = () => fitPairToSingleLine(pair);
    fit();

    const ro = new ResizeObserver(fit);
    ro.observe(pair);
    if (pair.parentElement) ro.observe(pair.parentElement);
    return () => ro.disconnect();
  }, [watch]);

  return (
    <div
      ref={ref}
      className="rt-pair"
      style={{ ["--fit-scale" as string]: 1 }}
    >
      {children}
    </div>
  );
}
