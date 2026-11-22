import Icon from './Icon.jsx';

/**
 * variant: 'primary' | 'secondary' | 'danger' | 'ghost'
 * Memberi `icon` tanpa children menghasilkan tombol ikon (wajib memberi `label`/aria-label).
 */
export default function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  type = 'button',
  className = '',
  children,
  ...props
}) {
  const iconOnly = icon && !children;
  const classes = [
    'btn',
    `btn--${variant}`,
    size === 'sm' ? 'btn--sm' : '',
    iconOnly ? 'btn--icon' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} {...props}>
      {icon ? <Icon name={icon} size={size === 'sm' ? 15 : 17} /> : null}
      {children}
    </button>
  );
}
