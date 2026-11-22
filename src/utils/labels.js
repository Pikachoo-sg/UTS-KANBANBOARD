import { LIMITS } from './constants.js';

export const labelKey = (name) => name.toLowerCase();

/** Merapikan daftar label: trim, hapus duplikat (tanpa membedakan huruf besar/kecil), batasi panjang & jumlah. */
export function normalizeLabels(labels) {
  if (!Array.isArray(labels)) return [];
  const seen = new Set();
  const result = [];
  for (const raw of labels) {
    if (typeof raw !== 'string') continue;
    const name = raw.replace(/\s+/g, ' ').trim().slice(0, LIMITS.label).trim();
    const key = labelKey(name);
    if (!name || seen.has(key)) continue;
    seen.add(key);
    result.push(name);
    if (result.length >= LIMITS.labelsPerTask) break;
  }
  return result;
}

/** Mengumpulkan semua label unik dari sekumpulan tugas -> [{ key, name }]. */
export function collectLabels(tasks) {
  const map = new Map();
  for (const task of tasks) {
    for (const name of task.labels ?? []) {
      const key = labelKey(name);
      if (!map.has(key)) map.set(key, name);
    }
  }
  return [...map.entries()]
    .map(([key, name]) => ({ key, name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'id'));
}
