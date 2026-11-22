import { LIMITS, PRIORITIES } from './constants.js';
import { isoToDateString, isValidDateString, todayString } from './date.js';

/**
 * Validasi form tugas. Mengembalikan objek { field: pesanError }.
 * Objek kosong berarti valid.
 */
export function validateTaskForm(values, { createdAt } = {}) {
  const errors = {};

  const title = String(values.title ?? '').trim();
  if (!title) errors.title = 'Judul tugas wajib diisi.';
  else if (title.length > LIMITS.taskTitle) {
    errors.title = `Judul maksimal ${LIMITS.taskTitle} karakter.`;
  }

  if (String(values.description ?? '').length > LIMITS.taskDescription) {
    errors.description = `Deskripsi maksimal ${LIMITS.taskDescription} karakter.`;
  }

  if (!values.columnId) errors.columnId = 'Pilih status tugas.';

  if (!PRIORITIES.includes(values.priority)) errors.priority = 'Pilih tingkat prioritas.';

  if (values.deadline) {
    if (!isValidDateString(values.deadline)) {
      errors.deadline = 'Format tanggal tidak valid.';
    } else {
      const created = createdAt ? isoToDateString(createdAt) : todayString();
      if (created && values.deadline < created) {
        errors.deadline = 'Deadline tidak boleh sebelum tanggal dibuat.';
      }
    }
  }

  return errors;
}

/**
 * Validasi nama (board / kolom): wajib, panjang maksimal, dan unik
 * (tanpa membedakan huruf besar/kecil). Mengembalikan pesan error atau ''.
 */
export function validateName(value, { label, max, existing = [] }) {
  const name = String(value ?? '').trim();
  if (!name) return `${label} wajib diisi.`;
  if (name.length > max) return `${label} maksimal ${max} karakter.`;
  const lower = name.toLowerCase();
  if (existing.some((item) => String(item).trim().toLowerCase() === lower)) {
    return `${label} sudah digunakan.`;
  }
  return '';
}
