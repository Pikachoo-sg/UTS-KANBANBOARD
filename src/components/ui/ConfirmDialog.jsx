import Button from './Button.jsx';
import Modal from './Modal.jsx';

/** Dialog konfirmasi. Fokus awal pada "Batal" agar Enter tidak menghapus tanpa sengaja. */
export default function ConfirmDialog({
  title,
  children,
  confirmLabel = 'Hapus',
  tone = 'danger',
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      title={title}
      size="sm"
      onClose={onCancel}
      footer={
        <>
          <Button data-autofocus onClick={onCancel}>
            Batal
          </Button>
          <Button variant={tone} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="confirm__message">{children}</div>
    </Modal>
  );
}
