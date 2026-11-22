import { useId, useState } from 'react';
import Button from '../ui/Button.jsx';
import Modal from '../ui/Modal.jsx';

/**
 * Konfirmasi hapus kolom.
 * Jika kolom masih berisi tugas, pengguna memilih: pindahkan tugas ke kolom lain,
 * atau hapus kolom beserta tugasnya.
 */
export default function DeleteColumnModal({ column, taskCount, otherColumns, onConfirm, onClose }) {
  const uid = useId();
  const hasTasks = taskCount > 0;
  const [mode, setMode] = useState('move'); // 'move' | 'delete'
  const [targetId, setTargetId] = useState(otherColumns[0]?.id ?? '');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (hasTasks && mode === 'move') onConfirm(targetId || null);
    else onConfirm(null);
  };

  return (
    <Modal
      title="Hapus kolom?"
      size="sm"
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <Button data-autofocus onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="danger">
            {hasTasks && mode === 'delete' ? 'Hapus kolom & tugas' : 'Hapus kolom'}
          </Button>
        </>
      }
    >
      {hasTasks ? (
        <>
          <p className="confirm__message">
            Kolom <strong>{column.name}</strong> masih berisi <strong>{taskCount} tugas</strong>. Apa yang ingin Anda lakukan
            dengan tugas-tugas tersebut?
          </p>

          <div className="choice-list" role="radiogroup" aria-label="Penanganan tugas">
            <label className={`choice ${mode === 'move' ? 'is-selected' : ''}`}>
              <input type="radio" name={`${uid}-mode`} checked={mode === 'move'} onChange={() => setMode('move')} />
              <span className="choice__body">
                <span className="choice__title">Pindahkan tugas ke kolom lain</span>
                <select
                  className="input input--compact"
                  value={targetId}
                  disabled={mode !== 'move'}
                  onChange={(e) => setTargetId(e.target.value)}
                  aria-label="Kolom tujuan"
                >
                  {otherColumns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </span>
            </label>

            <label className={`choice choice--danger ${mode === 'delete' ? 'is-selected' : ''}`}>
              <input type="radio" name={`${uid}-mode`} checked={mode === 'delete'} onChange={() => setMode('delete')} />
              <span className="choice__body">
                <span className="choice__title">Hapus kolom beserta semua tugasnya</span>
                <span className="choice__hint">Tugas yang dihapus tidak dapat dikembalikan.</span>
              </span>
            </label>
          </div>
        </>
      ) : (
        <p className="confirm__message">
          Kolom <strong>{column.name}</strong> akan dihapus. Kolom ini tidak berisi tugas.
        </p>
      )}
    </Modal>
  );
}
