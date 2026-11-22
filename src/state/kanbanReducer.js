import { VIEWS } from '../utils/constants.js';

export const ACTIONS = {
  SET_VIEW: 'view/set',
  RESET: 'data/reset',

  BOARD_ADD: 'board/add',
  BOARD_SELECT: 'board/select',
  BOARD_RENAME: 'board/rename',
  BOARD_DELETE: 'board/delete',

  COLUMN_ADD: 'column/add',
  COLUMN_UPDATE: 'column/update',
  COLUMN_DELETE: 'column/delete',

  TASK_ADD: 'task/add',
  TASK_UPDATE: 'task/update',
  TASK_DELETE: 'task/delete',
  TASK_MOVE: 'task/move',
};

/** Menerapkan `updater` ke satu board; mengembalikan state yang sama bila tidak ada perubahan. */
function updateBoard(state, boardId, updater) {
  let changed = false;
  const boards = state.boards.map((board) => {
    if (board.id !== boardId) return board;
    const next = updater(board);
    if (next !== board) changed = true;
    return next;
  });
  return changed ? { ...state, boards } : state;
}

/** Memindahkan tugas ke akhir daftar tugas milik kolom tujuan. */
function appendToColumn(tasks, task, columnId) {
  let lastIndex = -1;
  tasks.forEach((t, i) => {
    if (t.columnId === columnId) lastIndex = i;
  });
  const index = lastIndex === -1 ? tasks.length : lastIndex + 1;
  return [...tasks.slice(0, index), task, ...tasks.slice(index)];
}

export function kanbanReducer(state, action) {
  switch (action.type) {
    // ---------------------------------------------------------------- umum
    case ACTIONS.SET_VIEW: {
      if (!Object.values(VIEWS).includes(action.view) || state.view === action.view) return state;
      return { ...state, view: action.view };
    }

    case ACTIONS.RESET:
      return action.state;

    // --------------------------------------------------------------- board
    case ACTIONS.BOARD_ADD:
      return {
        ...state,
        boards: [...state.boards, action.board],
        activeBoardId: action.board.id,
        view: VIEWS.BOARD,
      };

    case ACTIONS.BOARD_SELECT: {
      if (!state.boards.some((b) => b.id === action.boardId)) return state;
      return { ...state, activeBoardId: action.boardId, view: VIEWS.BOARD };
    }

    case ACTIONS.BOARD_RENAME:
      return updateBoard(state, action.boardId, (board) =>
        board.name === action.name ? board : { ...board, name: action.name },
      );

    case ACTIONS.BOARD_DELETE: {
      if (!state.boards.some((b) => b.id === action.boardId)) return state;
      const boards = state.boards.filter((b) => b.id !== action.boardId);
      const activeBoardId =
        state.activeBoardId === action.boardId ? boards[0]?.id ?? null : state.activeBoardId;
      const view = activeBoardId ? state.view : VIEWS.DASHBOARD;
      return { ...state, boards, activeBoardId, view };
    }

    // --------------------------------------------------------------- kolom
    case ACTIONS.COLUMN_ADD:
      return updateBoard(state, action.boardId, (board) => ({
        ...board,
        columns: [...board.columns, action.column],
      }));

    case ACTIONS.COLUMN_UPDATE:
      return updateBoard(state, action.boardId, (board) => {
        let changed = false;
        const columns = board.columns.map((column) => {
          if (column.id !== action.columnId) return column;
          const next = { ...column, ...action.changes };
          if (next.name === column.name && next.category === column.category) return column;
          changed = true;
          return next;
        });
        return changed ? { ...board, columns } : board;
      });

    case ACTIONS.COLUMN_DELETE:
      return updateBoard(state, action.boardId, (board) => {
        const exists = board.columns.some((c) => c.id === action.columnId);
        // Board harus selalu punya minimal satu kolom.
        if (!exists || board.columns.length <= 1) return board;

        const columns = board.columns.filter((c) => c.id !== action.columnId);
        const target = columns.find((c) => c.id === action.moveToColumnId);
        const orphaned = board.tasks.filter((t) => t.columnId === action.columnId);
        const remaining = board.tasks.filter((t) => t.columnId !== action.columnId);

        // Tugas dipindahkan ke akhir kolom tujuan (urutan relatifnya dipertahankan),
        // atau dihapus bila tidak ada kolom tujuan.
        let tasks = remaining;
        if (target) {
          for (const task of orphaned) {
            tasks = appendToColumn(tasks, { ...task, columnId: target.id }, target.id);
          }
        }
        return { ...board, columns, tasks };
      });

    // --------------------------------------------------------------- tugas
    case ACTIONS.TASK_ADD:
      return updateBoard(state, action.boardId, (board) => {
        const validColumn = board.columns.some((c) => c.id === action.task.columnId);
        const task = validColumn ? action.task : { ...action.task, columnId: board.columns[0].id };
        return { ...board, tasks: appendToColumn(board.tasks, task, task.columnId) };
      });

    case ACTIONS.TASK_UPDATE:
      return updateBoard(state, action.boardId, (board) => {
        const current = board.tasks.find((t) => t.id === action.taskId);
        if (!current) return board;

        const changes = { ...action.changes };
        if (changes.columnId && !board.columns.some((c) => c.id === changes.columnId)) {
          delete changes.columnId;
        }
        const updated = { ...current, ...changes };

        // Ganti kolom lewat form/detail = pindah ke akhir kolom baru.
        if (updated.columnId !== current.columnId) {
          const rest = board.tasks.filter((t) => t.id !== current.id);
          return { ...board, tasks: appendToColumn(rest, updated, updated.columnId) };
        }
        return {
          ...board,
          tasks: board.tasks.map((t) => (t.id === current.id ? updated : t)),
        };
      });

    case ACTIONS.TASK_DELETE:
      return updateBoard(state, action.boardId, (board) => {
        if (!board.tasks.some((t) => t.id === action.taskId)) return board;
        return { ...board, tasks: board.tasks.filter((t) => t.id !== action.taskId) };
      });

    case ACTIONS.TASK_MOVE:
      return updateBoard(state, action.boardId, (board) => {
        const task = board.tasks.find((t) => t.id === action.taskId);
        if (!task || !board.columns.some((c) => c.id === action.toColumnId)) return board;
        if (action.beforeTaskId === action.taskId) return board;

        const rest = board.tasks.filter((t) => t.id !== action.taskId);
        const moved = task.columnId === action.toColumnId ? task : { ...task, columnId: action.toColumnId };

        // Posisi: tepat sebelum kartu `beforeTaskId`, atau di akhir kolom tujuan.
        let index = -1;
        if (action.beforeTaskId) {
          index = rest.findIndex(
            (t) => t.id === action.beforeTaskId && t.columnId === action.toColumnId,
          );
        }
        if (index === -1) {
          let lastIndex = -1;
          rest.forEach((t, i) => {
            if (t.columnId === action.toColumnId) lastIndex = i;
          });
          index = lastIndex === -1 ? rest.length : lastIndex + 1;
        }

        const tasks = [...rest.slice(0, index), moved, ...rest.slice(index)];
        const unchanged =
          tasks.length === board.tasks.length && tasks.every((t, i) => t === board.tasks[i]);
        return unchanged ? board : { ...board, tasks };
      });

    default:
      return state;
  }
}
