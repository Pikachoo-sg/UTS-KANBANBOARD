import { PRIORITY_META } from '../../utils/constants.js';

export default function PriorityBadge({ priority }) {
  const meta = PRIORITY_META[priority] ?? PRIORITY_META.medium;
  return (
    <span className={`priority priority--${PRIORITY_META[priority] ? priority : 'medium'}`}>
      <span className="priority__dot" aria-hidden="true" />
      {meta.label}
    </span>
  );
}
