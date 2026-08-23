import { registerShifts } from "../../../data/registerShifts";

interface StyleRegisterShiftsProps {
  onSpeakJp: (text: string) => void;
  activePlayId?: string | null;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

export function StyleRegisterShifts({
  onSpeakJp,
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
            <h3 className="ss-shift-speaker">{shift.speaker}</h3>
            <p className="ss-shift-summary">
              {shift.summary}
            </p>
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
                    <span className="ss-shift-context">{ctx.context}</span>
                    <p className="ss-shift-jp" lang="ja">
                      {ctx.japanese}
                      <button
                        type="button"
                        className="ss-speak"
                        aria-label={`Speak Japanese: ${ctx.japanese}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          onSpeakJp(ctx.japanese);
                        }}
                      >
                        🔊
                      </button>
                    </p>
                    <p className="ss-shift-note">
                      {ctx.note}
                    </p>
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
