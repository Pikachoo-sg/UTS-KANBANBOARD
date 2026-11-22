import { CATEGORIES, PRIORITIES } from './constants.js';
import { isValidDateString } from './date.js';
import { generateId } from './id.js';
import { normalizeLabels } from './labels.js';

export function createColumn(name, category = 'progress') {
  return {
    id: generateId('col'),
    name: String(name).trim(),
    category: CATEGORIES.includes(category) ? category : 'progress',
  };
}

export function createDefaultColumns() {
  return [
    createColumn('To Do', 'todo'),
    createColumn('In Progress', 'progress'),
    createColumn('Done', 'done'),
  ];
}

export function createBoard(name, columns = createDefaultColumns()) {
  return {
    id: generateId('board'),
    name: String(name).trim(),
    createdAt: new Date().toISOString(),
    columns,
    tasks: [],
  };
}

export function createTask(fields) {
  return {
    id: generateId('task'),
    title: String(fields.title ?? '').trim(),
    description: String(fields.description ?? '').trim(),
    columnId: fields.columnId,
    priority: PRIORITIES.includes(fields.priority) ? fields.priority : 'medium',
    createdAt: fields.createdAt ?? new Date().toISOString(),
    deadline: isValidDateString(fields.deadline) ? fields.deadline : '',
    labels: normalizeLabels(fields.labels),
  };
}

/** Membersihkan perubahan parsial pada tugas; hanya field yang diberikan yang diproses. */
export function sanitizeTaskChanges(changes) {
  const out = {};
  if ('title' in changes) {
    const title = String(changes.title ?? '').trim();
    if (title) out.title = title;
  }
  if ('description' in changes) out.description = String(changes.description ?? '').trim();
  if ('columnId' in changes && changes.columnId) out.columnId = changes.columnId;
  if ('priority' in changes && PRIORITIES.includes(changes.priority)) {
    out.priority = changes.priority;
  }
  if ('deadline' in changes) {
    out.deadline = isValidDateString(changes.deadline) ? changes.deadline : '';
  }
  if ('labels' in changes) out.labels = normalizeLabels(changes.labels);
  return out;
}
