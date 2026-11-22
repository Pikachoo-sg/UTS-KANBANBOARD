import { CATEGORIES, LIMITS, PRIORITIES } from './constants.js';
import { isValidDateString, isValidIso } from './date.js';
import { createDefaultColumns } from './factories.js';
import { generateId } from './id.js';
import { normalizeLabels } from './labels.js';

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const asString = (value) => (typeof value === 'string' ? value : '');

/** Menebak kategori dari nama kolom ketika data tersimpan tidak memuat kategori yang valid. */
function inferCategory(name) {
  const n = name.toLowerCase();
  if (/(done|selesai|complete|finish)/.test(n)) return 'done';
  if (/(to ?do|backlog|belum)/.test(n)) return 'todo';
  return 'progress';
}

function uniqueId(rawId, seen, prefix) {
  let id = asString(rawId).trim();
  if (!id || seen.has(id)) id = generateId(prefix);
  seen.add(id);
  return id;
}

function normalizeColumns(rawColumns) {
  const seen = new Set();
  const columns = [];
  if (Array.isArray(rawColumns)) {
    for (const raw of rawColumns) {
      if (!isObject(raw)) continue;
      const name = asString(raw.name).trim().slice(0, LIMITS.columnName).trim();
      if (!name) continue;
      columns.push({
        id: uniqueId(raw.id, seen, 'col'),
        name,
        category: CATEGORIES.includes(raw.category) ? raw.category : inferCategory(name),
      });
    }
  }
  return columns.length > 0 ? columns : createDefaultColumns();
}

function normalizeTasks(rawTasks, columns, nowIso) {
  const columnIds = new Set(columns.map((c) => c.id));
  const seen = new Set();
  const tasks = [];
  if (!Array.isArray(rawTasks)) return tasks;
  for (const raw of rawTasks) {
    if (!isObject(raw)) continue;
    const title = asString(raw.title).trim().slice(0, LIMITS.taskTitle).trim();
    if (!title) continue;
    tasks.push({
      id: uniqueId(raw.id, seen, 'task'),
      title,
      description: asString(raw.description).slice(0, LIMITS.taskDescription),
      // Tugas yang menunjuk kolom yang tidak ada dipindahkan ke kolom pertama.
      columnId: columnIds.has(raw.columnId) ? raw.columnId : columns[0].id,
      priority: PRIORITIES.includes(raw.priority) ? raw.priority : 'medium',
      createdAt: isValidIso(raw.createdAt) ? raw.createdAt : nowIso,
      deadline: isValidDateString(raw.deadline) ? raw.deadline : '',
      labels: normalizeLabels(raw.labels),
    });
  }
  return tasks;
}

/**
 * Memvalidasi dan memperbaiki data hasil JSON.parse dari LocalStorage.
 * Mengembalikan state yang aman dipakai, atau null bila data tidak dapat dipulihkan
 * (pemanggil kemudian memakai data contoh).
 */
export function normalizeState(raw) {
  if (!isObject(raw) || !Array.isArray(raw.boards)) return null;

  const nowIso = new Date().toISOString();
  const seen = new Set();
  const boards = [];

  for (const rawBoard of raw.boards) {
    if (!isObject(rawBoard)) continue;
    const columns = normalizeColumns(rawBoard.columns);
    boards.push({
      id: uniqueId(rawBoard.id, seen, 'board'),
      name:
        asString(rawBoard.name).trim().slice(0, LIMITS.boardName).trim() ||
        `Board ${boards.length + 1}`,
      createdAt: isValidIso(rawBoard.createdAt) ? rawBoard.createdAt : nowIso,
      columns,
      tasks: normalizeTasks(rawBoard.tasks, columns, nowIso),
    });
  }

  // Ada entri board tetapi tidak satu pun yang valid -> data dianggap rusak.
  if (raw.boards.length > 0 && boards.length === 0) return null;

  const activeBoardId = boards.some((b) => b.id === raw.activeBoardId)
    ? raw.activeBoardId
    : boards[0]?.id ?? null;
  const view = raw.view === 'board' && activeBoardId ? 'board' : 'dashboard';

  return { activeBoardId, view, boards };
}
