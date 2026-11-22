import { useState } from 'react';
import { LIMITS } from '../../utils/constants.js';
import { validateName } from '../../utils/validators.js';
import Button from '../ui/Button.jsx';
import Modal from '../ui/Modal.jsx';

/** Form untuk membuat board baru atau mengganti nama board. */
export default function BoardFormModal({ board, boards, onSubmit, onClose }) {
  const isEdit = Boolean(board);
  const [name, setName] = useState(board?.name ?? '');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const existing = boards.filter((b) => b.id !== board?.id).map((b) => b.name);
    const message = validateName(name, { label: 'Nama board', max: LIMITS.boardName, existing });
    if (message) {
      setError(message);
      return;
    }
    onSubmit(name.trim());
  };

  return (
    <Modal
      title={isEdit ? 'Ganti nama board' : 'Buat board baru'}
      size="sm"
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <Button onClick={onClose}>Batal</Button>
          <Button type="submit" variant="primary">
            {isEdit ? 'Simpan' : 'Buat board'}
          </Button>
        </>
      }
    >
      <div className="field">
        <label htmlFor="board-name" className="field__label">
          Nama board
        </label>
        <input
          id="board-name"
          className={`input ${error ? 'input--error' : ''}`}
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (error) setError('');
          }}
          placeholder="Contoh: Redesain Aplikasi Mobile"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? 'board-name-error' : undefined}
          autoComplete="off"
        />
        {error ? (
          <p id="board-name-error" className="field__error">
            {error}
          </p>
        ) : null}
        {!isEdit ? (
          <p className="field__hint">Board baru dibuat dengan kolom To Do, In Progress, dan Done.</p>
        ) : null}
      </div>
    </Modal>
  );
}
