import { useState } from 'react';
import { LIMITS } from '../../utils/constants.js';
import { normalizeLabels } from '../../utils/labels.js';
import Icon from '../ui/Icon.jsx';

/**
 * Input label bergaya "tag": Enter atau koma menambah label,
 * Backspace pada input kosong menghapus label terakhir.
 */
export default function LabelInput({ id, labels, onChange, suggestions = [] }) {
  const [draft, setDraft] = useState('');
  const listId = `${id}-suggestions`;
  const atLimit = labels.length >= LIMITS.labelsPerTask;
  const lowerLabels = new Set(labels.map((l) => l.toLowerCase()));
  const available = suggestions.filter((s) => !lowerLabels.has(s.toLowerCase()));

  const commit = (text) => {
    if (!text.trim()) {
      setDraft('');
      return;
    }
    onChange(normalizeLabels([...labels, text]));
    setDraft('');
  };

  const handleChange = (event) => {
    const value = event.target.value;
    if (!value.includes(',')) {
      setDraft(value);
      return;
    }
    // Koma (diketik atau hasil paste) memisahkan beberapa label sekaligus.
    const parts = value.split(',');
    const rest = parts.pop();
    onChange(normalizeLabels([...labels, ...parts]));
    setDraft(rest);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // jangan men-submit form
      commit(draft);
    } else if (event.key === 'Backspace' && draft === '' && labels.length > 0) {
      onChange(labels.slice(0, -1));
    }
  };

  return (
    <div className="label-input">
      <div className="label-input__box">
        {labels.map((label) => (
          <span key={label} className="tag">
            {label}
            <button
              type="button"
              className="tag__remove"
              aria-label={`Hapus label ${label}`}
              onClick={() => onChange(labels.filter((l) => l !== label))}
            >
              <Icon name="x" size={12} />
            </button>
          </span>
        ))}
        <input
          id={id}
          className="label-input__field"
          value={draft}
          list={listId}
          disabled={atLimit}
          placeholder={atLimit ? 'Batas label tercapai' : labels.length ? '' : 'Ketik label lalu tekan Enter'}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={() => commit(draft)}
          autoComplete="off"
        />
        <datalist id={listId}>
          {available.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </div>
      <p className="field__hint">
        Maksimal {LIMITS.labelsPerTask} label, {LIMITS.label} karakter per label. Pisahkan dengan Enter atau koma.
      </p>
    </div>
  );
}
