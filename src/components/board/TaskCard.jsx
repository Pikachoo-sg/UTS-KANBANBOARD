import { formatDate, getDeadlineInfo } from '../../utils/date.js';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import PriorityBadge from '../ui/PriorityBadge.jsx';

const MAX_VISIBLE_LABELS = 3;

export default function TaskCard({ task, isDone, isDragging, onOpen, onEdit, onDelete, onDragStart, onDragEnd }) {
  const deadline = getDeadlineInfo(task.deadline, isDone);
  const extraLabels = task.labels.length - MAX_VISIBLE_LABELS;

  const handleKeyDown = (event) => {
    // Hanya saat kartu itu sendiri yang fokus (bukan tombol di dalamnya).
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen();
    }
  };

  const stop = (handler) => (event) => {
    event.stopPropagation();
    handler();
  };

  return (
    <article
      className={`task-card ${isDragging ? 'is-dragging' : ''}`}
      data-task-id={task.id}
      data-testid="task-card"
      draggable
      tabIndex={0}
      aria-label={`Tugas: ${task.title}. Tekan Enter untuk melihat detail.`}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      onDragStart={(event) => onDragStart(event, task.id)}
      onDragEnd={onDragEnd}
    >
      <div className="task-card__top">
        <PriorityBadge priority={task.priority} />
        {task.labels.length > 0 ? (
          <span className="tags tags--card">
            {task.labels.slice(0, MAX_VISIBLE_LABELS).map((label) => (
              <span key={label} className="tag tag--static">
                {label}
              </span>
            ))}
            {extraLabels > 0 ? <span className="tag tag--static tag--more">+{extraLabels}</span> : null}
          </span>
        ) : null}
      </div>

      <h3 className="task-card__title">{task.title}</h3>
      {task.description ? <p className="task-card__description">{task.description}</p> : null}

      <div className="task-card__footer">
        {deadline ? (
          <span
            className={`chip chip--${deadline.tone}`}
            title={`${deadline.date} · ${deadline.hint}`}
            data-testid="task-deadline"
          >
            <Icon name="calendar" size={13} />
            {deadline.tone === 'overdue' ? `Terlambat · ${deadline.date}` : deadline.date}
          </span>
        ) : (
          <span className="chip chip--none" title={`Dibuat ${formatDate(task.createdAt)}`}>
            <Icon name="calendar" size={13} />
            Tanpa deadline
          </span>
        )}
        <span className="task-card__actions">
          <Button
            variant="ghost"
            size="sm"
            icon="edit"
            aria-label={`Edit tugas ${task.title}`}
            onClick={stop(onEdit)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon="trash"
            aria-label={`Hapus tugas ${task.title}`}
            onClick={stop(onDelete)}
          />
        </span>
      </div>
    </article>
  );
}
