# Visual Discovery (写真で日本語) — scenes, pictures and hotspots

Visual Discovery lives inside Everyday Japanese and reuses its words
(`scripts/everyday/words.tsv`), voices (`useEverydaySpeech` → speechService:
Nanami / Andrew) and progress (`jlpt-trainer:everyday:v1`). Its own key,
`jlpt-trainer:everyday-discovery:v1`, only holds what is scene-specific:
objects found per scene, Find-it/Listen rounds, the last scene and the page
preferences.

Open it from the Everyday home ("Visual Discovery"), or directly:

- `?view=everyday&discover=1` — the scene gallery
- `?view=everyday&discover=kitchen` — one scene
- `…&discoverEdit=1` — adds the hotspot editor (for mapping new pictures)

## Files

| File | What it is |
| --- | --- |
| `types.ts` | `DiscoveryScene`, `DiscoveryObject`, `Hotspot` (normalized 0–1) |
| `scenes/*.ts` | One file per scene: picture, size, location, objects + hotspots |
| `scenes/index.ts` | Gallery order, `validateScene` |
| `art/*.tsx` | The original illustrations (1600 × 1000, each object one `<g data-obj>`) |
| `geometry.ts` | Hit testing, zoom/pan (viewBox), screen ⇄ picture with letterboxing, marker placement |
| `SceneView.tsx` | The interactive scene (tap, pinch, Ctrl+wheel, ± buttons, keyboard) |
| `VisualDiscovery.tsx` | Gallery, Explore / Find it / Listen / Guided |
| `discoveryProgress.ts`, `discoveryQuiz.ts` | Pure state logic (tested) |
| `HotspotEditor.tsx` | Click-to-map tool for new pictures |

## Adding a scene

1. Every object must be an existing Everyday word (add missing words to
   `scripts/everyday/words.tsv` and run `node scripts/generateEveryday.mjs`).
   The word must list the scene's location in its categories.
2. Add the picture (see the asset rules below) and a `scenes/<id>.ts` file
   like `kitchen.ts`; add it to `DISCOVERY_SCENES` in `scenes/index.ts`.
3. Map the hotspots (next section), then run the pipeline. The corpus test
   (`discovery.corpus.test.ts`) checks every scene: valid words, 10–15
   objects, normalized polygons with area, Find-it prompts, markers.

## Mapping hotspots on a photo

1. Put the photo in `public/discovery/<file>` and set
   `imagePath: "photo:<file>"`, `imageWidth` / `imageHeight` to the photo's
   pixel size, and `credit` (author, licence, source URL).
2. Open `?view=everyday&discover=<scene>&discoverEdit=1`, press
   **Edit hotspots**, choose an object (or type a new word id and **Add**),
   click around the object's outline on the picture, **Save hotspot**.
   Zoom in (＋) for small objects — points stay exact at any zoom.
3. **Copy objects array** and paste it into the scene file. The editor shows
   validation problems live.

Outline what a learner would tap: the whole visible object, not its shadow.
Where objects overlap (a microwave on a fridge, a knife on a board) just
outline each one fully — the smaller hotspot wins a tap automatically.

## How the illustrated scenes were mapped

Each object in `art/*.tsx` is its own `<g data-obj="…">`. The hotspots were
traced in a browser: render the scene, hide one object, and the pixels that
change are exactly that object's *visible* part (what is in front of it is
excluded). That mask was closed, padded ~3 px for fingers, outlined, and
simplified to ≤ 28 points (convex outline, or the true outline for shapes
like the passenger, the faucet or a pole). The corpus test checks that the
art and the hotspot list name the same objects.

## Picture (asset) rules

- **Rights:** only original illustrations, your own photos, or photos whose
  licence allows redistribution (CC0 / CC BY / CC BY-SA, credited exactly as
  required). No scraped or stock photos without a licence.
- **Japan, accurately:** Japanese fixtures and layout; no garbled or fake
  Japanese text. Any signage must be correct Japanese.
- **Every object visible:** each mapped object must be clearly visible and
  at least ~40 px across at 1600 px wide (thin poles and straps are fine —
  they get a finger margin and a marker).
- **Size:** 1600 × 1000 (16:10) preferred; any size works as long as
  `imageWidth`/`imageHeight` match it. WebP, ≤ 300 KB.
- **Loading:** photos are served from `public/` (not bundled) and load only
  when the scene opens; a failed load shows a message instead of a blank,
  tappable picture.

## Play all — the scene show (for recording)

**Play all** (toolbar, any mode) switches to Guided and plays the scene
hands-free, built for screen recording:

1. **Intro** — a short Nanami ⇄ Andrew exchange about the place
   (`sceneScripts.ts`, one script per scene; Japanese lines in furigana
   notation with an English subtitle, shown as a caption over the scene).
2. **Every object** — hook first (Player rule): the object is lit, its name
   hidden behind "What's this called in Japanese? これは何ですか？" with
   the 2.5 s countdown ring; the line is spoken on the first object only.
   Then the name: Nanami (Japanese), Andrew (English).
3. **Pause & answer** after every 5th object (`sceneShow.ts`, same timings
   as the Player): odd checks "What's this in Japanese?" with three words,
   even checks "Where is the 〇〇?" — answer revealed after the 5 s ring.
4. **Outro** — Nanami ⇄ Andrew wrap-up with a recap of every word, ending
   on a comment question.

Toggles beside the controls: 🎬 Intro & outro (saved per page), 読 Hook
and ⏸ Quiz (shared with the Player's retention settings). Pause / Resume /
⏮ ⏭ work at any point. A new scene's script is one entry in
`SCENE_SCRIPTS`; the test checks every scene has one.
