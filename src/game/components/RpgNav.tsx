export type RpgScreen =
  | "landing"
  | "town"
  | "quests"
  | "stats"
  | "passport"
  | "skills"
  | "daily"
  | "log"
  | "dojo"
  | "dungeon"
  | "quest-run"
  | "quest-result"
  | "quest-fail"
  | "quest-review";

const NAV: { id: RpgScreen; label: string }[] = [
  { id: "landing", label: "Home" },
  { id: "town", label: "Town" },
  { id: "quests", label: "Quests" },
  { id: "daily", label: "Daily" },
  { id: "passport", label: "Passport" },
  { id: "skills", label: "Skills" },
  { id: "stats", label: "Stats" },
  { id: "log", label: "Log" },
  { id: "dojo", label: "Dojo" },
  { id: "dungeon", label: "Dungeon" },
];

type Props = {
  screen: RpgScreen;
  onNavigate: (screen: RpgScreen) => void;
  /** Hide top nav during active quest runs. */
  hidden?: boolean;
};

export function RpgNav({ screen, onNavigate, hidden = false }: Props) {
  if (hidden) return null;
  const active =
    screen === "quest-run" ||
    screen === "quest-result" ||
    screen === "quest-fail" ||
    screen === "quest-review"
      ? "quests"
      : screen;

  return (
    <nav className="ppq-topnav" aria-label="Pera Pera Quest">
      {NAV.map((item) => (
        <button
          key={item.id}
          type="button"
          className={
            active === item.id
              ? "ppq-topnav-btn ppq-topnav-btn--active"
              : "ppq-topnav-btn"
          }
          onClick={() => onNavigate(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
