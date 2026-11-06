import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  Copy,
  Eraser,
  ExternalLink,
  Flag,
  HardDrive,
  History,
  Inbox,
  Layers,
  RefreshCw,
  RotateCcw,
  Search,
  SearchX,
  Sparkles,
  Trash2,
  WifiOff,
  X,
} from 'lucide-react';
import { useApp } from '../context';
import { useCodeActions } from '../hooks/useCodeActions';
import { PAGE_SIZE, PAGE_SIZE_OPTIONS } from '../lib/constants';
import { queryCodes, type CodeFilter, type CodeIndex } from '../lib/dataset';
import { formatDateTime, formatNumber, isValidCode, referralUrl, timeAgo } from '../lib/format';
import type { CodeItem } from '../lib/types';
import { HideDialog, type HideReason } from './HideDialog';

function pageItems(page: number, total: number): Array<number | 'gap'> {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const pages = new Set<number>([1, total, page]);
  if (page <= 3) [2, 3, 4].forEach((value) => pages.add(value));
  if (page >= total - 2) [total - 3, total - 2, total - 1].forEach((value) => pages.add(value));
  if (page > 3 && page < total - 2) [page - 1, page + 1].forEach((value) => pages.add(value));

  const sorted = [...pages].filter((value) => value >= 1 && value <= total).sort((a, b) => a - b);
  const output: Array<number | 'gap'> = [];
  sorted.forEach((value, index) => {
    if (index > 0 && value - sorted[index - 1] > 1) output.push('gap');
    output.push(value);
  });
  return output;
}

