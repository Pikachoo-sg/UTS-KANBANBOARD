import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeState } from '../src/utils/normalizeState.js';
import { createSampleState } from '../src/utils/sampleData.js';
import { DEFAULT_FILTERS } from '../src/utils/constants.js';
import { filterTasks, hasActiveFilters, isDefaultFilters, sanitizeFilters, sortTasks } from '../src/utils/filters.js';
import { aggregateStats, getBoardStats, getUpcomingTasks } from '../src/utils/stats.js';
import { collectLabels, normalizeLabels } from '../src/utils/labels.js';
import { validateName, validateTaskForm } from '../src/utils/validators.js';
import { addDaysToDateString, diffInDays, getDeadlineInfo, isValidDateString, todayString } from '../src/utils/date.js';
import { createTask, sanitizeTaskChanges } from '../src/utils/factories.js';
import { generateId } from '../src/utils/id.js';

// ----------------------------------------------------------------- tanggal
test('isValidDateString', () => {
  assert.ok(isValidDateString('2026-02-28'));
  assert.ok(isValidDateString('2028-02-29'));
  assert.ok(!isValidDateString('2026-02-30'));
  assert.ok(!isValidDateString('2026-13-01'));
  assert.ok(!isValidDateString('26-01-01'));
  assert.ok(!isValidDateString(''));
  assert.ok(!isValidDateString(null));
});

test('addDaysToDateString & diffInDays (lintas bulan/tahun)', () => {
  assert.equal(addDaysToDateString('2026-12-31', 1), '2027-01-01');
  assert.equal(addDaysToDateString('2026-03-01', -1), '2026-02-28');
  assert.equal(diffInDays('2026-12-31', '2027-01-02'), 2);
  assert.equal(diffInDays('2026-11-20', '2026-11-18'), -2);
});

test('getDeadlineInfo', () => {
  const today = '2026-11-20';
  assert.equal(getDeadlineInfo('', false, today), null);
  assert.equal(getDeadlineInfo('2026-11-18', false, today).tone, 'overdue');
  assert.equal(getDeadlineInfo('2026-11-18', false, today).hint, 'Terlambat 2 hari');
  assert.equal(getDeadlineInfo('2026-11-20', false, today).hint, 'Hari ini');
  assert.equal(getDeadlineInfo('2026-11-21', false, today).hint, 'Besok');
  assert.equal(getDeadlineInfo('2026-11-23', false, today).tone, 'soon');
  assert.equal(getDeadlineInfo('2026-11-30', false, today).tone, 'normal');
  assert.equal(getDeadlineInfo('2026-11-01', true, today).tone, 'done');
});

test('generateId unik', () => {
  const set = new Set(Array.from({ length: 500 }, () => generateId('t')));
  assert.equal(set.size, 500);
});

