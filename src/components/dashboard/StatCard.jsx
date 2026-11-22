import Icon from '../ui/Icon.jsx';

/** tone: 'total' | 'todo' | 'progress' | 'done' */
export default function StatCard({ tone, icon, label, value, hint }) {
  return (
    <div className={`stat-card stat-card--${tone}`}>
      <div className="stat-card__icon">
        <Icon name={icon} size={22} />
      </div>
      <div className="stat-card__body">
        <div className="stat-card__label">{label}</div>
        <div className="stat-card__value" data-testid={`stat-${tone}`}>
          {value}
        </div>
        {hint ? <div className="stat-card__hint">{hint}</div> : null}
      </div>
    </div>
  );
}
