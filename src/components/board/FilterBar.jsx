import { PRIORITIES, PRIORITY_META, SORT_OPTIONS } from '../../utils/constants.js';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';

export default function FilterBar({ filters, labels, columns, onChange, onReset, canReset, matchCount, totalCount, isFiltering }) {
  return (
    <div className="filter-bar" role="search" aria-label="Pencarian dan filter tugas">
      <div className="filter-bar__search">
        <Icon name="search" size={17} className="filter-bar__search-icon" />
        <input
          type="search"
          className="input input--search"
          placeholder="Cari judul tugas…"
          aria-label="Cari tugas berdasarkan judul"
          value={filters.search}
          onChange={(e) => onChange('search', e.target.value)}
        />
      </div>

      <label className="filter-bar__field">
        <span className="sr-only">Filter prioritas</span>
        <select className="input" value={filters.priority} onChange={(e) => onChange('priority', e.target.value)}>
          <option value="all">Semua prioritas</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              Prioritas: {PRIORITY_META[p].label}
            </option>
          ))}
        </select>
      </label>

      <label className="filter-bar__field">
        <span className="sr-only">Filter label</span>
        <select className="input" value={filters.label} onChange={(e) => onChange('label', e.target.value)}>
          <option value="all">Semua label</option>
          {labels.map((l) => (
            <option key={l.key} value={l.key}>
              Label: {l.name}
            </option>
          ))}
        </select>
      </label>

      <label className="filter-bar__field">
        <span className="sr-only">Filter status</span>
        <select className="input" value={filters.status} onChange={(e) => onChange('status', e.target.value)}>
          <option value="all">Semua status</option>
          {columns.map((c) => (
            <option key={c.id} value={c.id}>
              Status: {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="filter-bar__field">
        <span className="sr-only">Urutkan tugas</span>
        <select className="input" value={filters.sort} onChange={(e) => onChange('sort', e.target.value)}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.value === 'manual' ? 'Urutkan: manual' : o.label}
            </option>
          ))}
        </select>
      </label>

      {canReset ? (
        <Button variant="ghost" icon="x" onClick={onReset}>
          Reset
        </Button>
      ) : null}

      {isFiltering ? (
        <p className="filter-bar__result" role="status" data-testid="filter-result">
          {matchCount} dari {totalCount} tugas
        </p>
      ) : null}
    </div>
  );
}
