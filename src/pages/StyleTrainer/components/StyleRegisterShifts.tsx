import { registerShifts } from "../../../data/registerShifts";

export function StyleRegisterShifts() {
  return (
    <div>
      <p className="ss-shifts-intro">
        The same speaker, different listeners. Gendered Japanese is not a fixed
        property of the person — it moves with the relationship, the setting,
        and how much of themselves they want to show.
      </p>

      {registerShifts.map((shift) => (
        <section key={shift.id} className="ss-shift">
          <h3 className="ss-shift-speaker">{shift.speaker}</h3>
          <p className="ss-shift-summary">{shift.summary}</p>
          <ul className="ss-shift-list">
            {shift.contexts.map((ctx) => (
              <li key={`${shift.id}-${ctx.context}`}>
                <span className="ss-shift-context">{ctx.context}</span>
                <p className="ss-shift-jp" lang="ja">
                  {ctx.japanese}
                </p>
                <p className="ss-shift-note">{ctx.note}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
