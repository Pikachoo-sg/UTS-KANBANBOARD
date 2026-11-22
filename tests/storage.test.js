import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEY } from '../src/utils/constants.js';
import { describeStorageError, readFromStorage, removeFromStorage, saveToStorage } from '../src/utils/storage.js';
import { loadInitialState, serializeState } from '../src/state/initialState.js';
import { createSampleState } from '../src/utils/sampleData.js';

function installStorage(overrides = {}) {
  const data = new Map();
  const storage = {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => void data.set(k, String(v)),
    removeItem: (k) => void data.delete(k),
    ...overrides,
  };
  globalThis.window = { localStorage: storage };
  return data;
}

beforeEach(() => {
  installStorage();
});

test('readFromStorage: empty -> ok -> invalid', () => {
  const data = installStorage();
  assert.equal(readFromStorage().status, 'empty');
  data.set(STORAGE_KEY, JSON.stringify({ a: 1 }));
  assert.deepEqual(readFromStorage(), { status: 'ok', data: { a: 1 } });
  data.set(STORAGE_KEY, '{rusak');
  assert.equal(readFromStorage().status, 'invalid');
});

test('readFromStorage: storage melempar error -> status error', () => {
  installStorage({ getItem: () => { throw new Error('SecurityError'); } });
  assert.equal(readFromStorage().status, 'error');
});

test('saveToStorage & removeFromStorage', () => {
  const data = installStorage();
  assert.deepEqual(saveToStorage({ x: 1 }), { ok: true });
  assert.equal(data.get(STORAGE_KEY), '{"x":1}');
  assert.deepEqual(removeFromStorage(), { ok: true });
  assert.equal(data.has(STORAGE_KEY), false);
});

test('saveToStorage gagal (quota) tidak melempar error', () => {
  const err = Object.assign(new Error('full'), { name: 'QuotaExceededError' });
  installStorage({ setItem: () => { throw err; } });
  const res = saveToStorage({ x: 1 });
  assert.equal(res.ok, false);
  assert.match(describeStorageError(res.error), /penuh/);
});

test('tanpa window (mis. SSR) tidak melempar error', () => {
  delete globalThis.window;
  assert.equal(readFromStorage().status, 'error');
  assert.equal(saveToStorage({}).ok, false);
  assert.equal(removeFromStorage().ok, false);
});

test('loadInitialState: pertama kali -> data contoh tanpa notice', () => {
  installStorage();
  const { state, notice } = loadInitialState();
  assert.equal(notice, null);
  assert.equal(state.boards.length, 3);
});

test('loadInitialState: memuat data yang tersimpan', () => {
  const data = installStorage();
  const sample = createSampleState();
  sample.boards = sample.boards.slice(0, 1);
  sample.activeBoardId = sample.boards[0].id;
  data.set(STORAGE_KEY, JSON.stringify(serializeState(sample)));
  const { state, notice } = loadInitialState();
  assert.equal(notice, null);
  assert.equal(state.boards.length, 1);
  assert.equal(state.boards[0].id, sample.boards[0].id);
});

test('loadInitialState: JSON rusak -> data contoh + notice', () => {
  const data = installStorage();
  data.set(STORAGE_KEY, 'bukan json');
  const { state, notice } = loadInitialState();
  assert.ok(notice);
  assert.equal(state.boards.length, 3);
});

test('loadInitialState: JSON valid tapi bentuk salah -> data contoh + notice', () => {
  for (const bad of ['null', '123', '"teks"', '[]', '{"boards":"x"}', '{"boards":[1,null,"a"]}']) {
    const data = installStorage();
    data.set(STORAGE_KEY, bad);
    const { state, notice } = loadInitialState();
    assert.ok(notice, `notice untuk ${bad}`);
    assert.equal(state.boards.length, 3, `sample untuk ${bad}`);
  }
});

test('loadInitialState: storage tidak dapat diakses -> data contoh + notice', () => {
  installStorage({ getItem: () => { throw new Error('denied'); } });
  const { state, notice } = loadInitialState();
  assert.ok(notice);
  assert.equal(state.boards.length, 3);
});

test('loadInitialState: daftar board kosong adalah data valid (bukan rusak)', () => {
  const data = installStorage();
  data.set(STORAGE_KEY, JSON.stringify({ boards: [], activeBoardId: null, view: 'dashboard' }));
  const { state, notice } = loadInitialState();
  assert.equal(notice, null);
  assert.equal(state.boards.length, 0);
});
