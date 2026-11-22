import { APP_NAME, VIEWS } from '../../utils/constants.js';
import Icon from '../ui/Icon.jsx';
import Logo from '../ui/Logo.jsx';

export default function Sidebar({
  boards,
  view,
  activeBoardId,
  open,
  onClose,
  onNavigate,
  onSelectBoard,
  onCreateBoard,
  onResetData,
}) {
  const hasBoards = boards.length > 0;

  return (
    <>
      <div className={`sidebar-backdrop ${open ? 'is-visible' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`} aria-label="Navigasi utama">
        <div className="sidebar__brand">
          <Logo size={38} />
          <div>
            <div className="sidebar__name">{APP_NAME}</div>
            <div className="sidebar__tagline">Kelola proyek &amp; tugas</div>
          </div>
        </div>

        <nav className="sidebar__nav" aria-label="Menu">
          <button
            type="button"
            className={`nav-item ${view === VIEWS.DASHBOARD ? 'is-active' : ''}`}
            aria-current={view === VIEWS.DASHBOARD ? 'page' : undefined}
            onClick={() => onNavigate(VIEWS.DASHBOARD)}
          >
            <Icon name="dashboard" />
            Dashboard
          </button>
          <button
            type="button"
            className={`nav-item ${view === VIEWS.BOARD ? 'is-active' : ''}`}
            aria-current={view === VIEWS.BOARD ? 'page' : undefined}
            disabled={!hasBoards}
            onClick={() => onNavigate(VIEWS.BOARD)}
          >
            <Icon name="board" />
            Kanban Board
          </button>
        </nav>

        <div className="sidebar__section">
          <span className="sidebar__heading">Proyek</span>
          <button type="button" className="sidebar__add" onClick={onCreateBoard} aria-label="Buat board baru">
            <Icon name="plus" size={16} />
          </button>
        </div>

        <ul className="sidebar__boards">
          {boards.map((board) => {
            const isActive = view === VIEWS.BOARD && board.id === activeBoardId;
            return (
              <li key={board.id}>
                <button
                  type="button"
                  className={`board-link ${isActive ? 'is-active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => onSelectBoard(board.id)}
                  title={board.name}
                >
                  <span className="board-link__dot" aria-hidden="true" />
                  <span className="board-link__name">{board.name}</span>
                  <span className="board-link__count">{board.tasks.length}</span>
                </button>
              </li>
            );
          })}
          {!hasBoards ? <li className="sidebar__empty">Belum ada board.</li> : null}
        </ul>

        <div className="sidebar__footer">
          <button type="button" className="nav-item nav-item--subtle" onClick={onResetData}>
            <Icon name="refresh" />
            Reset ke data contoh
          </button>
        </div>
      </aside>
    </>
  );
}
