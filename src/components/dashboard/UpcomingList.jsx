import Icon from '../ui/Icon.jsx';
import PriorityBadge from '../ui/PriorityBadge.jsx';

export default function UpcomingList({ items, onOpenBoard }) {
  if (items.length === 0) {
    return <p className="muted upcoming__empty">Tidak ada tugas dengan deadline yang menunggu.</p>;
  }

  return (
    <ul className="upcoming">
      {items.map(({ task, board, info }) => (
        <li key={task.id}>
          <button type="button" className="upcoming__item" onClick={() => onOpenBoard(board.id)}>
            <span className="upcoming__main">
              <span className="upcoming__title">{task.title}</span>
              <span className="upcoming__board">{board.name}</span>
            </span>
            <span className="upcoming__side">
              <PriorityBadge priority={task.priority} />
              <span className={`chip chip--${info.tone}`}>
                <Icon name="calendar" size={13} />
                {info.hint}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
