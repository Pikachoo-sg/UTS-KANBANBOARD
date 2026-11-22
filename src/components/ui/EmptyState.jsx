import Icon from './Icon.jsx';

export default function EmptyState({ icon = 'folder', title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <Icon name={icon} size={28} />
      </div>
      <h2 className="empty-state__title">{title}</h2>
      {description ? <p className="empty-state__text">{description}</p> : null}
      {action}
    </div>
  );
}
