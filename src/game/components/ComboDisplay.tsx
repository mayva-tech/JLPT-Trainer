type Props = {
  combo: number;
  pop?: boolean;
};

export function ComboDisplay({ combo, pop }: Props) {
  if (combo <= 0) {
    return <div className="gm-combo gm-combo--idle">Combo ×0</div>;
  }
  return (
    <div
      className={
        pop ? "gm-combo gm-combo--pop" : "gm-combo"
      }
      aria-label={`Combo ${combo}`}
    >
      Combo ×{combo}
    </div>
  );
}
