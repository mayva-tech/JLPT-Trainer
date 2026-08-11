import { HighlightedEnglish } from "./HighlightedEnglish";
import { HighlightedJapanese } from "./HighlightedJapanese";
import type { InterviewLine } from "../data/interviewPrep";
import type { SpeechHighlight } from "../services/speechService";

type Props = {
  chip: string;
  /** Spoken section title (Nanami). */
  titleJa: string;
  /** Spoken section title (Andrew). Unused when nanamiOnly. */
  titleEn?: string;
  /** True while Nanami/Andrew announce the section title. */
  announcingTitle: boolean;
  /** Nanami-only track (N3 JP+EN mix) — no Andrew English block. */
  nanamiOnly?: boolean;
  lines: InterviewLine[];
  english?: string;
  activeLang: "ja" | "en" | null;
  jaHighlight: SpeechHighlight | null;
  enHighlight: SpeechHighlight | null;
};

function localHighlight(
  highlight: SpeechHighlight | null,
  lineStart: number,
  lineLength: number
): SpeechHighlight | null {
  if (!highlight || lineLength <= 0) return null;
  const lineEnd = lineStart + lineLength;
  if (highlight.end <= lineStart || highlight.start >= lineEnd) return null;
  return {
    start: Math.max(0, highlight.start - lineStart),
    end: Math.min(lineLength, highlight.end - lineStart),
  };
}

/** Interview stage: title karaoke, then scrollable JA+romaji (+ optional English). */
export function InterviewPracticeDisplay({
  chip,
  titleJa,
  titleEn = "",
  announcingTitle,
  nanamiOnly = false,
  lines,
  english = "",
  activeLang,
  jaHighlight,
  enHighlight,
}: Props) {
  let offset = 0;

  return (
    <div className="safe-area safe-area--hook safe-area--interview">
      <div className="hook-display hook-display--interview card-fade">
        <div className="category-chip category-chip--interview">{chip}</div>

        {announcingTitle ? (
          <div className="interview-title-announce">
            <HighlightedJapanese
              text={titleJa}
              className={
                activeLang === "ja"
                  ? "hook-line hook-line--ja hook-line--active interview-title-ja"
                  : "hook-line hook-line--ja interview-title-ja"
              }
              highlight={activeLang === "ja" ? jaHighlight : null}
            />
            {!nanamiOnly && titleEn ? (
              <HighlightedEnglish
                text={titleEn}
                className={
                  activeLang === "en"
                    ? "hook-line hook-line--en hook-line--active interview-title-en"
                    : "hook-line hook-line--en interview-title-en"
                }
                highlight={activeLang === "en" ? enHighlight : null}
              />
            ) : null}
          </div>
        ) : (
          <>
            <div className="interview-lines">
              {lines.map((line, index) => {
                const lineStart = offset;
                offset += line.japanese.length;
                const lineHighlight = localHighlight(
                  jaHighlight,
                  lineStart,
                  line.japanese.length
                );
                return (
                  <div
                    className={
                      lineHighlight
                        ? "interview-line interview-line--active"
                        : "interview-line"
                    }
                    key={`${lineStart}-${index}`}
                  >
                    <HighlightedJapanese
                      text={line.japanese}
                      className={
                        activeLang === "ja"
                          ? "hook-line hook-line--ja hook-line--active"
                          : "hook-line hook-line--ja"
                      }
                      highlight={lineHighlight}
                    />
                    <div className="interview-romaji">{line.romaji}</div>
                  </div>
                );
              })}
            </div>
            {!nanamiOnly && english ? (
              <div
                className={
                  activeLang === "en"
                    ? "interview-english interview-english--active"
                    : "interview-english"
                }
              >
                <div className="interview-english-label">
                  Andrew · Simple English
                </div>
                <HighlightedEnglish
                  text={english}
                  className={
                    activeLang === "en"
                      ? "hook-line hook-line--en hook-line--active"
                      : "hook-line hook-line--en"
                  }
                  highlight={enHighlight}
                />
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
