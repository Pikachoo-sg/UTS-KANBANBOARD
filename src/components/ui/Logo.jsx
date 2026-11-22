export default function Logo({ size = 36 }) {
  return (
    <svg
      className="logo"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="Logo KanbanFlow"
    >
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <rect x="6.5" y="7" width="5" height="16" rx="1.6" fill="#fff" />
      <rect x="13.5" y="7" width="5" height="11" rx="1.6" fill="#fff" opacity=".85" />
      <rect x="20.5" y="7" width="5" height="7" rx="1.6" fill="#fff" opacity=".7" />
    </svg>
  );
}
