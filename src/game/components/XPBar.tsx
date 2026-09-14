import { getLevelProgress } from "../../utils/gameMode";

type Props = {
  totalXp: number;
  showLevel?: boolean;
};

export function XPBar({ totalXp, showLevel = true }: Props) {
  const progress = getLevelProgress(totalXp);
  return (
    <div className="gm-xp">
      {showLevel ? (
        <div className="gm-xp__meta">
          <span className="gm-xp__level">Lv {progress.level}</span>
          <span className="gm-xp__nums">
            {progress.xpIntoLevel} / {progress.xpForNext} XP
          </span>
        </div>
      ) : null}
      <div
        className="gm-xp__track"
        role="progressbar"
        aria-valuenow={Math.round(progress.progressRatio * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="gm-xp__fill"
          style={{ width: `${Math.round(progress.progressRatio * 100)}%` }}
        />
      </div>
    </div>
  );
}
