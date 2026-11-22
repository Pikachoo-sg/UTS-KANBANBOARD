import { getDeadlineInfo, todayString } from './date.js';

function emptyStats() {
  return { total: 0, todo: 0, progress: 0, done: 0, overdue: 0, percent: 0 };
}

function finalize(stats) {
  stats.percent = stats.total === 0 ? 0 : Math.round((stats.done / stats.total) * 100);
  return stats;
}

/** Statistik satu board. Kategori tiap tugas ditentukan oleh kategori kolomnya. */
export function getBoardStats(board, today = todayString()) {
  const categoryByColumn = new Map(board.columns.map((c) => [c.id, c.category]));
  const stats = emptyStats();
  for (const task of board.tasks) {
    const category = categoryByColumn.get(task.columnId) ?? 'todo';
    stats.total += 1;
    stats[category] += 1;
    if (category !== 'done' && task.deadline && task.deadline < today) stats.overdue += 1;
  }
  return finalize(stats);
}

/** Statistik gabungan seluruh board. */
export function aggregateStats(boards, today = todayString()) {
  const stats = emptyStats();
  for (const board of boards) {
    const b = getBoardStats(board, today);
    stats.total += b.total;
    stats.todo += b.todo;
    stats.progress += b.progress;
    stats.done += b.done;
    stats.overdue += b.overdue;
  }
  return finalize(stats);
}

/** Tugas belum selesai yang punya deadline, diurutkan dari yang paling dekat/terlambat. */
export function getUpcomingTasks(boards, limit = 5, today = todayString()) {
  const items = [];
  for (const board of boards) {
    const categoryByColumn = new Map(board.columns.map((c) => [c.id, c.category]));
    for (const task of board.tasks) {
      if (!task.deadline) continue;
      if (categoryByColumn.get(task.columnId) === 'done') continue;
      const info = getDeadlineInfo(task.deadline, false, today);
      if (!info) continue;
      items.push({ task, board, info });
    }
  }
  items.sort((a, b) => a.task.deadline.localeCompare(b.task.deadline));
  return items.slice(0, limit);
}
