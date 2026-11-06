import { CircleCheck, Clock3, Database, HardDrive, History, Info } from 'lucide-react';
import { useApp } from '../context';
import { formatDateTime, formatNumber } from '../lib/format';
import type { Stats } from '../lib/types';
import { Reveal } from './Reveal';

export function StatsBar({
  stats,
  loading,
  error,
  onRetry,
}: {
  stats: Stats | null;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}) {
  const { t, lang, tried } = useApp();

  const cells = [
    {
      key: 'total',
      label: t.stats.total,
      icon: Database,
      tone: 'text-[var(--gold)]',
      value: stats ? formatNumber(stats.total, lang) : null,
      title: t.stats.totalHint,
    },
    {
      key: 'available',
      label: t.stats.available,
      icon: CircleCheck,
      tone: 'text-[var(--mint)]',
      value: stats ? formatNumber(stats.available, lang) : null,
      title: t.stats.availableHint,
    },
    {
      key: 'triedLocal',
      label: t.stats.triedLocal,
      icon: History,
      tone: 'text-[var(--lavender)]',
      value: stats ? formatNumber(tried.length, lang) : null,
      title: t.stats.triedLocalHint,
    },
    {
      key: 'localAdded',
      label: t.stats.localAdded,
      icon: HardDrive,
      tone: 'text-[var(--ice)]',
      value: stats ? formatNumber(stats.localCount, lang) : null,
      title: t.stats.localAddedHint,
    },
  ];

  return (
    <Reveal className="mt-14 sm:mt-20" delay={0.05}>
      <div className="glass glass-edge rounded-[1.8rem] p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="eyebrow">
            <span className="size-1.5 rounded-full bg-[var(--gold)] shadow-[0_0_10px_var(--gold)]" aria-hidden="true" />
            {t.stats.eyebrow}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {stats ? (
              <span className="chip chip-ice">
                <CircleCheck className="size-3" aria-hidden="true" />
                {t.stats.available}: {formatNumber(stats.available, lang)}
              </span>
            ) : null}
            <span className="chip chip-mint">
              <span className="live-dot" aria-hidden="true" />
              {t.stats.live}
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-y-5 md:grid-cols-4 md:gap-y-0 md:[&>*+*]:border-s md:[&>*+*]:border-[var(--border)]">
          {cells.map((cell) => (
            <div key={cell.key} className="min-w-0 px-1 md:px-5 md:first:ps-0 md:last:pe-0">
              <div className="flex items-center gap-2 text-[0.68rem] font-medium text-[var(--faint)]">
                <cell.icon className={`size-3.5 ${cell.tone}`} aria-hidden="true" strokeWidth={1.9} />
                <span className="truncate">{cell.label}</span>
              </div>
              {loading && !stats ? (
                <div className="skeleton mt-2 h-8 w-20 rounded-lg" aria-hidden="true" />
              ) : error && !stats ? (
                <span className="mt-2 block text-lg font-bold text-[var(--danger)]">—</span>
              ) : (
                <div
                  className="num mt-1.5 truncate text-2xl font-bold text-[var(--text)] sm:text-[1.75rem]"
                  title={cell.title}
                >
                  {cell.value ?? (loading ? '…' : '—')}
                </div>
              )}
            </div>
          ))}
        </div>

        {error ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--danger)_25%,transparent)] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] px-3 py-2 text-xs text-[var(--danger)]">
            <span>{t.stats.error}</span>
            <button
              type="button"
              onClick={onRetry}
              className="font-semibold underline decoration-dotted underline-offset-4"
            >
              {t.codes.retry}
            </button>
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-2 border-t border-[var(--border)] pt-3 text-[0.66rem] leading-5 text-[var(--faint)] sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 size-3.5 shrink-0 text-[var(--gold)]" aria-hidden="true" />
            <span>{t.stats.autoNote}</span>
          </div>
          {stats ? (
            <div
              className="flex items-start gap-2 text-[var(--muted)] sm:text-end"
              title={formatDateTime(stats.lastUpdated, lang)}
            >
              <Clock3 className="mt-0.5 size-3.5 shrink-0 text-[var(--lavender)]" aria-hidden="true" />
              <span>
                {t.stats.updatedNote.replace('{when}', formatDateTime(stats.lastUpdated, lang))}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </Reveal>
  );
}
