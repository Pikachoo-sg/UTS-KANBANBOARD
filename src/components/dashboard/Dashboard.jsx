import { useMemo } from 'react';
import { useKanban } from '../../hooks/useKanban.js';
import { formatLongDate } from '../../utils/date.js';
import { aggregateStats, getUpcomingTasks } from '../../utils/stats.js';
import Button from '../ui/Button.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import Icon from '../ui/Icon.jsx';
import BoardCard from './BoardCard.jsx';
import ProgressRing from './ProgressRing.jsx';
import StatCard from './StatCard.jsx';
import UpcomingList from './UpcomingList.jsx';

export default function Dashboard({ onCreateBoard, onRenameBoard, onDeleteBoard }) {
  const { boards, activeBoard, actions } = useKanban();
  const stats = useMemo(() => aggregateStats(boards), [boards]);
  const upcoming = useMemo(() => getUpcomingTasks(boards, 5), [boards]);

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1 className="page__title">Dashboard</h1>
          <p className="page__subtitle">{formatLongDate()}</p>
        </div>
        <Button variant="primary" icon="plus" onClick={onCreateBoard}>
          Board baru
        </Button>
      </header>

      <section aria-label="Ringkasan tugas" className="stats-grid">
        <StatCard tone="total" icon="list" label="Total tugas" value={stats.total} hint={`di ${boards.length} board`} />
        <StatCard tone="todo" icon="clock" label="Belum dikerjakan" value={stats.todo} />
        <StatCard tone="progress" icon="refresh" label="Sedang dikerjakan" value={stats.progress} />
        <StatCard tone="done" icon="check" label="Selesai" value={stats.done} />
      </section>

      <div className="dashboard-grid">
        <section className="panel completion" aria-labelledby="completion-title">
          <h2 id="completion-title" className="panel__title">
            Persentase penyelesaian
          </h2>
          <div className="completion__body">
            <ProgressRing percent={stats.percent} />
            <div className="completion__text">
              <p className="completion__summary">
                <strong>{stats.done}</strong> dari <strong>{stats.total}</strong> tugas selesai
              </p>
              {stats.overdue > 0 ? (
                <p className="chip chip--overdue">
                  <Icon name="alert" size={13} />
                  {stats.overdue} tugas melewati deadline
                </p>
              ) : (
                <p className="muted">Tidak ada tugas yang terlambat.</p>
              )}
            </div>
          </div>
        </section>

        <section className="panel" aria-labelledby="upcoming-title">
          <h2 id="upcoming-title" className="panel__title">
            Deadline terdekat
          </h2>
          <UpcomingList items={upcoming} onOpenBoard={actions.selectBoard} />
        </section>
      </div>

      <section aria-labelledby="boards-title" className="boards-section">
        <div className="section-head">
          <h2 id="boards-title" className="section-head__title">
            Daftar proyek
          </h2>
          <span className="muted">{boards.length} board</span>
        </div>

        {boards.length === 0 ? (
          <EmptyState
            icon="folder"
            title="Belum ada board"
            description="Buat board pertama Anda untuk mulai mengelola tugas."
            action={
              <Button variant="primary" icon="plus" onClick={onCreateBoard}>
                Buat board
              </Button>
            }
          />
        ) : (
          <div className="board-grid">
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                isActive={activeBoard?.id === board.id}
                onOpen={() => actions.selectBoard(board.id)}
                onRename={() => onRenameBoard(board.id)}
                onDelete={() => onDeleteBoard(board.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
