let counter = 0;

/**
 * Membuat ID unik. Memakai crypto.randomUUID bila tersedia (hanya ada di
 * konteks aman), dan fallback ke kombinasi waktu + angka acak.
 */
export function generateId(prefix = 'id') {
  let unique = '';
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      unique = crypto.randomUUID();
    }
  } catch {
    unique = '';
  }
  if (!unique) {
    counter += 1;
    unique = `${Date.now().toString(36)}-${counter.toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
  }
  return `${prefix}_${unique}`;
}
