import { Furigana } from "../../lib/japanese/furigana";
import type { ItemHookState } from "../../utils/itemHookSpeech";
import "./retention.css";

/**
 * The per-item intro / outro hook over the stage. The line being spoken is
 * big (Andrew → English, Nanami → Japanese with furigana), the other
 * language sits under it as a subtitle.
 */
export function ItemHookCard({ state }: { state: ItemHookState }) {
  const { hook } = state;
  const ja = (
    <span lang="ja">
      <Furigana text={hook.ja} />
    </span>
  );
  return (
    <div className={`ih-overlay ih-overlay--${hook.kind}`} key={state.key} aria-live="polite">
      <div className={`ih-card ih-card--${hook.voice}`} data-head-avoid>
        <span className="ih-tag">
          {hook.kind === "intro" ? "▶" : "✦"} {hook.tag}
        </span>
        <p className="ih-main">{hook.voice === "ja" ? ja : hook.en}</p>
        {hook.choices?.length ? (
          <ol className="ih-choices" lang="ja">
            {hook.choices.map((c, i) => (
              <li key={c}>
                <span>{i + 1}</span>
                {c}
              </li>
            ))}
          </ol>
        ) : null}
        <p className="ih-sub">{hook.voice === "ja" ? hook.en : ja}</p>
      </div>
    </div>
  );
}
