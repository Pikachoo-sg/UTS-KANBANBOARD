import { getBoardStats } from '../../utils/stats.js';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';

export default function BoardCard({ board, isActive, onOpen, onRename, onDelete }) {
  const stats = getBoardStats(board);

  return (
    <article className={`board-card ${isActive ? 'board-card--active' : ''}`} data-testid="board-card">
      <header className="board-card__header">
        <div className="board-card__icon">
          <Icon name="folder" size={20} />
        </div>
        <div className="board-card__titles">
          <h3 className="board-card__name" title={board.name}>
            {board.name}
          </h3>
          <p className="board-card__meta">
            {stats.total} tugas · {board.columns.length} kolom
          </p>
        </div>
        <div className="board-card__actions">
          <Button variant="ghost" size="sm" icon="edit" aria-label={`Ganti nama board ${board.name}`} onClick={onRename} />
          <Button variant="ghost" size="sm" icon="trash" aria-label={`Hapus board ${board.name}`} onClick={onDelete} />
        </div>
      </header>

      <div className="progress" aria-label={`Progres ${stats.percent}%`}>
        <div className="progress__bar" role="progressbar" aria-valuenow={stats.percent} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress__fill" style={{ width: `${stats.percent}%` }} />
        </div>
        <span className="progress__text">{stats.percent}%</span>
      </div>

      <ul className="board-card__stats">
        <li>
          <span className="dot dot--todo" aria-hidden="true" />
          {stats.todo} belum
        </li>
        <li>
          <span className="dot dot--progress" aria-hidden="true" />
          {stats.progress} proses
        </li>
        <li>
          <span className="dot dot--done" aria-hidden="true" />
          {stats.done} selesai
        </li>
      </ul>

      <footer className="board-card__footer">
        <Button variant="secondary" size="sm" onClick={onOpen}>
          Buka board
          <Icon name="arrowRight" size={15} />
        </Button>
        {stats.overdue > 0 ? (
          <span className="chip chip--overdue">
            <Icon name="alert" size={13} />
            {stats.overdue} terlambat
          </span>
        ) : null}
      </footer>
    </article>
  );
}
