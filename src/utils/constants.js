export const APP_NAME = 'KanbanFlow';

export const STORAGE_KEY = 'kanbanflow:data';
export const STORAGE_VERSION = 1;

export const VIEWS = { DASHBOARD: 'dashboard', BOARD: 'board' };

export const PRIORITIES = ['low', 'medium', 'high'];
export const PRIORITY_META = {
  low: { label: 'Low', rank: 0 },
  medium: { label: 'Medium', rank: 1 },
  high: { label: 'High', rank: 2 },
};

/**
 * Kategori kolom. Karena pengguna boleh membuat kolom sendiri, setiap kolom
 * dipetakan ke salah satu kategori ini agar Dashboard tetap dapat menghitung
 * tugas "belum dikerjakan", "sedang dikerjakan", dan "selesai".
 */
export const CATEGORIES = ['todo', 'progress', 'done'];
export const CATEGORY_META = {
  todo: { label: 'Belum dikerjakan' },
  progress: { label: 'Sedang dikerjakan' },
  done: { label: 'Selesai' },
};

export const LIMITS = {
  boardName: 60,
  columnName: 40,
  taskTitle: 120,
  taskDescription: 1000,
  label: 24,
  labelsPerTask: 6,
};

export const SORT_OPTIONS = [
  { value: 'manual', label: 'Urutan manual' },
  { value: 'created-desc', label: 'Dibuat: terbaru' },
  { value: 'created-asc', label: 'Dibuat: terlama' },
  { value: 'deadline-asc', label: 'Deadline: terdekat' },
  { value: 'deadline-desc', label: 'Deadline: terjauh' },
];

export const DEFAULT_FILTERS = {
  search: '',
  priority: 'all',
  label: 'all',
  status: 'all',
  sort: 'manual',
};
