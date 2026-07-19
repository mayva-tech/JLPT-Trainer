import { alignFurigana } from "../utils/alignFurigana";
import type { FuriganaSegment } from "../utils/alignFurigana";
import { buildJapaneseHighlightUnits } from "../utils/speechHighlightUnits";
import type { SpeechHighlight } from "../services/speechService";

type Props = {
  surface: string;
  reading: string;
  className: string;
  highlight?: SpeechHighlight | null;
  showFurigana?: boolean;
};

type Piece = {
  text: string;
  reading?: string;
  start: number;
  end: number;
};

/**
 * Phrase/sentence with optional furigana.
 * Word groups match speech karaoke units (buildJapaneseHighlightUnits) so
 * highlights for している → して|いる land on the same spans the voice uses.
 */
export function FuriganaWrapText({
  surface,
  reading,
  className,
  highlight = null,
  showFurigana = true,
}: Props) {
  const segments = alignFurigana(surface, reading);
  const pieces = segmentsToPieces(segments);
  const units = buildJapaneseHighlightUnits(surface);
  const groups = assignPiecesToWordUnits(pieces, units);
  const anyReading = showFurigana && pieces.some((p) => !!p.reading);

  return (
    <div
      className={`jp-wrap furigana-wrap ${showFurigana ? "" : "furigana-hidden"} ${className}`.trim()}
    >
      <span className="jp-wrap-line">
        {groups.map((group, gi) => (
          <span className="jp-word" key={`w-${gi}-${group[0]?.start ?? 0}`}>
            {group.map((piece) => {
              let state = "";
              if (highlight) {
                if (highlight.start < piece.end && highlight.end > piece.start) {
                  state = "speech-active";
                } else if (piece.end <= highlight.start) {
                  state = "speech-spoken";
                }
              }
              return (
                <FuriCell
                  key={`${piece.start}-${piece.text}`}
                  segment={{ text: piece.text, reading: piece.reading }}
                  state={state}
                  showFurigana={showFurigana}
                  reserveReadingSpace={anyReading}
                />
              );
            })}
          </span>
        ))}
      </span>
    </div>
  );
}

function segmentsToPieces(segments: FuriganaSegment[]): Piece[] {
  const pieces: Piece[] = [];
  let offset = 0;
  for (const seg of segments) {
    const start = offset;
    const end = offset + seg.text.length;
    offset = end;
    pieces.push({
      text: seg.text,
      reading: seg.reading,
      start,
      end,
    });
  }
  return pieces;
}

/**
 * Place each furigana piece into word-wrap units (same breaks as shadowing).
 * Plain pieces that span multiple words are split so lines can break.
 * Pieces with readings stay intact (moved wholly into the unit that contains their start).
 */
function assignPiecesToWordUnits(
  pieces: Piece[],
  units: { text: string; start: number; end: number }[]
): Piece[][] {
  if (units.length === 0) return pieces.length ? [pieces] : [];

  const groups: Piece[][] = units.map(() => []);

  for (const piece of pieces) {
    if (piece.reading) {
      const ui = units.findIndex(
        (u) => piece.start >= u.start && piece.start < u.end
      );
      groups[ui >= 0 ? ui : groups.length - 1]!.push(piece);
      continue;
    }

    // Split plain text across word boundaries
    let cursor = piece.start;
    const chars = piece.text;
    let local = 0;
    while (cursor < piece.end) {
      const ui = units.findIndex((u) => cursor >= u.start && cursor < u.end);
      const unit = units[ui >= 0 ? ui : units.length - 1]!;
      const sliceEnd = Math.min(piece.end, unit.end);
      const take = sliceEnd - cursor;
      const text = chars.slice(local, local + take);
      groups[ui >= 0 ? ui : groups.length - 1]!.push({
        text,
        start: cursor,
        end: sliceEnd,
      });
      cursor = sliceEnd;
      local += take;
    }
  }

  return groups.filter((g) => g.length > 0);
}

function FuriCell({
  segment,
  state,
  showFurigana,
  reserveReadingSpace,
}: {
  segment: FuriganaSegment;
  state: string;
  showFurigana: boolean;
  reserveReadingSpace: boolean;
}) {
  const reading =
    showFurigana && segment.reading ? segment.reading : null;

  return (
    <span
      className={`furi-cell ${reading ? "" : "furi-cell--plain"} ${state}`.trim()}
    >
      <span className="furi-surface">{segment.text}</span>
      {reading ? (
        <span className="furi-reading" aria-hidden="true">
          {reading}
        </span>
      ) : reserveReadingSpace ? (
        <span className="furi-reading furi-reading--spacer" aria-hidden="true" />
      ) : null}
    </span>
  );
}
