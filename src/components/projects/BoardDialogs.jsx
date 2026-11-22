import { useKanban } from '../../hooks/useKanban.js';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import BoardFormModal from './BoardFormModal.jsx';

/**
 * Seluruh dialog pengelolaan board.
 * dialog: null | { type: 'create' } | { type: 'rename', boardId } | { type: 'delete', boardId }
 */
export default function BoardDialogs({ dialog, onClose }) {
  const { boards, actions } = useKanban();
  if (!dialog) return null;

  if (dialog.type === 'create') {
    return (
      <BoardFormModal
        boards={boards}
        onClose={onClose}
        onSubmit={(name) => {
          actions.addBoard(name);
          onClose();
        }}
      />
    );
  }

  const board = boards.find((b) => b.id === dialog.boardId);
  if (!board) return null;

  if (dialog.type === 'rename') {
    return (
      <BoardFormModal
        board={board}
        boards={boards}
        onClose={onClose}
        onSubmit={(name) => {
          actions.renameBoard(board.id, name);
          onClose();
        }}
      />
    );
  }

  if (dialog.type === 'delete') {
    return (
      <ConfirmDialog
        title="Hapus board?"
        confirmLabel="Hapus board"
        onCancel={onClose}
        onConfirm={() => {
          actions.deleteBoard(board.id);
          onClose();
        }}
      >
        <p>
          Board <strong>{board.name}</strong> beserta {board.columns.length} kolom dan {board.tasks.length} tugas di
          dalamnya akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
        </p>
      </ConfirmDialog>
    );
  }

  return null;
}
