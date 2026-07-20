type Props = {
  level: "N1" | "N2";
};

/** Subtle JLPT level badge for vocabulary items in lessons. */
export function JlptLevelBadge({ level }: Props) {
  if (level !== "N1") return null;
  return <span className="jlpt-level-badge">{level}</span>;
}
