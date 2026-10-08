import type { ReactNode } from "react";
import "./retention.css";

/**
 * "Can you read this?" — wraps the word card. While active the word stays
 * sharp but its reading, meaning, pitch line, picture and nuance are hidden
 * (their space is kept, so nothing moves at the reveal). Inactive, it
 * renders the card untouched.
 */
export function ReadHook({ active, children }: { active: boolean; children: ReactNode }) {
  return <div className={active ? "ret-hook ret-hook--on" : "ret-hook"}>{children}</div>;
}

/**
 * The banner, anchored just above the word (WordCard's `overlay` slot).
 * The countdown ring appears once `ms` is set and restarts per `runKey`.
 */
export function ReadHookBanner({ ms, runKey }: { ms: number; runKey: number | string }) {
  return (
    <div className="ret-hook-banner">
      <span className="ret-hook-en">Can you read this?</span>
      <span className="ret-hook-ja" lang="ja">
        読めますか？
      </span>
      {ms > 0 && (
        <span
          key={runKey}
          className="ret-ring"
          style={{ animationDuration: `${ms}ms` }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
