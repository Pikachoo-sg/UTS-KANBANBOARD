import { useId, useState } from 'react';
import { CATEGORIES, CATEGORY_META, LIMITS } from '../../utils/constants.js';
import { validateName } from '../../utils/validators.js';
import Button from '../ui/Button.jsx';
import Modal from '../ui/Modal.jsx';

/** Form tambah kolom (tanpa `column`) atau ubah nama/tipe kolom (dengan `column`). */
export default function ColumnFormModal({ column, columns, onSubmit, onClose }) {
  const isEdit = Boolean(column);
  const uid = useId();
  const [name, setName] = useState(column?.name ?? '');
  const [category, setCategory] = useState(column?.category ?? 'progress');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const existing = columns.filter((c) => c.id !== column?.id).map((c) => c.name);
    const message = validateName(name, { label: 'Nama kolom', max: LIMITS.columnName, existing });
    if (message) {
      setError(message);
      return;
    }
    onSubmit({ name: name.trim(), category });
  };

  return (
    <Modal
      title={isEdit ? 'Ubah kolom' : 'Tambah kolom'}
      size="sm"
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <Button onClick={onClose}>Batal</Button>
          <Button type="submit" variant="primary">
            {isEdit ? 'Simpan' : 'Tambah kolom'}
          </Button>
        </>
      }
    >
      <div className="field">
        <label htmlFor={`${uid}-name`} className="field__label">
          Nama kolom
        </label>
        <input
          id={`${uid}-name`}
          className={`input ${error ? 'input--error' : ''}`}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          placeholder="Contoh: Review"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${uid}-error` : undefined}
          autoComplete="off"
        />
        {error ? (
          <p id={`${uid}-error`} className="field__error">
            {error}
          </p>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor={`${uid}-category`} className="field__label">
          Dihitung sebagai
        </label>
        <select id={`${uid}-category`} className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_META[c].label}
            </option>
          ))}
        </select>
        <p className="field__hint">Menentukan bagaimana tugas di kolom ini dihitung pada ringkasan Dashboard.</p>
      </div>
    </Modal>
  );
}
