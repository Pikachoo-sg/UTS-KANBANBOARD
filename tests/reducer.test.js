import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ACTIONS, kanbanReducer } from '../src/state/kanbanReducer.js';
import { createBoard, createColumn, createTask } from '../src/utils/factories.js';
import { createSampleState } from '../src/utils/sampleData.js';

function setup() {
  const board = createBoard('Uji');
  const [todo, progress, done] = board.columns;
  const mk = (title, column) => createTask({ title, columnId: column.id });
  const a = mk('A', todo);
  const b = mk('B', todo);
  const c = mk('C', progress);
  board.tasks = [a, b, c];
  const state = { activeBoardId: board.id, view: 'board', boards: [board] };
  return { state, board, todo, progress, done, a, b, c };
}

const ids = (state, columnId) =>
  state.boards[0].tasks.filter((t) => t.columnId === columnId).map((t) => t.title);

test('TASK_MOVE memindahkan tugas ke kolom lain di akhir', () => {
  const { state, board, progress, a } = setup();
  const next = kanbanReducer(state, {
    type: ACTIONS.TASK_MOVE, boardId: board.id, taskId: a.id, toColumnId: progress.id, beforeTaskId: null,
  });
  assert.deepEqual(ids(next, progress.id), ['C', 'A']);
  assert.deepEqual(ids(next, board.columns[0].id), ['B']);
});

test('TASK_MOVE menyisipkan sebelum kartu tertentu', () => {
  const { state, board, progress, a, c } = setup();
  const next = kanbanReducer(state, {
    type: ACTIONS.TASK_MOVE, boardId: board.id, taskId: a.id, toColumnId: progress.id, beforeTaskId: c.id,
  });
  assert.deepEqual(ids(next, progress.id), ['A', 'C']);
});

test('TASK_MOVE mengurutkan ulang dalam kolom yang sama', () => {
  const { state, board, todo, a, b } = setup();
  const next = kanbanReducer(state, {
    type: ACTIONS.TASK_MOVE, boardId: board.id, taskId: b.id, toColumnId: todo.id, beforeTaskId: a.id,
  });
  assert.deepEqual(ids(next, todo.id), ['B', 'A']);
});

test('TASK_MOVE tanpa perubahan mengembalikan state yang sama', () => {
  const { state, board, todo, a, b } = setup();
  const same = kanbanReducer(state, {
    type: ACTIONS.TASK_MOVE, boardId: board.id, taskId: a.id, toColumnId: todo.id, beforeTaskId: b.id,
  });
  assert.equal(same, state);
  const toEnd = kanbanReducer(state, {
    type: ACTIONS.TASK_MOVE, boardId: board.id, taskId: b.id, toColumnId: todo.id, beforeTaskId: null,
  });
  assert.equal(toEnd, state);
});

test('TASK_MOVE mengabaikan kolom/tugas yang tidak ada', () => {
  const { state, board, a } = setup();
  assert.equal(
    kanbanReducer(state, { type: ACTIONS.TASK_MOVE, boardId: board.id, taskId: a.id, toColumnId: 'nope', beforeTaskId: null }),
    state,
  );
  assert.equal(
    kanbanReducer(state, { type: ACTIONS.TASK_MOVE, boardId: board.id, taskId: 'nope', toColumnId: board.columns[0].id, beforeTaskId: null }),
    state,
  );
});

test('TASK_ADD / UPDATE / DELETE', () => {
  const { state, board, todo, progress, a } = setup();
  const t = createTask({ title: 'Baru', columnId: todo.id });
  let next = kanbanReducer(state, { type: ACTIONS.TASK_ADD, boardId: board.id, task: t });
  assert.deepEqual(ids(next, todo.id), ['A', 'B', 'Baru']);

  next = kanbanReducer(next, { type: ACTIONS.TASK_UPDATE, boardId: board.id, taskId: a.id, changes: { title: 'A2', priority: 'high' } });
  const updated = next.boards[0].tasks.find((x) => x.id === a.id);
  assert.equal(updated.title, 'A2');
  assert.equal(updated.priority, 'high');

  next = kanbanReducer(next, { type: ACTIONS.TASK_UPDATE, boardId: board.id, taskId: a.id, changes: { columnId: progress.id } });
  assert.deepEqual(ids(next, progress.id), ['C', 'A2']);

  next = kanbanReducer(next, { type: ACTIONS.TASK_DELETE, boardId: board.id, taskId: a.id });
  assert.equal(next.boards[0].tasks.some((x) => x.id === a.id), false);
});

