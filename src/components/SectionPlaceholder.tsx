type Props = {
  title: string;
  subtitle?: string;
  chip?: string;
};

/** Lightweight stage card for sections without full lesson data yet. */
export function SectionPlaceholder({
  title,
  subtitle = "Content coming soon — ready for recording once data is added.",
  chip = "Section",
}: Props) {
  return (
    <div className="safe-area">
      <div className="hook-display card-fade">
        <div className="category-chip">{chip}</div>
        <div className="placeholder-title">{title}</div>
        <div className="placeholder-subtitle">{subtitle}</div>
      </div>
    </div>
  );
}
