import { useCallback, useState } from 'react';
import { useDragAndDrop } from '../../hooks/useDragAndDrop.js';
import { useKanban } from '../../hooks/useKanban.js';
import { useTaskFilters } from '../../hooks/useTaskFilters.js';
import Button from '../ui/Button.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import Icon from '../ui/Icon.jsx';
import TaskDetailModal from '../tasks/TaskDetailModal.jsx';
import TaskFormModal from '../tasks/TaskFormModal.jsx';
import Column from './Column.jsx';
import ColumnFormModal from './ColumnFormModal.jsx';
import DeleteColumnModal from './DeleteColumnModal.jsx';
import FilterBar from './FilterBar.jsx';

/**
 * Halaman Kanban untuk satu board. Dipasang dengan `key={board.id}` sehingga
 * filter dan dialog otomatis ter-reset saat berpindah board.
 */
export default function BoardView({ board, onRenameBoard, onDeleteBoard }) {
  const { actions } = useKanban();
  const filtering = useTaskFilters(board);
  const { filters, labels, tasksByColumn, totalByColumn, visibleColumns, matchCount, isFiltering } = filtering;

  // taskModal:   null | { mode: 'create', columnId } | { mode: 'detail' | 'edit', taskId }
  // columnModal: null | { mode: 'create' } | { mode: 'edit', columnId } | { mode: 'delete', columnId }
  // confirmTask: null | taskId
  const [taskModal, setTaskModal] = useState(null);
  const [columnModal, setColumnModal] = useState(null);
  const [confirmTaskId, setConfirmTaskId] = useState(null);

  const handleDrop = useCallback(
    ({ taskId, toColumnId, beforeTaskId }) => actions.moveTask(board.id, taskId, toColumnId, beforeTaskId),
    [actions, board.id],
  );
  const dnd = useDragAndDrop(handleDrop);

  const closeTaskModal = useCallback(() => setTaskModal(null), []);
  const closeColumnModal = useCallback(() => setColumnModal(null), []);

  const findTask = (id) => board.tasks.find((t) => t.id === id);
  const findColumn = (id) => board.columns.find((c) => c.id === id);

  const modalTask = taskModal && taskModal.mode !== 'create' ? findTask(taskModal.taskId) : null;
  const modalColumn = columnModal && columnModal.mode !== 'create' ? findColumn(columnModal.columnId) : null;
  const confirmTask = confirmTaskId ? findTask(confirmTaskId) : null;

  const canDeleteColumn = board.columns.length > 1;
  const firstColumnId = board.columns[0]?.id;

  return (
    <div className="page page--board">
      <header className="page__header">
        <div className="board-title">
          <h1 className="page__title" title={board.name}>
            {board.name}
          </h1>
          <p className="page__subtitle">
            {board.tasks.length} tugas · {board.columns.length} kolom
          </p>
        </div>
        <div className="page__actions">
          <Button variant="ghost" icon="edit" aria-label="Ganti nama board" title="Ganti nama board" onClick={() => onRenameBoard(board.id)} />
          <Button variant="ghost" icon="trash" aria-label="Hapus board" title="Hapus board" onClick={() => onDeleteBoard(board.id)} />
          <Button icon="plus" onClick={() => setColumnModal({ mode: 'create' })}>
            Tambah kolom
          </Button>
          <Button variant="primary" icon="plus" onClick={() => setTaskModal({ mode: 'create', columnId: firstColumnId })}>
            Tugas baru
          </Button>
        </div>
      </header>

      <FilterBar
        filters={filters}
        labels={labels}
        columns={board.columns}
        onChange={filtering.setFilter}
        onReset={filtering.resetFilters}
        canReset={!filtering.isDefault}
        isFiltering={isFiltering}
        matchCount={matchCount}
        totalCount={board.tasks.length}
      />

      {isFiltering && matchCount === 0 ? (
        <div className="no-match" role="status">
          <Icon name="search" size={18} />
          <span>Tidak ada tugas yang cocok dengan pencarian atau filter saat ini.</span>
          <Button size="sm" onClick={filtering.resetFilters}>
            Reset filter
          </Button>
        </div>
      ) : null}

      <div className="board-scroller">
        <div className="board" data-testid="board">
          {visibleColumns.map((column) => (
            <Column
              key={column.id}
              column={column}
              tasks={tasksByColumn[column.id] ?? []}
              total={totalByColumn[column.id] ?? 0}
              isFiltering={isFiltering}
              canDelete={canDeleteColumn}
              dnd={dnd}
              onAddTask={() => setTaskModal({ mode: 'create', columnId: column.id })}
              onRename={() => setColumnModal({ mode: 'edit', columnId: column.id })}
              onDelete={() => setColumnModal({ mode: 'delete', columnId: column.id })}
              onOpenTask={(taskId) => setTaskModal({ mode: 'detail', taskId })}
              onEditTask={(taskId) => setTaskModal({ mode: 'edit', taskId })}
              onDeleteTask={(taskId) => setConfirmTaskId(taskId)}
            />
          ))}

          {filters.status === 'all' ? (
            <button type="button" className="column column--ghost" onClick={() => setColumnModal({ mode: 'create' })}>
              <Icon name="plus" size={18} />
              Tambah kolom
            </button>
          ) : null}
        </div>
      </div>

      {/* ------------------------------------------------------- dialog tugas */}
      {taskModal?.mode === 'create' ? (
        <TaskFormModal
          board={board}
          defaultColumnId={taskModal.columnId}
          onClose={closeTaskModal}
          onSubmit={(values) => {
            actions.addTask(board.id, values);
            closeTaskModal();
          }}
        />
      ) : null}

      {taskModal?.mode === 'edit' && modalTask ? (
        <TaskFormModal
          board={board}
          task={modalTask}
          onClose={closeTaskModal}
          onSubmit={(values) => {
            actions.updateTask(board.id, modalTask.id, values);
            closeTaskModal();
          }}
        />
      ) : null}

      {taskModal?.mode === 'detail' && modalTask ? (
        <TaskDetailModal
          task={modalTask}
          board={board}
          onClose={closeTaskModal}
          onEdit={() => setTaskModal({ mode: 'edit', taskId: modalTask.id })}
          onDelete={() => {
            closeTaskModal();
            setConfirmTaskId(modalTask.id);
          }}
          onChangeStatus={(columnId) => actions.updateTask(board.id, modalTask.id, { columnId })}
          onChangePriority={(priority) => actions.updateTask(board.id, modalTask.id, { priority })}
        />
      ) : null}

      {confirmTask ? (
        <ConfirmDialog
          title="Hapus tugas?"
          confirmLabel="Hapus tugas"
          onCancel={() => setConfirmTaskId(null)}
          onConfirm={() => {
            actions.deleteTask(board.id, confirmTask.id);
            setConfirmTaskId(null);
          }}
        >
          <p>
            Tugas <strong>{confirmTask.title}</strong> akan dihapus permanen.
          </p>
        </ConfirmDialog>
      ) : null}

      {/* ------------------------------------------------------ dialog kolom */}
      {columnModal?.mode === 'create' ? (
        <ColumnFormModal
          columns={board.columns}
          onClose={closeColumnModal}
          onSubmit={(values) => {
            actions.addColumn(board.id, values);
            closeColumnModal();
          }}
        />
      ) : null}

      {columnModal?.mode === 'edit' && modalColumn ? (
        <ColumnFormModal
          column={modalColumn}
          columns={board.columns}
          onClose={closeColumnModal}
          onSubmit={(values) => {
            actions.updateColumn(board.id, modalColumn.id, values);
            closeColumnModal();
          }}
        />
      ) : null}

      {columnModal?.mode === 'delete' && modalColumn && canDeleteColumn ? (
        <DeleteColumnModal
          column={modalColumn}
          taskCount={totalByColumn[modalColumn.id] ?? 0}
          otherColumns={board.columns.filter((c) => c.id !== modalColumn.id)}
          onClose={closeColumnModal}
          onConfirm={(moveToColumnId) => {
            actions.deleteColumn(board.id, modalColumn.id, moveToColumnId);
            closeColumnModal();
          }}
        />
      ) : null}
    </div>
  );
}
