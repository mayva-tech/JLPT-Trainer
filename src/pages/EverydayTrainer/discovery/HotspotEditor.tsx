import { useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { wordById } from "../everydayData";
import { hotspotPoints, svgPoints } from "./geometry";
import { validateScene } from "./scenes";
import type { DiscoveryObject, DiscoveryScene, NormPoint } from "./types";

type Props = {
  scene: DiscoveryScene;
  /** Receives the handler for taps on the picture (picture points, 0–1). */
  setPointHandler: Dispatch<SetStateAction<((pt: NormPoint) => void) | null>>;
  /** Drawing shown over the picture, in picture pixels. */
  setOverlay: (node: ReactNode) => void;
};

/**
 * Hotspot editor — for mapping a new picture (a licensed photo dropped into
 * public/discovery/, or a new illustration). Open a scene with
 * `?view=everyday&discover=<scene>&discoverEdit=1`, pick an object, click
 * around it on the picture, Save, and copy the generated `objects` array
 * into the scene file. Development tool only; nothing here is saved.
 */
export function HotspotEditor({ scene, setPointHandler, setOverlay }: Props) {
  const [objects, setObjects] = useState<DiscoveryObject[]>(() => [...scene.objects]);
  const [targetId, setTargetId] = useState(scene.objects[0]?.id ?? "");
  const [newWord, setNewWord] = useState("");
  const [draft, setDraft] = useState<NormPoint[]>([]);
  const [copied, setCopied] = useState(false);
  const W = scene.imageWidth;
  const H = scene.imageHeight;

  useEffect(() => {
    setPointHandler(() => (pt: NormPoint) => setDraft((d) => [...d, pt]));
    return () => setPointHandler(null);
  }, [setPointHandler]);

  useEffect(() => {
    const px = (pts: readonly NormPoint[]) => pts.map(([x, y]) => [x * W, y * H] as const);
    setOverlay(
      <g className="vd-editor-overlay" pointerEvents="none">
        {objects.map((o) => (
          <polygon
            key={o.id}
            points={svgPoints(px(hotspotPoints(o.hotspot)))}
            className={o.id === targetId ? "vd-ed-poly vd-ed-poly--target" : "vd-ed-poly"}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {draft.length > 1 ? (
          <polygon points={svgPoints(px(draft))} className="vd-ed-draft" vectorEffect="non-scaling-stroke" />
        ) : null}
        {px(draft).map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={W / 320} className="vd-ed-point" />
        ))}
      </g>,
    );
    return () => setOverlay(null);
  }, [objects, draft, targetId, setOverlay, W, H]);

  const problems = useMemo(() => validateScene({ ...scene, objects }), [scene, objects]);

  const save = () => {
    if (draft.length < 3 || !targetId) return;
    setObjects((list) => {
      const hotspot = { type: "polygon" as const, points: draft };
      return list.some((o) => o.id === targetId)
        ? list.map((o) => (o.id === targetId ? { ...o, hotspot } : o))
        : [...list, { id: targetId, vocabularyId: targetId, hotspot }];
    });
    setDraft([]);
  };

  const addObject = () => {
    const id = newWord.trim();
    if (!id) return;
    setTargetId(id);
    setNewWord("");
    setDraft([]);
  };

  const code = `  objects: [\n${objects
    .map(
      (o) =>
        `    {\n      id: "${o.id}",\n      vocabularyId: "${o.vocabularyId}",\n      hotspot: { type: "polygon", points: [${hotspotPoints(o.hotspot)
          .map(([x, y]) => `[${x}, ${y}]`)
          .join(", ")}] },\n    },`,
    )
    .join("\n")}\n  ],`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="vd-editor" aria-label="Hotspot editor">
      <h3>Hotspot editor</h3>
      <p>Click around the object on the picture (each click adds a corner), then Save.</p>
      <div className="vd-editor-row">
        <label>
          Object{" "}
          <select value={targetId} onChange={(e) => { setTargetId(e.target.value); setDraft([]); }}>
            {[...new Set([...objects.map((o) => o.id), targetId])].filter(Boolean).map((id) => (
              <option key={id} value={id}>
                {id} {wordById(id) ? `— ${wordById(id)!.english}` : "(unknown word)"}
              </option>
            ))}
          </select>
        </label>
        <label>
          New word id{" "}
          <input value={newWord} onChange={(e) => setNewWord(e.target.value)} placeholder="e.g. kettle" />
        </label>
        <button type="button" className="ev-btn" onClick={addObject} disabled={!newWord.trim()}>
          Add
        </button>
      </div>
      <div className="vd-editor-row">
        <span>{draft.length} points</span>
        <button type="button" className="ev-btn" onClick={() => setDraft((d) => d.slice(0, -1))} disabled={!draft.length}>
          Undo point
        </button>
        <button type="button" className="ev-btn" onClick={() => setDraft([])} disabled={!draft.length}>
          Clear
        </button>
        <button type="button" className="ev-btn ev-btn--primary" onClick={save} disabled={draft.length < 3}>
          Save hotspot
        </button>
        <button type="button" className="ev-btn" onClick={copy}>
          {copied ? "Copied" : "Copy objects array"}
        </button>
      </div>
      {problems.length ? (
        <ul className="vd-editor-problems">
          {problems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      ) : (
        <p className="vd-editor-ok">All objects valid.</p>
      )}
      <textarea readOnly value={code} rows={6} aria-label="Generated objects array" />
    </section>
  );
}
