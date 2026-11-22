import { DEFAULT_FILTERS } from './constants.js';
import { labelKey } from './labels.js';

/**
 * Filter label/status bisa menunjuk ke data yang sudah tidak ada (misalnya
 * label terakhir dihapus). Fungsi ini mengembalikannya ke 'all' agar UI
 * dan hasil filter tetap konsisten.
 */
export function sanitizeFilters(filters, { labels, columns }) {
  return {
    ...filters,
    label:
      filters.label === 'all' || labels.some((l) => l.key === filters.label)
        ? filters.label
        : 'all',
    status:
      filters.status === 'all' || columns.some((c) => c.id === filters.status)
        ? filters.status
        : 'all',
  };
}

/** True bila ada kriteria penyaringan (pencarian/prioritas/label/status) yang aktif. */
export function hasActiveFilters(filters) {
  return (
    filters.search.trim() !== '' ||
    filters.priority !== 'all' ||
    filters.label !== 'all' ||
    filters.status !== 'all'
  );
}

/** True bila semua kriteria (termasuk pengurutan) masih bawaan. */
export function isDefaultFilters(filters) {
  return !hasActiveFilters(filters) && filters.sort === DEFAULT_FILTERS.sort;
}

/** Pencarian judul, prioritas, label, dan status dapat dipakai bersamaan (AND). */
export function filterTasks(tasks, filters) {
  const query = filters.search.trim().toLowerCase();
  return tasks.filter((task) => {
    if (query && !task.title.toLowerCase().includes(query)) return false;
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    if (filters.status !== 'all' && task.columnId !== filters.status) return false;
    if (filters.label !== 'all' && !task.labels.some((l) => labelKey(l) === filters.label)) {
      return false;
    }
    return true;
  });
}

function compareDeadline(direction) {
  return (a, b) => {
    if (!a.deadline && !b.deadline) return 0;
    if (!a.deadline) return 1; // tanpa deadline selalu di akhir
    if (!b.deadline) return -1;
    return direction * a.deadline.localeCompare(b.deadline);
  };
}

function createdTime(task) {
  const time = Date.parse(task.createdAt);
  return Number.isNaN(time) ? 0 : time;
}

/** Mengurutkan tanpa mengubah array asli. 'manual' mempertahankan urutan drag & drop. */
export function sortTasks(tasks, sort) {
  switch (sort) {
    case 'created-desc':
      return [...tasks].sort((a, b) => createdTime(b) - createdTime(a));
    case 'created-asc':
      return [...tasks].sort((a, b) => createdTime(a) - createdTime(b));
    case 'deadline-asc':
      return [...tasks].sort(compareDeadline(1));
    case 'deadline-desc':
      return [...tasks].sort(compareDeadline(-1));
    default:
      return tasks;
  }
}
