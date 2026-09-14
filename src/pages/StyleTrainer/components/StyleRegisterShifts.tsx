import { HighlightedEnglish } from "../../../components/HighlightedEnglish";
import { HighlightedJapanese } from "../../../components/HighlightedJapanese";
import type { SpeechHighlight } from "../../../services/speechService";
import { registerShifts } from "../../../data/registerShifts";
import {
  fieldHighlight,
  type StyleSpeakJp,
  type StyleSpeechTarget,
} from "../styleSpeech";

interface StyleRegisterShiftsProps {
  onSpeakJp: StyleSpeakJp;
  speechTarget?: StyleSpeechTarget | null;
  highlight?: SpeechHighlight | null;
  activePlayId?: string | null;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

export function StyleRegisterShifts({
  onSpeakJp,
  speechTarget = null,
  highlight = null,
  activePlayId = null,
  selectedId = null,
  onSelect,
}: StyleRegisterShiftsProps) {
  return (
    <div>
      <p className="ss-shifts-intro">
        The same speaker, different listeners. Gendered Japanese is not a fixed
        property of the person — it moves with the relationship, the setting,
        and how much of themselves they want to show.
      </p>

      {registerShifts.map((shift) => {
        const shiftSelected = selectedId === shift.id;
        const shiftPlaying =
          activePlayId === shift.id ||
          (activePlayId?.startsWith(`${shift.id}:`) ?? false);

        return (
          <section
            key={shift.id}
            className={[
              "ss-shift",
              shiftSelected ? "ss-shift--selected" : "",
              shiftPlaying ? "ss-shift--playing" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onSelect?.(shift.id)}
          >
            <HighlightedEnglish
              text={shift.speaker}
              className="ss-shift-speaker"
              highlight={fieldHighlight(
                speechTarget,
                highlight,
                shift.id,
                "speaker"
              )}
            />
            <HighlightedEnglish
              text={shift.summary}
              className="ss-shift-summary"
              highlight={fieldHighlight(
                speechTarget,
                highlight,
                shift.id,
                "summary"
              )}
            />
            <ul className="ss-shift-list">
              {shift.contexts.map((ctx) => {
                const ctxId = `${shift.id}:${ctx.context}`;
                return (
                  <li
                    key={ctxId}
                    className={[
                      selectedId === ctxId ? "ss-shift-item--selected" : "",
                      activePlayId === ctxId ? "ss-shift-item--playing" : "",
                    ]
                      .filter(Boolean)
                      .join(" ") || undefined}
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelect?.(ctxId);
                    }}
                  >
                    <HighlightedEnglish
                      text={ctx.context}
                      className="ss-shift-context"
                      highlight={fieldHighlight(
                        speechTarget,
                        highlight,
                        ctxId,
                        "context"
                      )}
                    />
                    <div className="ss-shift-jp" lang="ja">
                      <HighlightedJapanese
                        text={ctx.japanese}
                        className="ss-shift-jp-line"
                        highlight={fieldHighlight(
                          speechTarget,
                          highlight,
                          ctxId,
                          "shift-jp"
                        )}
                      />
                      <button
                        type="button"
                        className="ss-speak"
                        aria-label={`Speak Japanese: ${ctx.japanese}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          onSpeakJp(ctx.japanese, undefined, {
                            id: ctxId,
                            field: "shift-jp",
                          });
                        }}
                      >
                        🔊
                      </button>
                    </div>
                    <HighlightedEnglish
                      text={ctx.note}
                      className="ss-shift-note"
                      highlight={fieldHighlight(
                        speechTarget,
                        highlight,
                        ctxId,
                        "note"
                      )}
                    />
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
