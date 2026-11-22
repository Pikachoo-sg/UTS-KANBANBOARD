import { STORAGE_VERSION } from '../utils/constants.js';
import { normalizeState } from '../utils/normalizeState.js';
import { createSampleState } from '../utils/sampleData.js';
import { readFromStorage } from '../utils/storage.js';

/**
 * Menentukan state awal aplikasi.
 *  - belum ada data        -> data contoh (tanpa pemberitahuan)
 *  - data valid            -> data tersimpan (diperbaiki bila ada bagian yang rusak)
 *  - data rusak / tak valid -> data contoh + pemberitahuan
 *  - storage tak dapat diakses -> data contoh + pemberitahuan
 */
export function loadInitialState() {
  const result = readFromStorage();

  if (result.status === 'ok') {
    const state = normalizeState(result.data);
    if (state) return { state, notice: null };
    return {
      state: createSampleState(),
      notice: 'Data tersimpan tidak valid, sehingga aplikasi dimuat ulang dengan data contoh.',
    };
  }

  if (result.status === 'invalid') {
    return {
      state: createSampleState(),
      notice: 'Data tersimpan rusak dan tidak dapat dibaca, sehingga aplikasi dimuat ulang dengan data contoh.',
    };
  }

  if (result.status === 'error') {
    return {
      state: createSampleState(),
      notice: 'Penyimpanan browser tidak dapat diakses. Aplikasi tetap berjalan, tetapi perubahan tidak akan tersimpan.',
    };
  }

  return { state: createSampleState(), notice: null };
}

/** Bentuk data yang ditulis ke LocalStorage. */
export function serializeState(state) {
  return {
    version: STORAGE_VERSION,
    activeBoardId: state.activeBoardId,
    view: state.view,
    boards: state.boards,
  };
}