// ------------------------------------------------------------------- label
test('normalizeLabels: trim, dedupe tanpa beda huruf, batasi', () => {
  assert.deepEqual(normalizeLabels([' UI ', 'ui', 'Frontend', '', 5, null]), ['UI', 'Frontend']);
  assert.equal(normalizeLabels(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']).length, 6);
  assert.equal(normalizeLabels(['x'.repeat(50)])[0].length, 24);
  assert.deepEqual(normalizeLabels('bukan array'), []);
});

test('collectLabels unik & terurut', () => {
  const tasks = [{ labels: ['Zeta', 'alpha'] }, { labels: ['ALPHA', 'Beta'] }, {}];
  assert.deepEqual(collectLabels(tasks).map((l) => l.name), ['alpha', 'Beta', 'Zeta']);
});

// -------------------------------------------------------------- validasi
test('validateTaskForm', () => {
  const base = { title: 'Ok', description: '', columnId: 'c', priority: 'low', deadline: '' };
  assert.deepEqual(validateTaskForm(base), {});
  assert.ok(validateTaskForm({ ...base, title: '   ' }).title);
  assert.ok(validateTaskForm({ ...base, title: 'x'.repeat(121) }).title);
  assert.ok(validateTaskForm({ ...base, description: 'x'.repeat(1001) }).description);
  assert.ok(validateTaskForm({ ...base, columnId: '' }).columnId);
  assert.ok(validateTaskForm({ ...base, priority: 'urgent' }).priority);
  assert.ok(validateTaskForm({ ...base, deadline: '2026-02-30' }).deadline);
  assert.ok(validateTaskForm({ ...base, deadline: '2000-01-01' }).deadline);
  assert.deepEqual(validateTaskForm({ ...base, deadline: addDaysToDateString(todayString(), 3) }), {});
  // saat edit: deadline dibandingkan dengan tanggal dibuat, bukan hari ini
  const created = new Date(2026, 0, 10, 12).toISOString();
  assert.deepEqual(validateTaskForm({ ...base, deadline: '2026-01-11' }, { createdAt: created }), {});
  assert.ok(validateTaskForm({ ...base, deadline: '2026-01-09' }, { createdAt: created }).deadline);
});

test('validateName', () => {
  const opts = { label: 'Nama', max: 5, existing: ['Satu', 'dua'] };
  assert.equal(validateName('Tiga', opts), '');
  assert.match(validateName('  ', opts), /wajib/);
  assert.match(validateName('enam enam', opts), /maksimal/);
  assert.match(validateName('SATU', opts), /sudah digunakan/);
  assert.match(validateName(' dua ', opts), /sudah digunakan/);
});

test('sanitizeTaskChanges menolak judul kosong & prioritas tak valid', () => {
  assert.deepEqual(sanitizeTaskChanges({ title: '   ', priority: 'x', deadline: 'salah' }), { deadline: '' });
  assert.deepEqual(sanitizeTaskChanges({ title: ' Hai ', priority: 'high' }), { title: 'Hai', priority: 'high' });
});

// ----------------------------------------------------- normalisasi state
test('normalizeState: state valid dipertahankan apa adanya', () => {
  const sample = createSampleState();
  const out = normalizeState(JSON.parse(JSON.stringify(sample)));
  assert.deepEqual(out.boards, sample.boards);
  assert.equal(out.activeBoardId, sample.activeBoardId);
});

test('normalizeState: memperbaiki data setengah rusak', () => {
  const out = normalizeState({
    activeBoardId: 'tidak-ada',
    view: 'board',
    boards: [
      null,
      { id: 'b1', name: '   ', columns: [{ id: 'c1', name: 'Selesai' }, { id: 'c1', name: 'Dup' }, { name: '' }, 7],
        tasks: [
          { id: 't1', title: 'A', columnId: 'hilang', priority: 'zzz', deadline: 'nope', labels: ['x', 'X', 3] },
          { id: 't1', title: 'B', columnId: 'c1' },
          { id: 't3', title: '   ' },
          'rusak',
        ] },
      { id: 'b1', name: 'Duplikat id', columns: 'bukan array', tasks: null },
    ],
  });
  assert.equal(out.boards.length, 2);
  const [b1, b2] = out.boards;
  assert.equal(b1.name, 'Board 1');
  assert.equal(out.activeBoardId, 'b1');
  assert.notEqual(b2.id, 'b1');
  assert.equal(b1.columns.length, 2);
  assert.equal(b1.columns[0].category, 'done'); // ditebak dari nama "Selesai"
  assert.notEqual(b1.columns[1].id, 'c1'); // id ganda diganti
  assert.equal(b1.tasks.length, 2);
  assert.equal(b1.tasks[0].columnId, 'c1'); // pindah ke kolom pertama
  assert.equal(b1.tasks[0].priority, 'medium');
  assert.equal(b1.tasks[0].deadline, '');
  assert.deepEqual(b1.tasks[0].labels, ['x']);
  assert.notEqual(b1.tasks[1].id, 't1');
  assert.equal(b2.columns.length, 3); // kolom bawaan
  assert.equal(b2.tasks.length, 0);
});

test('normalizeState: input tidak valid -> null', () => {
  for (const bad of [null, undefined, 5, 'x', [], {}, { boards: {} }, { boards: [1, 2] }]) {
    assert.equal(normalizeState(bad), null);
  }
  const empty = normalizeState({ boards: [] });
  assert.deepEqual(empty, { activeBoardId: null, view: 'dashboard', boards: [] });
});

// ------------------------------------------------------- filter & urutan
function fixtureTasks() {
  const mk = (title, o = {}) => createTask({ title, columnId: 'c1', ...o });
  return [
    mk('Belajar React', { priority: 'high', labels: ['Frontend'], deadline: '2030-01-10', createdAt: '2026-01-03T00:00:00.000Z' }),
    mk('Desain logo', { priority: 'low', labels: ['Desain', 'UI'], deadline: '', createdAt: '2026-01-01T00:00:00.000Z' }),
    mk('Review kode React', { priority: 'high', labels: ['Frontend', 'QA'], deadline: '2030-01-05', createdAt: '2026-01-02T00:00:00.000Z', columnId: 'c2' }),
    mk('Tulis dokumentasi', { priority: 'medium', labels: [], deadline: '2030-01-20', createdAt: '2026-01-04T00:00:00.000Z', columnId: 'c2' }),
  ];
}
const titles = (list) => list.map((t) => t.title);

test('filterTasks: pencarian, prioritas, label, status, dan kombinasinya', () => {
  const tasks = fixtureTasks();
  const f = (o) => filterTasks(tasks, { ...DEFAULT_FILTERS, ...o });
  assert.equal(f({}).length, 4);
  assert.deepEqual(titles(f({ search: '  REACT ' })), ['Belajar React', 'Review kode React']);
  assert.deepEqual(titles(f({ priority: 'low' })), ['Desain logo']);
  assert.deepEqual(titles(f({ label: 'frontend' })), ['Belajar React', 'Review kode React']);
  assert.deepEqual(titles(f({ status: 'c2' })), ['Review kode React', 'Tulis dokumentasi']);
  assert.deepEqual(titles(f({ search: 'react', priority: 'high', label: 'qa', status: 'c2' })), ['Review kode React']);
  assert.deepEqual(titles(f({ search: 'react', priority: 'low' })), []);
});

test('sortTasks: tanggal dibuat & deadline (tanpa deadline selalu terakhir)', () => {
  const tasks = fixtureTasks();
  const original = titles(tasks);
  assert.deepEqual(titles(sortTasks(tasks, 'created-desc')), ['Tulis dokumentasi', 'Belajar React', 'Review kode React', 'Desain logo']);
  assert.deepEqual(titles(sortTasks(tasks, 'created-asc')), ['Desain logo', 'Review kode React', 'Belajar React', 'Tulis dokumentasi']);
  assert.deepEqual(titles(sortTasks(tasks, 'deadline-asc')), ['Review kode React', 'Belajar React', 'Tulis dokumentasi', 'Desain logo']);
  assert.deepEqual(titles(sortTasks(tasks, 'deadline-desc')), ['Tulis dokumentasi', 'Belajar React', 'Review kode React', 'Desain logo']);
  assert.deepEqual(titles(sortTasks(tasks, 'manual')), original);
  assert.deepEqual(titles(tasks), original, 'array asli tidak berubah');
});

test('sanitizeFilters mereset label/status yang sudah tidak ada', () => {
  const ctx = { labels: [{ key: 'ui', name: 'UI' }], columns: [{ id: 'c1' }] };
  const out = sanitizeFilters({ ...DEFAULT_FILTERS, label: 'hilang', status: 'x' }, ctx);
  assert.equal(out.label, 'all');
  assert.equal(out.status, 'all');
  assert.equal(sanitizeFilters({ ...DEFAULT_FILTERS, label: 'ui', status: 'c1' }, ctx).label, 'ui');
});

test('hasActiveFilters / isDefaultFilters', () => {
  assert.equal(hasActiveFilters(DEFAULT_FILTERS), false);
  assert.equal(hasActiveFilters({ ...DEFAULT_FILTERS, search: ' ' }), false);
  assert.equal(hasActiveFilters({ ...DEFAULT_FILTERS, search: 'a' }), true);
  assert.equal(isDefaultFilters({ ...DEFAULT_FILTERS, sort: 'created-asc' }), false);
  assert.equal(isDefaultFilters(DEFAULT_FILTERS), true);
});

// ---------------------------------------------------------------- statistik
test('statistik board & agregat', () => {
  const s = createSampleState();
  const today = todayString();
  let total = 0, done = 0, todo = 0, progress = 0;
  for (const b of s.boards) {
    const st = getBoardStats(b, today);
    assert.equal(st.todo + st.progress + st.done, st.total);
    assert.equal(st.total, b.tasks.length);
    total += st.total; done += st.done; todo += st.todo; progress += st.progress;
  }
  const agg = aggregateStats(s.boards, today);
  assert.equal(agg.total, total);
  assert.equal(agg.done, done);
  assert.equal(agg.todo, todo);
  assert.equal(agg.progress, progress);
  assert.equal(agg.percent, Math.round((done / total) * 100));
  assert.ok(agg.overdue >= 1, 'data contoh memuat tugas terlambat');
});

test('statistik: board kosong -> 0% tanpa NaN', () => {
  assert.equal(aggregateStats([]).percent, 0);
  const empty = createSampleState().boards[0];
  empty.tasks = [];
  assert.deepEqual(getBoardStats(empty), { total: 0, todo: 0, progress: 0, done: 0, overdue: 0, percent: 0 });
});

test('getUpcomingTasks: mengabaikan tugas selesai/tanpa deadline & terurut', () => {
  const s = createSampleState();
  const items = getUpcomingTasks(s.boards, 50);
  assert.ok(items.length > 0);
  for (const { task, board } of items) {
    assert.ok(task.deadline);
    const col = board.columns.find((c) => c.id === task.columnId);
    assert.notEqual(col.category, 'done');
  }
  const sorted = [...items].sort((a, b) => a.task.deadline.localeCompare(b.task.deadline));
  assert.deepEqual(items.map((i) => i.task.id), sorted.map((i) => i.task.id));
  assert.equal(getUpcomingTasks(s.boards, 2).length, 2);
});

test('data contoh: valid, deadline tidak sebelum tanggal dibuat, tugas merujuk kolom yang ada', () => {
  const s = createSampleState();
  assert.ok(s.boards.length >= 2);
  for (const b of s.boards) {
    const cols = new Set(b.columns.map((c) => c.id));
    for (const t of b.tasks) {
      assert.ok(cols.has(t.columnId));
      assert.deepEqual(validateTaskForm({ ...t }, { createdAt: t.createdAt }), {}, t.title);
    }
  }
});
