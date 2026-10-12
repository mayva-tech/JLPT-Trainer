import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./retention.css";

export interface HookMenuOption {
  key: string;
  label: string;
  /** One line under the label. */
  hint: string;
  on: boolean;
}

/**
 * "Hooks ▾" — one dropdown for the video hooks (intro / outro lines, "Can
 * you read this?", "Pause & answer"), so the control bar keeps one button
 * instead of a row of toggles. The menu is portalled to <body> with a fixed
 * position: the control bar scrolls sideways and would clip it otherwise.
 */
export function HookMenu({
  options,
  onToggle,
  className = "furi-btn",
}: {
  options: readonly HookMenuOption[];
  onToggle: (key: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; bottom: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const onCount = options.filter((o) => o.on).length;

  const place = useCallback(() => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const width = 280;
    const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8));
    setPos({ left, bottom: Math.max(8, window.innerHeight - r.top + 6) });
  }, []);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      const t = e.target as Node | null;
      if (t && (menuRef.current?.contains(t) || btnRef.current?.contains(t))) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      // Like the other Player controls, the button never keeps keyboard
      // focus, so the Player's single-key shortcuts keep working.
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", close, true);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      document.removeEventListener("pointerdown", close, true);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={onCount > 0 ? `${className} ${className}--active hook-menu-btn` : `${className} hook-menu-btn`}
        tabIndex={-1}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Video hooks: intro / outro lines and quick checks (Auto Mode)"
        onClick={() => setOpen((o) => !o)}
      >
        Hooks {onCount}/{options.length} <span className="hook-menu-arrow" aria-hidden="true">{open ? "▴" : "▾"}</span>
      </button>
      {open && pos
        ? createPortal(
            <div
              ref={menuRef}
              className="hook-menu"
              role="menu"
              aria-label="Video hooks"
              style={{ left: pos.left, bottom: pos.bottom }}
            >
              <p className="hook-menu-title">Hooks in Auto Mode</p>
              {options.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  role="menuitemcheckbox"
                  aria-checked={o.on}
                  className={o.on ? "hook-menu-item hook-menu-item--on" : "hook-menu-item"}
                  onClick={() => onToggle(o.key)}
                >
                  <span className="hook-menu-check" aria-hidden="true">
                    {o.on ? "✓" : ""}
                  </span>
                  <span className="hook-menu-text">
                    <strong>{o.label}</strong>
                    <small>{o.hint}</small>
                  </span>
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
