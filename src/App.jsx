import { useCallback, useState } from 'react';
import BoardView from './components/board/BoardView.jsx';
import Dashboard from './components/dashboard/Dashboard.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import BoardDialogs from './components/projects/BoardDialogs.jsx';
import Banner from './components/ui/Banner.jsx';
import Button from './components/ui/Button.jsx';
import ConfirmDialog from './components/ui/ConfirmDialog.jsx';
import EmptyState from './components/ui/EmptyState.jsx';
import Icon from './components/ui/Icon.jsx';
import Logo from './components/ui/Logo.jsx';
import { useKanban } from './hooks/useKanban.js';
import { APP_NAME, VIEWS } from './utils/constants.js';

export default function App() {
  const { boards, view, activeBoard, actions, notice, dismissNotice, storageIssue } = useKanban();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  // null | { type: 'create' } | { type: 'rename' | 'delete', boardId }
  const [boardDialog, setBoardDialog] = useState(null);
  const [resetOpen, setResetOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const closeBoardDialog = useCallback(() => setBoardDialog(null), []);

  const openCreateBoard = useCallback(() => {
    setSidebarOpen(false);
    setBoardDialog({ type: 'create' });
  }, []);
  const openRenameBoard = useCallback((boardId) => setBoardDialog({ type: 'rename', boardId }), []);
  const openDeleteBoard = useCallback((boardId) => setBoardDialog({ type: 'delete', boardId }), []);

  const handleNavigate = (nextView) => {
    actions.setView(nextView);
    setSidebarOpen(false);
  };
  const handleSelectBoard = (boardId) => {
    actions.selectBoard(boardId);
    setSidebarOpen(false);
  };

  const showBoard = view === VIEWS.BOARD && activeBoard;

  return (
    <div className="app">
      <Sidebar
        boards={boards}
        view={showBoard ? VIEWS.BOARD : VIEWS.DASHBOARD}
        activeBoardId={activeBoard?.id ?? null}
        open={sidebarOpen}
        onClose={closeSidebar}
        onNavigate={handleNavigate}
        onSelectBoard={handleSelectBoard}
        onCreateBoard={openCreateBoard}
        onResetData={() => {
          setSidebarOpen(false);
          setResetOpen(true);
        }}
      />

      <div className="app__main">
        <div className="mobile-bar">
          <button type="button" className="btn btn--ghost btn--icon" onClick={() => setSidebarOpen(true)} aria-label="Buka menu navigasi">
            <Icon name="menu" size={22} />
          </button>
          <Logo size={28} />
          <span className="mobile-bar__name">{APP_NAME}</span>
        </div>

        {notice || storageIssue ? (
          <div className="banners">
            {storageIssue ? <Banner tone="warning">{storageIssue}</Banner> : null}
            {notice ? (
              <Banner tone="info" onDismiss={dismissNotice}>
                {notice}
              </Banner>
            ) : null}
          </div>
        ) : null}

        <main className="app__content" id="main">
          {showBoard ? (
            <BoardView
              key={activeBoard.id}
              board={activeBoard}
              onRenameBoard={openRenameBoard}
              onDeleteBoard={openDeleteBoard}
            />
          ) : view === VIEWS.BOARD ? (
            <div className="page">
              <EmptyState
                icon="board"
                title="Belum ada board"
                description="Buat board untuk mulai menyusun tugas pada papan Kanban."
                action={
                  <Button variant="primary" icon="plus" onClick={openCreateBoard}>
                    Buat board
                  </Button>
                }
              />
            </div>
          ) : (
            <Dashboard
              onCreateBoard={openCreateBoard}
              onRenameBoard={openRenameBoard}
              onDeleteBoard={openDeleteBoard}
            />
          )}
        </main>
      </div>

      <BoardDialogs dialog={boardDialog} onClose={closeBoardDialog} />

      {resetOpen ? (
        <ConfirmDialog
          title="Reset ke data contoh?"
          confirmLabel="Reset data"
          onCancel={() => setResetOpen(false)}
          onConfirm={() => {
            actions.resetData();
            setResetOpen(false);
          }}
        >
          <p>Semua board, kolom, dan tugas Anda akan dihapus dan diganti dengan data contoh. Tindakan ini tidak dapat dibatalkan.</p>
        </ConfirmDialog>
      ) : null}
    </div>
  );
}
