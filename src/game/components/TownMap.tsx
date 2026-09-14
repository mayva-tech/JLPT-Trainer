import { listLocationsWithStatus } from "../utils/locationStatus";
import type { LocationId, PlayerRpgProfile } from "../types";

type Props = {
  profile: PlayerRpgProfile;
  onSelect: (locationId: LocationId) => void;
};

const CHAPTER1_ORDER: LocationId[] = [
  "home",
  "city-hall",
  "convenience-store",
  "train-station",
  "cafe",
  "clinic",
  "phone-center",
  "office",
  "training-dojo",
  "weak-word-dungeon",
  "jlpt-castle",
];

export function TownMap({ profile, onSelect }: Props) {
  const rows = listLocationsWithStatus(profile);
  const ordered = [...rows].sort((a, b) => {
    const ai = CHAPTER1_ORDER.indexOf(a.location.id);
    const bi = CHAPTER1_ORDER.indexOf(b.location.id);
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
  });

  const unlockedStory = CHAPTER1_ORDER.filter(
    (id) =>
      !["training-dojo", "weak-word-dungeon", "jlpt-castle"].includes(id) &&
      profile.unlockedLocationIds.includes(id)
  );

  return (
    <div className="ppq-map">
      <header>
        <h2 className="ppq-map-title">🗺️ Kotoba Town</h2>
        <p style={{ color: "var(--ppq-muted)", margin: "4px 0 0", fontSize: 13 }}>
          ことば町 — tap an unlocked place to visit.
        </p>
        <p className="ppq-map-trail" aria-label="Chapter progression">
          {unlockedStory
            .map((id) => {
              const loc = rows.find((r) => r.location.id === id)?.location;
              return loc ? `${loc.icon}` : "";
            })
            .filter(Boolean)
            .join(" → ")}
        </p>
      </header>
      <div className="ppq-map-grid">
        {ordered.map(({ location, status, unlockText }) => {
          const locked = status === "locked";
          return (
            <button
              key={location.id}
              type="button"
              className={locked ? "ppq-loc ppq-loc--locked" : "ppq-loc"}
              disabled={locked}
              onClick={() => {
                if (!locked) onSelect(location.id);
              }}
              title={locked ? unlockText : location.description}
            >
              <span className="ppq-loc-icon" aria-hidden="true">
                {locked ? "🔒" : location.icon}
              </span>
              <span className="ppq-loc-name">{location.name}</span>
              <span className="ppq-loc-ja" lang="ja">
                {location.japaneseName}
              </span>
              <span className="ppq-loc-desc">
                {locked ? unlockText : location.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
