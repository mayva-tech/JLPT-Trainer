import { useEffect, useRef, useState } from "react";
import type React from "react";
import { PAN_STEP, useAmbiencePan } from "./useAmbiencePan";

/** Scenes are drawn on a 1600×900 canvas. */
const SCENE_ASPECT = 16 / 9;
/** Holding a button keeps the scene gliding after this delay, one step per tick. */
const HOLD_DELAY_MS = 320;
const HOLD_TICK_MS = 70;

/**
 * ‹ › buttons that slide a cropped backdrop sideways in small steps (hold to
 * keep sliding). Only shown when the stage is narrower than the scene, i.e.
 * when part of the art is cut off. `fixed` measures the window (the app-shell
 * backdrop); otherwise the positioned parent the buttons sit in.
 */
export function AmbiencePan({ fixed = false }: { fixed?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const holdTimer = useRef<number | null>(null);
  const [cropped, setCropped] = useState(false);
  const [pan, shift] = useAmbiencePan();

  useEffect(() => {
    const measure = (width: number, height: number) =>
      setCropped(height > 0 && width / height < SCENE_ASPECT - 0.05);

    if (fixed) {
      const onResize = () => measure(window.innerWidth, window.innerHeight);
      onResize();
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    const parent = ref.current?.parentElement;
    if (!parent || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) measure(entry.contentRect.width, entry.contentRect.height);
    });
    observer.observe(parent);
    return () => observer.disconnect();
  }, [fixed]);

  const stopHold = () => {
    if (holdTimer.current !== null) {
      window.clearTimeout(holdTimer.current);
      window.clearInterval(holdTimer.current);
      holdTimer.current = null;
    }
  };

  useEffect(() => stopHold, []);

  const startHold = (delta: number) => {
    stopHold();
    shift(delta);
    holdTimer.current = window.setTimeout(() => {
      holdTimer.current = window.setInterval(() => shift(delta), HOLD_TICK_MS);
    }, HOLD_DELAY_MS);
  };

  const buttonProps = (delta: number, label: string, disabled: boolean) => ({
    type: "button" as const,
    className: "amb-pan-btn",
    "aria-label": label,
    title: `${label} (hold to keep sliding)`,
    disabled,
    onPointerDown: (e: React.PointerEvent) => {
      if (e.button === 0) startHold(delta);
    },
    onPointerUp: stopHold,
    onPointerLeave: stopHold,
    onPointerCancel: stopHold,
    // Keyboard activation (Enter / Space) arrives as a click with detail 0.
    onClick: (e: React.MouseEvent) => {
      if (e.detail === 0) shift(delta);
    },
  });

  // A button that turns disabled at the edge never sees its pointerup.
  useEffect(() => {
    if (pan <= 0 || pan >= 1) stopHold();
  }, [pan]);

  return (
    <div
      ref={ref}
      className={`amb-pan${fixed ? " amb-pan--fixed" : ""}`}
      hidden={!cropped}
    >
      <button {...buttonProps(-PAN_STEP, "Shift backdrop left", pan <= 0)}>‹</button>
      <button {...buttonProps(PAN_STEP, "Shift backdrop right", pan >= 1)}>›</button>
    </div>
  );
}