type Props = {
  combo: number;
  pop?: boolean;
};

export function ComboDisplay({ combo, pop = false }: Props) {
  if (combo <= 0) {
    return <div className="gm-combo gm-combo--idle">Combo</div>;
  }
  return (
    <div className={pop ? "gm-combo gm-combo--hot gm-combo--pop" : "gm-combo gm-combo--hot"}>
      🔥 Combo ×{combo}
    </div>
  );
}
