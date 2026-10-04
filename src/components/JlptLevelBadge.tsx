type Props = {
  level: "N1" | "N2" | "N3";
};

/**
 * Subtle JLPT level badge for vocabulary items in lessons. Only N1 words get
 * one: N2 and N3 items sit in their own level's course, so it would be noise.
 */
export function JlptLevelBadge({ level }: Props) {
  if (level !== "N1") return null;
  return <span className="jlpt-level-badge">{level}</span>;
}
