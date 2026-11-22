const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ProgressRing({ percent }) {
  const safe = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0;
  const offset = CIRCUMFERENCE * (1 - safe / 100);

  return (
    <div className="ring" role="img" aria-label={`Persentase penyelesaian ${safe}%`}>
      <svg viewBox="0 0 120 120" width="136" height="136" aria-hidden="true">
        <circle className="ring__track" cx="60" cy="60" r={RADIUS} fill="none" strokeWidth="11" />
        <circle
          className="ring__value"
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="ring__label" data-testid="completion-percent">
        {safe}%
      </div>
    </div>
  );
}
