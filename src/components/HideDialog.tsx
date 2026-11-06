import { useEffect, useState } from 'react';
import { EyeOff } from 'lucide-react';
import { useApp } from '../context';
import type { CodeItem } from '../lib/types';
import { Dialog } from './Dialog';

const reasons = ['not_working', 'duplicate', 'inappropriate', 'other'] as const;
export type HideReason = (typeof reasons)[number];

export function HideDialog({
  target,
  onClose,
  onConfirm,
}: {
  target: CodeItem | null;
  onClose: () => void;
  onConfirm: (code: string, reason: HideReason) => void;
}) {
  const { t } = useApp();
  const [reason, setReason] = useState<HideReason>('not_working');

  useEffect(() => {
    setReason('not_working');
  }, [target?.id]);

  const submit = () => {
    if (!target) return;
    onConfirm(target.code, reason);
    onClose();
  };

  return (
    <Dialog
      open={Boolean(target)}
      onClose={onClose}
      title={t.report.title}
      description={t.report.desc}
      closeLabel={t.report.close}
      tone="danger"
      footer={
        <div className="flex flex-col-reverse gap-2 xs:flex-row xs:justify-end">
          <button type="button" onClick={onClose} className="btn btn-glass">
            {t.report.cancel}
          </button>
          <button type="button" onClick={submit} className="btn btn-primary">
            <EyeOff className="size-4" aria-hidden="true" strokeWidth={2} />
            {t.report.hideAction}
          </button>
        </div>
      }
    >
      {target ? (
        <div className="code-surface mb-4 flex items-center justify-between gap-3 rounded-xl px-3.5 py-3">
          <span className="text-xs text-[var(--faint)]">{t.report.codeLabel}</span>
          <span className="code-text text-sm font-semibold text-[var(--text)]">{target.code}</span>
        </div>
      ) : null}

      <fieldset>
        <legend className="sr-only">{t.report.title}</legend>
        <div className="grid gap-2">
          {reasons.map((key) => (
            <label
              key={key}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 text-sm transition ${
                reason === key
                  ? 'border-[color-mix(in_srgb,var(--danger)_35%,var(--border))] bg-[color-mix(in_srgb,var(--danger)_9%,transparent)] text-[var(--text)]'
                  : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]'
              }`}
            >
              <input
                type="radio"
                name="hide-reason"
                value={key}
                checked={reason === key}
                onChange={() => setReason(key)}
                className="sr-only"
              />
              <span
                className={`grid size-4 shrink-0 place-items-center rounded-full border ${
                  reason === key ? 'border-[var(--danger)]' : 'border-[var(--border-strong)]'
                }`}
                aria-hidden="true"
              >
                {reason === key ? <span className="size-2 rounded-full bg-[var(--danger)]" /> : null}
              </span>
              {t.report.reasons[key]}
            </label>
          ))}
        </div>
      </fieldset>

      <p className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[0.68rem] leading-5 text-[var(--faint)]">
        {t.report.localOnly}
      </p>
    </Dialog>
  );
}
