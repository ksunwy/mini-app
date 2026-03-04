import { DialogProps } from "@/app/interfaces/interfaces";

export function Dialog({
  isOpen,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  tone = 'default',
  children,
}: DialogProps) {
  if (!isOpen) {
    return null;
  }

  const confirmClasses =
    tone === 'danger'
      ? 'bg-[var(--danger)] text-white hover:opacity-90'
      : 'bg-[var(--accent)] text-white hover:opacity-90';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="surface w-full max-w-md p-6">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="mt-2 text-sm text-[var(--text-muted)]">{description}</p>

        {children ? <div className="mt-4">{children}</div> : null}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-slate-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${confirmClasses}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
