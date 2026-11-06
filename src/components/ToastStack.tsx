import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'info' | 'error';

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

const icons = {
  success: CheckCircle2,
  info: Info,
  error: AlertTriangle,
} as const;

const tones: Record<ToastVariant, string> = {
  success: 'text-[var(--mint)] border-[color-mix(in_srgb,var(--mint)_32%,transparent)]',
  info: 'text-[var(--ice)] border-[color-mix(in_srgb,var(--ice)_32%,transparent)]',
  error: 'text-[var(--danger)] border-[color-mix(in_srgb,var(--danger)_32%,transparent)]',
};

export function ToastStack({
  toasts,
  onDismiss,
  label,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
  label: string;
}) {
  const reduce = useReducedMotion();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      aria-live="polite"
      aria-atomic="false"
    >
      <div className="flex w-full max-w-md flex-col-reverse gap-2">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const Icon = icons[toast.variant];
            return (
              <motion.div
                key={toast.id}
                layout={!reduce}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.97 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className={`glass-nav pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 ${tones[toast.variant]}`}
                role={toast.variant === 'error' ? 'alert' : 'status'}
              >
                <Icon className="mt-0.5 size-5 shrink-0" strokeWidth={1.9} aria-hidden="true" />
                <p className="min-w-0 flex-1 text-sm font-medium text-[var(--text)]">{toast.message}</p>
                <button
                  type="button"
                  onClick={() => onDismiss(toast.id)}
                  className="-me-1 -mt-1 grid size-8 shrink-0 place-items-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--surface-strong)] hover:text-[var(--text)]"
                  aria-label={label}
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
