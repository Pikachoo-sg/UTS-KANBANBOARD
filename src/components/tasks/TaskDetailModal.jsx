import { useId } from 'react';
import { PRIORITIES, PRIORITY_META } from '../../utils/constants.js';
import { formatDate, getDeadlineInfo } from '../../utils/date.js';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import Modal from '../ui/Modal.jsx';
import PriorityBadge from '../ui/PriorityBadge.jsx';

/** Detail tugas, dengan kontrol cepat untuk memindahkan kolom dan mengubah prioritas. */
export default function TaskDetailModal({ task, board, onClose, onEdit, onDelete, onChangeStatus, onChangePriority }) {
  const uid = useId();
  const column = board.columns.find((c) => c.id === task.columnId);
  const isDone = column?.category === 'done';
  const deadline = getDeadlineInfo(task.deadline, isDone);

  return (
    <Modal
      title="Detail tugas"
      size="md"
      onClose={onClose}
      footer={
        <>
          <Button variant="danger" icon="trash" onClick={onDelete}>
            Hapus
          </Button>
          <span className="modal__spacer" />
          <Button onClick={onClose}>Tutup</Button>
          <Button variant="primary" icon="edit" onClick={onEdit} data-autofocus>
            Edit
          </Button>
        </>
      }
    >
      <div className="detail">
        <h3 className="detail__title">{task.title}</h3>

        {task.description ? (
          <p className="detail__description">{task.description}</p>
        ) : (
          <p className="detail__description detail__description--empty">Tidak ada deskripsi.</p>
        )}

        <dl className="detail__grid">
          <div className="detail__item">
            <dt>
              <label htmlFor={`${uid}-status`}>Status</label>
            </dt>
            <dd>
              <select
                id={`${uid}-status`}
                className="input input--compact"
                value={task.columnId}
                onChange={(e) => onChangeStatus(e.target.value)}
              >
                {board.columns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </dd>
          </div>

          <div className="detail__item">
            <dt>
              <label htmlFor={`${uid}-priority`}>Prioritas</label>
            </dt>
            <dd className="detail__priority">
              <PriorityBadge priority={task.priority} />
              <select
                id={`${uid}-priority`}
                className="input input--compact"
                value={task.priority}
                onChange={(e) => onChangePriority(e.target.value)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_META[p].label}
                  </option>
                ))}
              </select>
            </dd>
          </div>

          <div className="detail__item">
            <dt>Dibuat</dt>
            <dd>{formatDate(task.createdAt)}</dd>
          </div>

          <div className="detail__item">
            <dt>Deadline</dt>
            <dd>
              {deadline ? (
                <span className={`chip chip--${deadline.tone}`}>
                  <Icon name="calendar" size={13} />
                  {deadline.date} · {deadline.hint}
                </span>
              ) : (
                <span className="muted">Tanpa deadline</span>
              )}
            </dd>
          </div>

          <div className="detail__item detail__item--wide">
            <dt>Label</dt>
            <dd>
              {task.labels.length > 0 ? (
                <span className="tags">
                  {task.labels.map((label) => (
                    <span key={label} className="tag tag--static">
                      {label}
                    </span>
                  ))}
                </span>
              ) : (
                <span className="muted">Tanpa label</span>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </Modal>
  );
}
