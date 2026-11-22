import { useId, useMemo, useState } from 'react';
import { LIMITS, PRIORITIES, PRIORITY_META } from '../../utils/constants.js';
import { formatDate } from '../../utils/date.js';
import { collectLabels } from '../../utils/labels.js';
import { validateTaskForm } from '../../utils/validators.js';
import Button from '../ui/Button.jsx';
import Modal from '../ui/Modal.jsx';
import LabelInput from './LabelInput.jsx';

/**
 * Form tambah / edit tugas.
 *  - tambah: `task` kosong, `defaultColumnId` menentukan status awal
 *  - edit:   `task` berisi tugas yang diedit
 */
export default function TaskFormModal({ board, task, defaultColumnId, onSubmit, onClose }) {
  const isEdit = Boolean(task);
  const uid = useId();
  const ids = {
    title: `${uid}-title`,
    description: `${uid}-description`,
    status: `${uid}-status`,
    deadline: `${uid}-deadline`,
    labels: `${uid}-labels`,
  };

  const [values, setValues] = useState(() => ({
    title: task?.title ?? '',
    description: task?.description ?? '',
    columnId: task?.columnId ?? defaultColumnId ?? board.columns[0]?.id ?? '',
    priority: task?.priority ?? 'medium',
    deadline: task?.deadline ?? '',
    labels: task?.labels ?? [],
  }));
  const [errors, setErrors] = useState({});

  const suggestions = useMemo(() => collectLabels(board.tasks).map((l) => l.name), [board.tasks]);

  const update = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const found = validateTaskForm(values, { createdAt: task?.createdAt });
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setTimeout(() => form.querySelector('[aria-invalid="true"]')?.focus(), 0);
      return;
    }
    onSubmit(values);
  };

  const describedBy = (key) => (errors[key] ? `${ids[key] ?? key}-error` : undefined);

  return (
    <Modal
      title={isEdit ? 'Edit tugas' : 'Tugas baru'}
      size="md"
      closeOnOverlay={false}
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <Button onClick={onClose}>Batal</Button>
          <Button type="submit" variant="primary">
            {isEdit ? 'Simpan perubahan' : 'Tambah tugas'}
          </Button>
        </>
      }
    >
      <div className="field">
        <label htmlFor={ids.title} className="field__label">
          Judul tugas <span className="required" aria-hidden="true">*</span>
        </label>
        <input
          id={ids.title}
          className={`input ${errors.title ? 'input--error' : ''}`}
          value={values.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder="Apa yang perlu dikerjakan?"
          aria-required="true"
          aria-invalid={errors.title ? 'true' : undefined}
          aria-describedby={describedBy('title')}
          autoComplete="off"
        />
        {errors.title ? (
          <p id={`${ids.title}-error`} className="field__error">
            {errors.title}
          </p>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor={ids.description} className="field__label">
          Deskripsi
        </label>
        <textarea
          id={ids.description}
          className={`input input--textarea ${errors.description ? 'input--error' : ''}`}
          rows={4}
          value={values.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Tambahkan detail, catatan, atau langkah pengerjaan"
          aria-invalid={errors.description ? 'true' : undefined}
          aria-describedby={describedBy('description')}
        />
        <div className="field__row">
          {errors.description ? (
            <p id={`${ids.description}-error`} className="field__error">
              {errors.description}
            </p>
          ) : (
            <span />
          )}
          <span className={`field__counter ${values.description.length > LIMITS.taskDescription ? 'is-over' : ''}`}>
            {values.description.length}/{LIMITS.taskDescription}
          </span>
        </div>
      </div>

      <div className="field-grid">
        <div className="field">
          <label htmlFor={ids.status} className="field__label">
            Status
          </label>
          <select
            id={ids.status}
            className={`input ${errors.columnId ? 'input--error' : ''}`}
            value={values.columnId}
            onChange={(e) => update('columnId', e.target.value)}
            aria-invalid={errors.columnId ? 'true' : undefined}
          >
            {board.columns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.name}
              </option>
            ))}
          </select>
          {errors.columnId ? <p className="field__error">{errors.columnId}</p> : null}
        </div>

        <div className="field">
          <label htmlFor={ids.deadline} className="field__label">
            Deadline
          </label>
          <input
            id={ids.deadline}
            type="date"
            className={`input ${errors.deadline ? 'input--error' : ''}`}
            value={values.deadline}
            onChange={(e) => update('deadline', e.target.value)}
            aria-invalid={errors.deadline ? 'true' : undefined}
            aria-describedby={describedBy('deadline')}
          />
          {errors.deadline ? (
            <p id={`${ids.deadline}-error`} className="field__error">
              {errors.deadline}
            </p>
          ) : null}
        </div>
      </div>

      <fieldset className="field fieldset">
        <legend className="field__label">Prioritas</legend>
        <div className="segmented" role="radiogroup" aria-label="Tingkat prioritas">
          {PRIORITIES.map((priority) => (
            <label key={priority} className={`segmented__option segmented__option--${priority}`}>
              <input
                type="radio"
                name={`${uid}-priority`}
                value={priority}
                checked={values.priority === priority}
                onChange={() => update('priority', priority)}
              />
              <span>{PRIORITY_META[priority].label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor={ids.labels} className="field__label">
          Label / kategori
        </label>
        <LabelInput
          id={ids.labels}
          labels={values.labels}
          onChange={(labels) => update('labels', labels)}
          suggestions={suggestions}
        />
      </div>

      {isEdit ? <p className="field__hint">Dibuat pada {formatDate(task.createdAt)}</p> : null}
    </Modal>
  );
}
