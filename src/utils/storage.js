import { STORAGE_KEY } from './constants.js';

/**
 * Lapisan akses LocalStorage. Semua fungsi aman dipanggil kapan saja:
 * tidak pernah melempar error, melainkan mengembalikan objek status.
 * (LocalStorage bisa tidak tersedia, penuh, atau berisi data rusak.)
 */

function getStorage() {
  if (typeof window === 'undefined') return null;
  return window.localStorage; // dapat melempar SecurityError -> ditangkap pemanggil
}

/**
 * Membaca & mem-parse data.
 * status: 'ok' | 'empty' (belum ada data) | 'invalid' (JSON rusak) | 'error' (storage tidak dapat diakses)
 */
export function readFromStorage(key = STORAGE_KEY) {
  let raw;
  try {
    const storage = getStorage();
    if (!storage) return { status: 'error', data: null, error: new Error('Storage tidak tersedia') };
    raw = storage.getItem(key);
  } catch (error) {
    return { status: 'error', data: null, error };
  }
  if (raw === null || raw === undefined) return { status: 'empty', data: null };
  try {
    return { status: 'ok', data: JSON.parse(raw) };
  } catch (error) {
    return { status: 'invalid', data: null, error };
  }
}

/** Menyimpan nilai sebagai JSON. Mengembalikan { ok, error? }. */
export function saveToStorage(value, key = STORAGE_KEY) {
  try {
    const storage = getStorage();
    if (!storage) return { ok: false, error: new Error('Storage tidak tersedia') };
    storage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

/** Menghapus data. Mengembalikan { ok, error? }. */
export function removeFromStorage(key = STORAGE_KEY) {
  try {
    const storage = getStorage();
    if (!storage) return { ok: false, error: new Error('Storage tidak tersedia') };
    storage.removeItem(key);
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

/** Mengubah error storage menjadi pesan yang ramah pengguna. */
export function describeStorageError(error) {
  const name = error?.name ?? '';
  const code = error?.code;
  if (name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED' || code === 22 || code === 1014) {
    return 'Penyimpanan browser penuh, perubahan terbaru tidak dapat disimpan.';
  }
  return 'Penyimpanan browser tidak dapat diakses, perubahan tidak akan tersimpan setelah halaman dimuat ulang.';
}
