import Icon from './Icon.jsx';

/** tone: 'info' | 'warning' */
export default function Banner({ tone = 'info', children, onDismiss }) {
  return (
    <div className={`banner banner--${tone}`} role={tone === 'warning' ? 'alert' : 'status'}>
      <Icon name={tone === 'warning' ? 'alert' : 'info'} />
      <p className="banner__text">{children}</p>
      {onDismiss ? (
        <button type="button" className="banner__close" onClick={onDismiss} aria-label="Tutup pemberitahuan">
          <Icon name="x" size={16} />
        </button>
      ) : null}
    </div>
  );
}
