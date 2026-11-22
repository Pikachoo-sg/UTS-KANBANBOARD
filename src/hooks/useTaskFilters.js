import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_FILTERS } from '../utils/constants.js';
import { filterTasks, hasActiveFilters, isDefaultFilters, sanitizeFilters, sortTasks } from '../utils/filters.js';
import { collectLabels } from '../utils/labels.js';

/**
 * Mengelola pencarian, filter, dan pengurutan untuk satu board.
 * Semua kriteria berlaku bersamaan.
 */
export function useTaskFilters(board) {
  const [rawFilters, setRawFilters] = useState(DEFAULT_FILTERS);

  const labels = useMemo(() => collectLabels(board.tasks), [board.tasks]);

  const filters = useMemo(
    () => sanitizeFilters(rawFilters, { labels, columns: board.columns }),
    [rawFilters, labels, board.columns],
  );

  const setFilter = useCallback((key, value) => {
    setRawFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => setRawFilters(DEFAULT_FILTERS), []);

  const { tasksByColumn, totalByColumn, matchCount } = useMemo(() => {
    const visible = sortTasks(filterTasks(board.tasks, filters), filters.sort);
    const byColumn = {};
    const totals = {};
    for (const column of board.columns) {
      byColumn[column.id] = [];
      totals[column.id] = 0;
    }
    for (const task of board.tasks) totals[task.columnId] = (totals[task.columnId] ?? 0) + 1;
    for (const task of visible) byColumn[task.columnId]?.push(task);
    return { tasksByColumn: byColumn, totalByColumn: totals, matchCount: visible.length };
  }, [board.tasks, board.columns, filters]);

  // Dengan filter status aktif, hanya kolom tersebut yang ditampilkan.
  const visibleColumns = useMemo(
    () => (filters.status === 'all' ? board.columns : board.columns.filter((c) => c.id === filters.status)),
    [board.columns, filters.status],
  );

  return {
    filters,
    labels,
    setFilter,
    resetFilters,
    tasksByColumn,
    totalByColumn,
    visibleColumns,
    matchCount,
    isFiltering: hasActiveFilters(filters),
    isDefault: isDefaultFilters(filters),
  };
}
