import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { COSTUMES, type Costume, type CostumeId } from "./costumes";

/** Japanese label with its reading as ruby when it has kanji. */
function JaLabel({
  ja,
  reading,
  before,
  after,
}: {
  ja: string;
  reading?: string;
  before?: string;
  after?: string;
}): ReactNode {
  return (
    <>
      {before}
      {reading ? (
        <ruby>
          {ja}
          <rt>{reading}</rt>
        </ruby>
      ) : (
        ja
      )}
      {after}
    </>
  );
}

const EDGE = 6;

/**
 * One-row strip of costumes opened beside a head's hanger button (marked
 * `data-costume-opener`). Picking one puts it on; "Normal clothes" takes it
 * off. Arrow keys move, Escape closes, and a click anywhere else closes it too.
 */
export function CostumePicker({
  current,
  label = "Costumes",
  onPick,
  onClose,
}: {
  current: Costume | null;
  label?: string;
  onPick: (id: CostumeId | null) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [left, setLeft] = useState(false);
  const [shift, setShift] = useState(0);

  // Open to the right; flip left when that runs off screen, and nudge it back
  // inside the window if neither side has the room.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const vw = window.innerWidth;
    let r = el.getBoundingClientRect();
    if (r.width === 0) return;
    let flip = false;
    if (r.right > vw - EDGE) {
      el.classList.add("th-costume-menu--left");
      const l = el.getBoundingClientRect();
      if (EDGE - l.left < r.right - (vw - EDGE)) {
        flip = true;
        r = l;
      }
      el.classList.remove("th-costume-menu--left");
    }
    setLeft(flip);
    if (r.right > vw - EDGE) setShift(vw - EDGE - r.right);
    else if (r.left < EDGE) setShift(EDGE - r.left);
  }, []);

  // Focus the current choice once, when the menu opens.
  useEffect(() => {
    ref.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus();
  }, []);

  useEffect(() => {
    const el = ref.current;
    const onDown = (e: PointerEvent) => {
      const opener = (e.target as Element | null)?.closest?.("[data-costume-opener]");
      if (el && !el.contains(e.target as Node) && !opener) onClose();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [onClose]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const items = [...(ref.current?.querySelectorAll<HTMLButtonElement>("button") ?? [])];
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    const next = items[(i + step + items.length) % items.length];
    next?.focus();
  };

  const item = (id: CostumeId | null, label: string, ja: ReactNode) => (
    <button
      key={id ?? "off"}
      type="button"
      className="th-costume-item"
      aria-pressed={(current?.id ?? null) === id}
      onClick={() => onPick(id)}
    >
      <span className="th-costume-ja" lang="ja">
        {ja}
      </span>
      <span className="th-costume-en">{label}</span>
    </button>
  );

  return (
    <div
      ref={ref}
      className={`th-costume-menu${left ? " th-costume-menu--left" : ""}`}
      style={shift ? ({ "--th-menu-shift": `${shift}px` } as CSSProperties) : undefined}
      role="group"
      aria-label={label}
      onKeyDown={onKeyDown}
      onPointerDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      {item(null, "Normal clothes", <JaLabel ja="普段着" reading="ふだんぎ" />)}
      {COSTUMES.map((c) => item(c.id, c.label, <JaLabel ja={c.ja} reading={c.reading} before={c.jaBefore} after={c.jaAfter} />))}
    </div>
  );
}
