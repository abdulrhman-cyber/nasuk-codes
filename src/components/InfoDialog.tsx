import { ScrollText, ShieldCheck } from 'lucide-react';
import { useApp } from '../context';
import { Dialog } from './Dialog';

export type InfoKind = 'privacy' | 'terms' | null;

export function InfoDialog({ kind, onClose }: { kind: InfoKind; onClose: () => void }) {
  const { t } = useApp();
  const isPrivacy = kind === 'privacy';
  const title = isPrivacy ? t.dialogs.privacyTitle : t.dialogs.termsTitle;
  const paragraphs = isPrivacy ? t.dialogs.privacy : t.dialogs.terms;

  return (
    <Dialog
      open={kind !== null}
      onClose={onClose}
      title={title}
      closeLabel={t.dialogs.close}
      footer={
        <button type="button" onClick={onClose} className="btn btn-primary w-full">
          {t.dialogs.understand}
        </button>
      }
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--ice)]">
          {isPrivacy ? (
            <ShieldCheck className="size-5" aria-hidden="true" strokeWidth={1.8} />
          ) : (
            <ScrollText className="size-5" aria-hidden="true" strokeWidth={1.8} />
          )}
        </span>
        <p className="text-xs leading-5 text-[var(--faint)]">{t.footer.independent}</p>
      </div>
      <ul className="space-y-3">
        {paragraphs.map((paragraph) => (
          <li key={paragraph} className="flex gap-2.5 text-sm leading-7 text-[var(--muted)]">
            <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-[var(--ice)]" aria-hidden="true" />
            <span>{paragraph}</span>
          </li>
        ))}
      </ul>
    </Dialog>
  );
}
