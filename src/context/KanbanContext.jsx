import { createContext, useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { loadInitialState, serializeState } from '../state/initialState.js';
import { ACTIONS, kanbanReducer } from '../state/kanbanReducer.js';
import { CATEGORIES } from '../utils/constants.js';
import { createBoard, createColumn, createTask, sanitizeTaskChanges } from '../utils/factories.js';
import { createSampleState } from '../utils/sampleData.js';
import { describeStorageError, removeFromStorage, saveToStorage } from '../utils/storage.js';

export const KanbanContext = createContext(null);

export function KanbanProvider({ children }) {
  // Dibaca satu kali saat mount.
  const [initial] = useState(loadInitialState);
  const [state, dispatch] = useReducer(kanbanReducer, initial.state);
  const [notice, setNotice] = useState(initial.notice);
  const [storageIssue, setStorageIssue] = useState(null);

  // Setiap perubahan state langsung ditulis ke LocalStorage.
  useEffect(() => {
    const result = saveToStorage(serializeState(state));
    setStorageIssue(result.ok ? null : describeStorageError(result.error));
  }, [state]);

  const dismissNotice = useCallback(() => setNotice(null), []);

  // `dispatch` stabil, sehingga objek actions dibuat sekali.
  const actions = useMemo(
    () => ({
      setView: (view) => dispatch({ type: ACTIONS.SET_VIEW, view }),
      selectBoard: (boardId) => dispatch({ type: ACTIONS.BOARD_SELECT, boardId }),

      addBoard: (name) => {
        const board = createBoard(name);
        dispatch({ type: ACTIONS.BOARD_ADD, board });
        return board.id;
      },
      renameBoard: (boardId, name) => {
        const clean = String(name).trim();
        if (clean) dispatch({ type: ACTIONS.BOARD_RENAME, boardId, name: clean });
      },
      deleteBoard: (boardId) => dispatch({ type: ACTIONS.BOARD_DELETE, boardId }),

      addColumn: (boardId, { name, category }) => {
        const clean = String(name).trim();
        if (!clean) return null;
        const column = createColumn(clean, CATEGORIES.includes(category) ? category : 'progress');
        dispatch({ type: ACTIONS.COLUMN_ADD, boardId, column });
        return column.id;
      },
      updateColumn: (boardId, columnId, changes) => {
        const clean = {};
        if (typeof changes.name === 'string' && changes.name.trim()) clean.name = changes.name.trim();
        if (CATEGORIES.includes(changes.category)) clean.category = changes.category;
        dispatch({ type: ACTIONS.COLUMN_UPDATE, boardId, columnId, changes: clean });
      },
      deleteColumn: (boardId, columnId, moveToColumnId = null) =>
        dispatch({ type: ACTIONS.COLUMN_DELETE, boardId, columnId, moveToColumnId }),

      addTask: (boardId, fields) => {
        if (!String(fields.title ?? '').trim()) return null;
        const task = createTask(fields);
        dispatch({ type: ACTIONS.TASK_ADD, boardId, task });
        return task.id;
      },
      updateTask: (boardId, taskId, changes) =>
        dispatch({ type: ACTIONS.TASK_UPDATE, boardId, taskId, changes: sanitizeTaskChanges(changes) }),
      deleteTask: (boardId, taskId) => dispatch({ type: ACTIONS.TASK_DELETE, boardId, taskId }),
      moveTask: (boardId, taskId, toColumnId, beforeTaskId = null) =>
        dispatch({ type: ACTIONS.TASK_MOVE, boardId, taskId, toColumnId, beforeTaskId }),

      /** Menghapus data tersimpan lalu memuat ulang data contoh. */
      resetData: () => {
        removeFromStorage();
        dispatch({ type: ACTIONS.RESET, state: createSampleState() });
        setNotice(null);
      },
    }),
    [],
  );

  const activeBoard = useMemo(
    () => state.boards.find((b) => b.id === state.activeBoardId) ?? null,
    [state.boards, state.activeBoardId],
  );

  const value = useMemo(
    () => ({
      boards: state.boards,
      view: state.view,
      activeBoard,
      actions,
      notice,
      dismissNotice,
      storageIssue,
    }),
    [state.boards, state.view, activeBoard, actions, notice, dismissNotice, storageIssue],
  );

  return <KanbanContext.Provider value={value}>{children}</KanbanContext.Provider>;
}
