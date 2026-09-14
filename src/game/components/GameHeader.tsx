type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children?: React.ReactNode;
};

export function GameHeader({ title, subtitle, onBack, children }: Props) {
  return (
    <header className="gm-header">
      <div className="gm-header__row">
        {onBack ? (
          <button type="button" className="gm-btn gm-btn--ghost" onClick={onBack}>
            ← Back
          </button>
        ) : (
          <span className="gm-header__spacer" />
        )}
        <div className="gm-header__titles">
          <h1 className="gm-header__title">{title}</h1>
          {subtitle ? <p className="gm-header__subtitle">{subtitle}</p> : null}
        </div>
        <div className="gm-header__extra">{children}</div>
      </div>
    </header>
  );
}
