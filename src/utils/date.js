const pad = (n) => String(n).padStart(2, '0');

const DAY_MS = 24 * 60 * 60 * 1000;

function makeFormatter(options) {
  try {
    return new Intl.DateTimeFormat('id-ID', options);
  } catch {
    return null;
  }
}

const shortFormatter = makeFormatter({ day: 'numeric', month: 'short', year: 'numeric' });
const longFormatter = makeFormatter({
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** Date -> 'YYYY-MM-DD' berdasarkan zona waktu lokal. */
export function toDateString(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayString(now = new Date()) {
  return toDateString(now);
}

/** Memastikan string adalah tanggal kalender yang nyata ('YYYY-MM-DD'). */
export function isValidDateString(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

export function isValidIso(value) {
  return typeof value === 'string' && value !== '' && !Number.isNaN(Date.parse(value));
}

/** 'YYYY-MM-DD' -> Date lokal (tanpa pergeseran zona waktu). */
export function parseDateString(value) {
  if (!isValidDateString(value)) return null;
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Timestamp ISO -> 'YYYY-MM-DD' (zona waktu lokal). '' bila tidak valid. */
export function isoToDateString(iso) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : toDateString(date);
}

export function addDaysToDateString(value, days) {
  const date = parseDateString(value);
  if (!date) return '';
  date.setDate(date.getDate() + days);
  return toDateString(date);
}

/** Selisih hari kalender dari `from` ke `to` (keduanya 'YYYY-MM-DD'). */
export function diffInDays(from, to) {
  const a = parseDateString(from);
  const b = parseDateString(to);
  if (!a || !b) return 0;
  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}

/** Menerima 'YYYY-MM-DD' atau timestamp ISO. */
export function formatDate(value) {
  const date = isValidDateString(value) ? parseDateString(value) : new Date(value);
  if (!date || Number.isNaN(date.getTime())) return '-';
  return shortFormatter ? shortFormatter.format(date) : toDateString(date);
}

export function formatLongDate(date = new Date()) {
  return longFormatter ? longFormatter.format(date) : toDateString(date);
}

/**
 * Informasi tampilan deadline.
 * tone: 'done' | 'overdue' | 'soon' | 'normal'
 */
export function getDeadlineInfo(deadline, isDone, today = todayString()) {
  if (!deadline || !isValidDateString(deadline)) return null;
  const date = formatDate(deadline);
  if (isDone) return { tone: 'done', date, hint: 'Selesai' };
  const diff = diffInDays(today, deadline);
  if (diff < 0) return { tone: 'overdue', date, hint: `Terlambat ${-diff} hari` };
  if (diff === 0) return { tone: 'soon', date, hint: 'Hari ini' };
  if (diff === 1) return { tone: 'soon', date, hint: 'Besok' };
  if (diff <= 3) return { tone: 'soon', date, hint: `${diff} hari lagi` };
  return { tone: 'normal', date, hint: `${diff} hari lagi` };
}