export function CodesSection({
  dataset,
  loading,
  error,
  onRetry,
}: {
  dataset: CodeIndex | null;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}) {
  const {
    t,
    lang,
    dir,
    triedSet,
    tried,
    clearTried,
    lastOpened,
    notify,
    localCodes,
    hidden,
    hiddenSet,
    hideCode,
    restoreCode,
    restoreAll,
  } = useApp();
  const { copy } = useCodeActions();
  const reduce = useReducedMotion();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [untriedFirst, setUntriedFirst] = useState(true);
  const [filter, setFilter] = useState<CodeFilter>('all');
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE);
  const [hideTarget, setHideTarget] = useState<CodeItem | null>(null);
  const [jumpValue, setJumpValue] = useState('');

  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 220);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sort, untriedFirst, filter, pageSize, localCodes.length]);

  const result = useMemo(() => {
    if (!dataset) return null;
    return queryCodes(dataset, {
      q: debouncedSearch,
      sort,
      untriedFirst,
      filter,
      tried: triedSet,
      hidden: hiddenSet,
      local: localCodes,
      page,
      pageSize,
    });
  }, [
    dataset,
    debouncedSearch,
    sort,
    untriedFirst,
    filter,
    triedSet,
    hiddenSet,
    localCodes,
    page,
    pageSize,
  ]);

  useEffect(() => {
    if (result && result.page !== page) setPage(result.page);
  }, [result, page]);

  const clearSearch = useCallback(() => {
    setSearchInput('');
    setDebouncedSearch('');
    setPage(1);
    searchRef.current?.focus();
  }, []);

  const onClearTried = () => {
    clearTried();
    notify(t.codes.triedCleared, 'info');
    setPage(1);
  };

  const goToPage = (next: number) => {
    if (!result || next < 1 || next > result.totalPages || next === result.page) return;
    setPage(next);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('codes')?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  const onHide = (code: string, reason: HideReason) => {
    const changed = hideCode(code, reason);
    notify(changed ? t.codes.hiddenToast : t.codes.alreadyHidden, 'info');
  };

  const onRestore = (code: string) => {
    restoreCode(code);
    notify(t.codes.restored, 'success');
  };

  const summary = useMemo(() => {
    if (!result) return '';
    const from = result.total === 0 ? 0 : (result.page - 1) * result.limit + 1;
    const to = Math.min(result.page * result.limit, result.total);
    const range = t.codes.results
      .replace('{from}', formatNumber(from, lang))
      .replace('{to}', formatNumber(to, lang))
      .replace('{total}', formatNumber(result.total, lang));
    if (debouncedSearch) {
      return `${t.codes.resultsSearch.replace('{q}', debouncedSearch)} · ${range}`;
    }
    return range;
  }, [result, lang, t.codes.results, t.codes.resultsSearch, debouncedSearch]);

  const pages = result ? pageItems(result.page, result.totalPages) : [];
  const PrevIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;
  const NextIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;
  const showSkeleton = loading && !dataset;
  const showError = error && !dataset;

  const filters: Array<{ key: CodeFilter; label: string; icon: typeof Layers; count?: number }> = [
    { key: 'all', label: t.codes.filterAll, icon: Layers },
    { key: 'recent', label: t.codes.filterRecent, icon: Clock3, count: dataset?.stats.recent48h },
    { key: 'dated', label: t.codes.filterDated, icon: CalendarDays, count: dataset?.stats.dated },
    { key: 'local', label: t.codes.filterLocal, icon: HardDrive, count: localCodes.length },
    { key: 'hidden', label: t.codes.filterHidden, icon: Flag, count: hidden.length },
  ];

  const onJump = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!result) return;
    const value = Number.parseInt(jumpValue, 10);
    if (!Number.isFinite(value)) return;
    goToPage(Math.min(Math.max(1, value), result.totalPages));
    setJumpValue('');
  };

  return (
    <section id="codes" className="band-light section" aria-labelledby="codes-title">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">{t.codes.eyebrow}</span>
            <h2 id="codes-title" className="display-title mt-2 text-3xl text-[var(--text)] sm:text-4xl">
              {t.codes.title}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-7 text-[var(--muted)]">{t.codes.desc}</p>
          </div>
          {result ? (
            <div className="flex flex-col items-start gap-1.5 sm:items-end">
              <span className="glass-soft inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.7rem] font-semibold text-[var(--muted)]">
                <span className="live-dot" aria-hidden="true" />
                {formatNumber(result.total, lang)}
                <span className="text-[var(--faint)]">
                  {filter === 'all' && !debouncedSearch ? t.codes.totalSuffix : t.codes.resultSuffix}
                </span>
              </span>
            </div>
          ) : null}
        </div>

        <div className="sticky-toolbar mt-6">
          <div className="glass-nav rounded-[1.35rem] p-2.5 sm:p-3">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="relative min-w-0 flex-1">
                <Search
                  className="pointer-events-none absolute inset-y-0 start-3.5 my-auto size-4 text-[var(--faint)]"
                  aria-hidden="true"
                  strokeWidth={1.9}
                />
                <label htmlFor="code-search" className="sr-only">
                  {t.codes.searchLabel}
                </label>
                <input
                  id="code-search"
                  ref={searchRef}
                  type="text"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder={t.codes.searchPlaceholder}
                  className="field h-11 pe-10 ps-10 text-sm"
                  autoComplete="off"
                  spellCheck={false}
                  inputMode="search"
                />
                {searchInput ? (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute inset-y-0 end-1.5 my-auto grid size-8 place-items-center rounded-lg text-[var(--faint)] transition hover:bg-[var(--surface-strong)] hover:text-[var(--text)]"
                    aria-label={t.codes.clearSearch}
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div
                  className="flex flex-1 items-center gap-0.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-0.5 sm:flex-none"
                  role="group"
                  aria-label={t.codes.untriedFirst}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (!untriedFirst) setUntriedFirst(true);
                    }}
                    aria-pressed={untriedFirst}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-[0.6rem] px-2.5 py-2 text-[0.7rem] font-semibold transition sm:flex-none ${
                      untriedFirst
                        ? 'bg-[var(--surface-strong)] text-[var(--text)] shadow-[inset_0_1px_0_var(--highlight)]'
                        : 'text-[var(--faint)] hover:text-[var(--text)]'
                    }`}
                  >
                    <Sparkles className="size-3.5 text-[var(--lavender)]" aria-hidden="true" />
                    {t.codes.untriedFirst}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (untriedFirst) setUntriedFirst(false);
                    }}
                    aria-pressed={!untriedFirst}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-[0.6rem] px-2.5 py-2 text-[0.7rem] font-semibold transition sm:flex-none ${
                      !untriedFirst
                        ? 'bg-[var(--surface-strong)] text-[var(--text)] shadow-[inset_0_1px_0_var(--highlight)]'
                        : 'text-[var(--faint)] hover:text-[var(--text)]'
                    }`}
                  >
                    <Clock3 className="size-3.5 text-[var(--ice)]" aria-hidden="true" />
                    {t.codes.untriedOff}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSort((current) => (current === 'newest' ? 'oldest' : 'newest'))}
                  className="btn btn-glass btn-sm"
                  aria-label={t.codes.sortLabel}
                  title={t.codes.sortLabel}
                >
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  {sort === 'newest' ? t.codes.sortNewest : t.codes.sortOldest}
                </button>

                {tried.length > 0 ? (
                  <button
                    type="button"
                    onClick={onClearTried}
                    className="btn btn-glass btn-sm"
                    title={t.codes.clearTried}
                  >
                    <Eraser className="size-3.5" aria-hidden="true" />
                    <span className="hidden xs:inline">{t.codes.clearTried}</span>
                    <span className="xs:hidden">{formatNumber(tried.length, lang)}</span>
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {filters.map((entry) => {
                const Icon = entry.icon;
                const active = filter === entry.key;
                return (
                  <button
                    key={entry.key}
                    type="button"
                    onClick={() => setFilter(entry.key)}
                    aria-pressed={active}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[0.68rem] font-semibold transition ${
                      active
                        ? 'border-transparent bg-[linear-gradient(135deg,var(--gold-soft),var(--gold))] text-[#2A2016] shadow-[0_8px_20px_-10px_var(--glow-violet)]'
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]'
                    }`}
                  >
                    <Icon className="size-3" aria-hidden="true" strokeWidth={2} />
                    {entry.label}
                    {typeof entry.count === 'number' ? (
                      <span className={`num text-[0.62rem] ${active ? 'text-[#2A2016]/70' : 'text-[var(--faint)]'}`}>
                        {formatNumber(entry.count, lang)}
                      </span>
                    ) : null}
                  </button>
                );
              })}

              {filter === 'hidden' && hidden.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    restoreAll();
                    notify(t.codes.restoredAll, 'success');
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-[0.68rem] font-semibold text-[var(--mint)] transition hover:border-[var(--border-strong)]"
                >
                  <RotateCcw className="size-3" aria-hidden="true" />
                  {t.codes.restoreAll}
                </button>
              ) : null}

              <label className="ms-auto inline-flex items-center gap-1.5 text-[0.64rem] text-[var(--faint)]">
                <ClipboardList className="size-3" aria-hidden="true" />
                <span className="hidden sm:inline">{t.codes.pageSizeLabel}</span>
                <select
                  value={pageSize}
                  onChange={(event) => setPageSize(Number(event.target.value))}
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-1.5 py-1 text-[0.66rem] font-semibold text-[var(--text)] outline-none"
                  aria-label={t.codes.pageSizeLabel}
                >
                  {PAGE_SIZE_OPTIONS.map((value) => (
                    <option key={value} value={value}>
                      {formatNumber(value, lang)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {lastOpened ? (
            <div className="glass-soft inline-flex max-w-full items-center gap-2 rounded-full py-1 pe-1 ps-3 text-[0.66rem] text-[var(--faint)]">
              <History className="size-3.5 shrink-0 text-[var(--lavender)]" aria-hidden="true" />
              <span className="shrink-0">{t.codes.lastOpened}</span>
              <span className="code-text truncate text-[0.7rem] font-semibold text-[var(--text)]">
                {lastOpened.code}
              </span>
              <button
                type="button"
                onClick={() => copy(lastOpened.code)}
                className="grid size-7 shrink-0 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition hover:text-[var(--text)]"
                aria-label={t.codes.lastOpenedCopy}
                title={t.codes.lastOpenedCopy}
              >
                <Copy className="size-3" aria-hidden="true" />
              </button>
            </div>
          ) : null}

          <p className="ms-auto text-[0.66rem] text-[var(--faint)]" aria-live="polite">
            {result ? summary : loading ? t.codes.loading : ''}
          </p>
        </div>

        <div className="mt-4">
          {showSkeleton ? (
            <div aria-busy="true" aria-live="polite">
              <span className="sr-only">{t.codes.loadingList}</span>
              <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <li key={index} className="glass-card rounded-[1.5rem] p-4 sm:p-5" aria-hidden="true">
                    <div className="flex items-center justify-between">
                      <div className="skeleton h-3 w-8 rounded" />
                      <div className="skeleton h-5 w-16 rounded-full" />
                    </div>
                    <div className="skeleton mt-4 h-12 w-full rounded-xl" />
                    <div className="skeleton mt-3 h-3 w-28 rounded" />
                    <div className="mt-4 flex gap-2">
                      <div className="skeleton h-9 flex-1 rounded-xl" />
                      <div className="skeleton h-9 flex-1 rounded-xl" />
                      <div className="skeleton size-9 rounded-xl" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : showError ? (
            <div className="glass-card rounded-[1.6rem] px-6 py-14 text-center">
              <span className="mx-auto grid size-16 place-items-center rounded-2xl border border-[color-mix(in_srgb,var(--danger)_25%,transparent)] bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] text-[var(--danger)]">
                <WifiOff className="size-7" aria-hidden="true" strokeWidth={1.7} />
              </span>
              <h3 className="mt-5 text-lg font-bold text-[var(--text)]">{t.codes.errorTitle}</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-[var(--muted)]">
                {t.codes.errorDesc}
              </p>
              <button type="button" onClick={onRetry} className="btn btn-glass mt-6">
                <RefreshCw className="size-4" aria-hidden="true" />
                {t.codes.retry}
              </button>
            </div>
          ) : result && result.items.length === 0 ? (
            <div className="glass-card rounded-[1.6rem] px-6 py-14 text-center">
              <span className="mx-auto grid size-16 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--ice)]">
                {debouncedSearch || filter !== 'all' ? (
                  <SearchX className="size-7" aria-hidden="true" strokeWidth={1.7} />
                ) : (
                  <Inbox className="size-7" aria-hidden="true" strokeWidth={1.7} />
                )}
              </span>
              <h3 className="mt-5 text-lg font-bold text-[var(--text)]">
                {filter === 'hidden'
                  ? t.codes.hiddenEmptyTitle
                  : filter === 'local'
                    ? t.codes.localEmptyTitle
                    : debouncedSearch
                      ? t.codes.noResultsTitle
                      : t.codes.emptyTitle}
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-[var(--muted)]">
                {filter === 'hidden'
                  ? t.codes.hiddenEmptyDesc
                  : filter === 'local'
                    ? t.codes.localEmptyDesc
                    : debouncedSearch
                      ? t.codes.noResultsDesc
                      : t.codes.emptyDesc}
              </p>
              {debouncedSearch || filter !== 'all' ? (
                <button
                  type="button"
                  onClick={() => {
                    clearSearch();
                    setFilter('all');
                  }}
                  className="btn btn-glass mt-6"
                >
                  <X className="size-4" aria-hidden="true" />
                  {t.codes.showAll}
                </button>
              ) : null}
            </div>
          ) : (
            <ul
              className={`grid gap-3 transition-opacity duration-300 sm:grid-cols-2 xl:grid-cols-3 ${
                loading ? 'pointer-events-none opacity-55' : 'opacity-100'
              }`}
              aria-busy={loading}
            >
              {result?.items.map((item, index) => (
                <CodeCard
                  key={item.id}
                  item={item}
                  rank={(result.page - 1) * result.limit + index + 1}
                  isTried={triedSet.has(item.code)}
                  isRecent={
                    item.addedTs != null &&
                    dataset != null &&
                    item.addedTs >= dataset.recentThreshold
                  }
                  index={index}
                  reduce={Boolean(reduce)}
                  hiddenView={filter === 'hidden'}
                  onHide={() => setHideTarget(item)}
                  onRestore={() => onRestore(item.code)}
                />
              ))}
            </ul>
          )}
        </div>

        {result && result.totalPages > 1 ? (
          <nav
            className="mt-7 flex flex-wrap items-center justify-center gap-1.5"
            aria-label={t.codes.pagination}
          >
            <button
              type="button"
              onClick={() => goToPage(result.page - 1)}
              disabled={result.page <= 1}
              className="btn btn-glass btn-sm gap-1 px-2.5"
              aria-label={t.codes.prev}
            >
              <PrevIcon className="size-4" aria-hidden="true" />
              <span className="hidden xs:inline">{t.codes.prev}</span>
            </button>

            {pages.map((value, index) =>
              value === 'gap' ? (
                <span key={`gap-${index}`} className="px-1 text-xs text-[var(--faint)]" aria-hidden="true">
                  …
                </span>
              ) : (
                <button
                  key={value}
                  type="button"
                  onClick={() => goToPage(value)}
                  aria-current={value === result.page ? 'page' : undefined}
                  aria-label={t.codes.page
                    .replace('{page}', formatNumber(value, lang))
                    .replace('{total}', formatNumber(result.totalPages, lang))}
                  className={`num grid size-9 place-items-center rounded-xl border text-xs font-bold transition ${
                    value === result.page
                      ? 'border-transparent bg-[linear-gradient(135deg,var(--gold-soft),var(--gold))] text-[#2A2016] shadow-[0_8px_22px_-8px_var(--glow-violet)]'
                      : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]'
                  }`}
                >
                  {formatNumber(value, lang)}
                </button>
              ),
            )}

            <button
              type="button"
              onClick={() => goToPage(result.page + 1)}
              disabled={result.page >= result.totalPages}
              className="btn btn-glass btn-sm gap-1 px-2.5"
              aria-label={t.codes.next}
            >
              <span className="hidden xs:inline">{t.codes.next}</span>
              <NextIcon className="size-4" aria-hidden="true" />
            </button>

            {result.totalPages > 7 ? (
              <form onSubmit={onJump} className="ms-1 flex items-center gap-1">
                <label htmlFor="page-jump" className="sr-only">
                  {t.codes.jumpLabel}
                </label>
                <input
                  id="page-jump"
                  type="number"
                  min={1}
                  max={result.totalPages}
                  value={jumpValue}
                  onChange={(event) => setJumpValue(event.target.value)}
                  placeholder={t.codes.jumpPlaceholder}
                  className="code-text h-9 w-20 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2 text-center text-xs text-[var(--text)] outline-none [appearance:textfield] focus:border-[var(--border-strong)]"
                  aria-label={t.codes.jumpLabel}
                />
                <button type="submit" className="btn btn-glass btn-sm px-2.5">
                  {t.codes.jumpGo}
                </button>
              </form>
            ) : null}
          </nav>
        ) : null}
      </div>

      <HideDialog target={hideTarget} onClose={() => setHideTarget(null)} onConfirm={onHide} />
    </section>
  );
}

function CodeCard({
  item,
  rank,
  isTried,
  isRecent,
  index,
  reduce,
  hiddenView,
  onHide,
  onRestore,
}: {
  item: CodeItem;
  rank: number;
  isTried: boolean;
  isRecent: boolean;
  index: number;
  reduce: boolean;
  hiddenView: boolean;
  onHide: () => void;
  onRestore: () => void;
}) {
  const { t, lang, removeLocalCode, notify, markTried, unmarkTried } = useApp();
  const { copy, open } = useCodeActions();
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const handleCopy = async () => {
    const ok = await copy(item.code);
    if (ok) {
      setCopied(true);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2200);
    }
  };

  const toggleTried = () => {
    if (isTried) {
      unmarkTried(item.code);
      notify(t.codes.triedUnmarked, 'info');
    } else {
      markTried(item.code);
      notify(t.codes.triedMarked, 'info');
    }
  };

  const valid = isValidCode(item.code);
  const isLocal = item.source === 'local';

  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: Math.min(index * 0.025, 0.25), ease: [0.22, 1, 0.36, 1] }}
      className="glass-card glass-edge group relative flex flex-col overflow-hidden rounded-[1.5rem] p-4 sm:p-5"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(80%_120%_at_50%_0%,rgba(255,255,255,0.08),transparent_75%)]"
        aria-hidden="true"
      />
      <div className="relative flex items-start justify-between gap-2">
        <span className="code-text text-[0.66rem] font-semibold text-[var(--faint)]">
          #{String(rank).padStart(2, '0')}
        </span>
        <div className="flex flex-wrap justify-end gap-1.5">
          {isLocal ? (
            <span className="chip chip-violet" title={t.codes.localTip}>
              <HardDrive className="size-2.5" aria-hidden="true" />
              {t.codes.local}
            </span>
          ) : null}
          {isRecent && !isTried ? (
            <span className="chip chip-mint">
              <span className="size-1.5 rounded-full bg-[var(--mint)]" aria-hidden="true" />
              {t.codes.new}
            </span>
          ) : null}
          {isTried ? (
            <span className="chip chip-warning">
              <History className="size-3" aria-hidden="true" />
              {t.codes.tried}
            </span>
          ) : null}
          {hiddenView ? (
            <span className="chip chip-danger">
              <Flag className="size-2.5" aria-hidden="true" />
              {t.codes.hiddenBadge}
            </span>
          ) : null}
        </div>
      </div>

      <div className="code-surface relative mt-3 flex items-center justify-between gap-2 rounded-xl px-3 py-2.5">
        <span className="code-text min-w-0 break-all text-base font-semibold leading-tight text-[var(--text)] sm:text-lg">
          {item.code}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className={`icon-btn icon-btn-sm shrink-0 ${
            copied
              ? 'border-[color-mix(in_srgb,var(--mint)_38%,transparent)] bg-[color-mix(in_srgb,var(--mint)_14%,transparent)] text-[var(--mint)]'
              : 'border-[color-mix(in_srgb,var(--gold)_34%,var(--border))] bg-[color-mix(in_srgb,var(--gold)_10%,transparent)] text-[var(--violet)]'
          }`}
          aria-label={copied ? t.codes.copied : `${t.codes.copy} ${item.code}`}
          title={copied ? t.codes.copied : t.codes.copy}
        >
          {copied ? (
            <Check className="size-4" aria-hidden="true" strokeWidth={2.4} />
          ) : (
            <Copy className="size-4" aria-hidden="true" strokeWidth={1.9} />
          )}
        </button>
      </div>

      <div className="relative mt-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[0.63rem] text-[var(--faint)]">
        <span
          className="inline-flex items-center gap-1"
          title={item.submittedAt ? formatDateTime(item.submittedAt, lang) : undefined}
        >
          <CalendarPlus className="size-3" aria-hidden="true" />
          {item.submittedAt
            ? t.codes.added.replace('{when}', timeAgo(item.submittedAt, lang))
            : t.codes.noDate}
        </span>
        {isLocal ? (
          <button
            type="button"
            onClick={() => {
              removeLocalCode(item.code);
              notify(t.codes.localRemoved, 'info');
            }}
            className="inline-flex items-center gap-1 text-[var(--danger)] transition hover:underline"
          >
            <Trash2 className="size-3" aria-hidden="true" />
            {t.codes.removeLocal}
          </button>
        ) : null}
      </div>

      <div className="relative mt-auto grid gap-1.5 pt-3.5">
        {hiddenView ? (
          <div className="flex gap-1.5">
            <button type="button" onClick={onRestore} className="btn btn-primary btn-sm flex-[1.35]">
              <RotateCcw className="size-3.5" aria-hidden="true" strokeWidth={2} />
              {t.codes.restore}
            </button>
            <button type="button" onClick={handleCopy} className="btn btn-glass btn-sm flex-1">
              {copied ? (
                <Check className="size-3.5 text-[var(--mint)]" aria-hidden="true" strokeWidth={2.3} />
              ) : (
                <Copy className="size-3.5" aria-hidden="true" />
              )}
              {copied ? t.codes.copied : t.codes.copy}
            </button>
          </div>
        ) : (
          <>
            <button type="button" onClick={handleCopy} className="btn btn-primary btn-sm w-full">
              {copied ? (
                <Check className="size-3.5" aria-hidden="true" strokeWidth={2.3} />
              ) : (
                <Copy className="size-3.5" aria-hidden="true" strokeWidth={2} />
              )}
              {copied ? t.codes.copied : t.codes.copy}
            </button>
            <div className="flex gap-1.5">
              {valid ? (
                <a
                  href={referralUrl(item.code)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => open(item.code)}
                  className="btn btn-glass btn-sm min-w-0 flex-1"
                  aria-label={`${t.codes.open} ${item.code}`}
                >
                  <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" strokeWidth={2} />
                  <span className="truncate">{t.codes.open}</span>
                </a>
              ) : (
                <button type="button" className="btn btn-glass btn-sm min-w-0 flex-1" disabled>
                  {t.codes.open}
                </button>
              )}
              <button
                type="button"
                onClick={toggleTried}
                aria-pressed={isTried}
                className={`icon-btn icon-btn-sm !h-[2.35rem] !w-[2.35rem] shrink-0 ${
                  isTried
                    ? 'border-[color-mix(in_srgb,var(--mint)_38%,transparent)] bg-[color-mix(in_srgb,var(--mint)_14%,transparent)] text-[var(--mint)]'
                    : ''
                }`}
                aria-label={isTried ? `${t.codes.unmarkTried} ${item.code}` : `${t.codes.markTried} ${item.code}`}
                title={isTried ? t.codes.unmarkTried : t.codes.markTried}
              >
                {isTried ? (
                  <Check className="size-3.5" aria-hidden="true" strokeWidth={2.3} />
                ) : (
                  <History className="size-3.5" aria-hidden="true" strokeWidth={1.9} />
                )}
              </button>
              <button
                type="button"
                onClick={onHide}
                className="icon-btn icon-btn-sm !h-[2.35rem] !w-[2.35rem] shrink-0"
                aria-label={`${t.codes.report} ${item.code}`}
                title={t.codes.report}
              >
                <Flag className="size-3.5" aria-hidden="true" strokeWidth={1.9} />
              </button>
            </div>
          </>
        )}
      </div>
    </motion.li>
  );
}
