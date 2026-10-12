import { useEffect, useRef, useState, type RefObject } from "react";
import { stopDrift, useAmbiencePan } from "./useAmbiencePan";

/** Scenes are drawn on a 1600×900 canvas. */
const SCENE_ASPECT = 16 / 9;

/**
 * ‹ › buttons that set a cropped backdrop drifting slowly sideways, turning
 * round at each edge. Only shown when the stage is narrower than the scene,
 * i.e. when part of the art is cut off. `fixed` measures the window (the
 * app-shell backdrop); `stageRef` measures that stage, for buttons sitting in
 * a control bar; otherwise the positioned parent the buttons sit in.
 */
export function AmbiencePan({
  fixed = false,
  stageRef,
}: {
  fixed?: boolean;
  stageRef?: RefObject<HTMLElement | null>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [cropped, setCropped] = useState(false);
  const { drift, toggleDrift } = useAmbiencePan();

  useEffect(() => {
    const measure = (width: number, height: number) =>
      setCropped(height > 0 && width / height < SCENE_ASPECT - 0.05);

    if (fixed) {
      const onResize = () => measure(window.innerWidth, window.innerHeight);
      onResize();
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    const target = stageRef ? stageRef.current : ref.current?.parentElement;
    if (!target || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) measure(entry.contentRect.width, entry.contentRect.height);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [fixed, stageRef]);

  // Widened until nothing is cut off: there is nothing left to drift across.
  const wasCropped = useRef(false);
  useEffect(() => {
    if (wasCropped.current && !cropped) stopDrift();
    wasCropped.current = cropped;
  }, [cropped]);

  const button = (direction: -1 | 1, label: string, glyph: string) => {
    const on = drift === direction;
    const className = stageRef
      ? on
        ? "furi-btn furi-btn--active amb-pan-bar-btn"
        : "furi-btn amb-pan-bar-btn"
      : on
        ? "amb-pan-btn amb-pan-btn--on"
        : "amb-pan-btn";
    return (
      <button
        type="button"
        className={className}
        aria-label={label}
        aria-pressed={on}
        tabIndex={stageRef ? -1 : undefined}
        title={on ? "Stop the backdrop" : `${label} (slowly, back and forth)`}
        onClick={() => toggleDrift(direction)}
      >
        {glyph}
      </button>
    );
  };

  return (
    <div
      ref={ref}
      className={`amb-pan${fixed ? " amb-pan--fixed" : ""}${stageRef ? " amb-pan--bar" : ""}`}
      hidden={!cropped}
    >
      {button(-1, "Drift backdrop left", "‹")}
      {button(1, "Drift backdrop right", "›")}
    </div>
  );
}