test('TASK_ADD dengan kolom tidak valid jatuh ke kolom pertama', () => {
  const { state, board, todo } = setup();
  const t = createTask({ title: 'X', columnId: 'hilang' });
  const next = kanbanReducer(state, { type: ACTIONS.TASK_ADD, boardId: board.id, task: t });
  assert.equal(next.boards[0].tasks.find((x) => x.id === t.id).columnId, todo.id);
});

test('COLUMN_ADD dan COLUMN_UPDATE', () => {
  const { state, board } = setup();
  const col = createColumn('Review', 'progress');
  let next = kanbanReducer(state, { type: ACTIONS.COLUMN_ADD, boardId: board.id, column: col });
  assert.equal(next.boards[0].columns.length, 4);
  next = kanbanReducer(next, { type: ACTIONS.COLUMN_UPDATE, boardId: board.id, columnId: col.id, changes: { name: 'QA', category: 'done' } });
  const updated = next.boards[0].columns.find((c) => c.id === col.id);
  assert.equal(updated.name, 'QA');
  assert.equal(updated.category, 'done');
});

test('COLUMN_DELETE memindahkan tugas ke kolom tujuan', () => {
  const { state, board, todo, progress } = setup();
  const next = kanbanReducer(state, {
    type: ACTIONS.COLUMN_DELETE, boardId: board.id, columnId: todo.id, moveToColumnId: progress.id,
  });
  assert.equal(next.boards[0].columns.length, 2);
  assert.deepEqual(ids(next, progress.id), ['C', 'A', 'B']);
  assert.equal(next.boards[0].tasks.length, 3);
});

test('COLUMN_DELETE tanpa tujuan menghapus tugas di dalamnya', () => {
  const { state, board, todo } = setup();
  const next = kanbanReducer(state, {
    type: ACTIONS.COLUMN_DELETE, boardId: board.id, columnId: todo.id, moveToColumnId: null,
  });
  assert.equal(next.boards[0].columns.length, 2);
  assert.deepEqual(next.boards[0].tasks.map((t) => t.title), ['C']);
});

test('COLUMN_DELETE tidak menghapus kolom terakhir', () => {
  const { state, board } = setup();
  let next = state;
  for (const col of [...board.columns]) {
    next = kanbanReducer(next, { type: ACTIONS.COLUMN_DELETE, boardId: board.id, columnId: col.id, moveToColumnId: null });
  }
  assert.equal(next.boards[0].columns.length, 1);
});

test('Board: add, rename, select, delete', () => {
  const s0 = createSampleState();
  const nb = createBoard('Baru');
  let s = kanbanReducer(s0, { type: ACTIONS.BOARD_ADD, board: nb });
  assert.equal(s.boards.length, 4);
  assert.equal(s.activeBoardId, nb.id);
  assert.equal(s.view, 'board');

  s = kanbanReducer(s, { type: ACTIONS.BOARD_RENAME, boardId: nb.id, name: 'Ganti' });
  assert.equal(s.boards.at(-1).name, 'Ganti');

  s = kanbanReducer(s, { type: ACTIONS.BOARD_DELETE, boardId: nb.id });
  assert.equal(s.boards.length, 3);
  assert.equal(s.activeBoardId, s.boards[0].id);

  s = kanbanReducer(s, { type: ACTIONS.BOARD_SELECT, boardId: s.boards[1].id });
  assert.equal(s.activeBoardId, s.boards[1].id);
  assert.equal(s.view, 'board');
  assert.equal(kanbanReducer(s, { type: ACTIONS.BOARD_SELECT, boardId: 'x' }), s);
});

test('Menghapus semua board -> activeBoardId null dan kembali ke dashboard', () => {
  let s = createSampleState();
  s = kanbanReducer(s, { type: ACTIONS.BOARD_SELECT, boardId: s.boards[0].id });
  for (const b of [...s.boards]) s = kanbanReducer(s, { type: ACTIONS.BOARD_DELETE, boardId: b.id });
  assert.equal(s.boards.length, 0);
  assert.equal(s.activeBoardId, null);
  assert.equal(s.view, 'dashboard');
});

test('Perubahan pada satu board tidak memengaruhi board lain', () => {
  const s0 = createSampleState();
  const [b1, b2] = s0.boards;
  const s1 = kanbanReducer(s0, { type: ACTIONS.TASK_DELETE, boardId: b1.id, taskId: b1.tasks[0].id });
  assert.equal(s1.boards[1], b2);
  assert.equal(s1.boards[0].tasks.length, b1.tasks.length - 1);
});
