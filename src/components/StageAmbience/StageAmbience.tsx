import { useEffect, useRef, useState } from "react";
import type { AmbienceTheme } from "./themes";
import { AmbienceArt } from "./art";
import { AmbiencePan } from "./AmbiencePan";
import "./stageAmbience.css";

/** How long the old background takes to fade out (matches the CSS). */
export const AMBIENCE_FADE_MS = 900;

interface Layer {
  key: number;
  theme: AmbienceTheme;
  leaving: boolean;
}

/**
 * A quiet themed background behind the stage content.
 *
 * Sits under every card (z-index -1 inside the isolated `.stage`), keeps the
 * centre of the stage calm with a scrim, and cross-fades when the theme
 * changes. Pass `null` to show the plain stage.
 */
export function StageAmbience({
  theme,
  glyphs = "",
  panButtons = true,
}: {
  theme: AmbienceTheme | null;
  /** Kanji of the word on screen, written into signs, strips and lanterns. */
  glyphs?: string;
  /** ‹ › buttons in the parent's corner for sliding a cropped scene. */
  panButtons?: boolean;
}) {
  const nextKey = useRef(1);
  const [layers, setLayers] = useState<Layer[]>(() =>
    theme ? [{ key: 0, theme, leaving: false }] : [],
  );

  useEffect(() => {
    setLayers((prev) => {
      const current = prev.find((l) => !l.leaving);
      if ((current?.theme ?? null) === theme) return prev;
      const kept = prev
        .filter((l) => !l.leaving)
        .map((l) => ({ ...l, leaving: true }));
      return theme
        ? [...kept, { key: nextKey.current++, theme, leaving: false }]
        : kept;
    });
    const timer = window.setTimeout(() => {
      setLayers((prev) => {
        const live = prev.filter((l) => !l.leaving);
        return live.length === prev.length ? prev : live;
      });
    }, AMBIENCE_FADE_MS);
    return () => window.clearTimeout(timer);
  }, [theme]);

  if (layers.length === 0) return null;

  return (
    <>
    {panButtons && <AmbiencePan />}
    <div className="amb" aria-hidden="true">
      {layers.map((layer) => (
        <div
          key={layer.key}
          className={
            layer.leaving
              ? `amb-layer amb-layer--${layer.theme} amb-layer--leaving`
              : `amb-layer amb-layer--${layer.theme}`
          }
          data-theme={layer.theme}
        >
          <div className="amb-wash" />
          <AmbienceArt theme={layer.theme} glyphs={glyphs} />
        </div>
      ))}
      <div className="amb-scrim" />
    </div>
    </>
  );
}
