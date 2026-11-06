import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowDown,
  Check,
  Copy,
  History,
  Plus,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useApp } from '../context';
import { useCodeActions } from '../hooks/useCodeActions';
import { formatNumber, isNew } from '../lib/format';
import type { CodeItem } from '../lib/types';

export function Hero({ preview, loading }: { preview: CodeItem[]; loading: boolean }) {
  const { t, lang, tried } = useApp();
  const { copy } = useCodeActions();
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);
  const reduce = useReducedMotion();
  const item = preview[0];

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const onCopy = async () => {
    if (!item) return;
    const ok = await copy(item.code);
    if (ok) {
      setCopied(true);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <div className="relative grid items-center gap-12 lg:grid-cols-[1.03fr_0.97fr] lg:gap-8 xl:gap-14">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 end-[-12%] size-[30rem] rounded-full bg-[radial-gradient(circle,rgba(197,164,109,0.22),transparent_68%)] blur-2xl" />
        <div className="absolute bottom-[-32%] start-[-10%] size-[26rem] rounded-full bg-[radial-gradient(circle,rgba(183,124,85,0.16),transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(197,164,109,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(197,164,109,0.08)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_72%_60%_at_50%_30%,black,transparent_80%)]" />
      </div>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="glass-soft inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[0.7rem] font-semibold text-[var(--muted)]">
          <Sparkles className="size-3.5 text-[var(--gold)]" aria-hidden="true" />
          {t.hero.badge}
          <span className="relative flex size-1.5" aria-hidden="true">
            <span className="live-dot" />
          </span>
        </span>

        <h1 id="hero-title" className="display-title mt-5 text-[clamp(2.55rem,7.4vw,4.6rem)]">
          <span className="block text-[var(--text)]">{t.hero.titleA}</span>
          <span className="gradient-text block pb-2">{t.hero.titleB}</span>
        </h1>

        <p className="mt-4 max-w-xl text-base leading-8 text-[var(--muted)] sm:text-[1.06rem]">
          {t.hero.desc}
        </p>

        <div className="mt-8 flex flex-col gap-3 xs:flex-row xs:items-center">
          <a href="#codes" className="btn btn-primary w-full xs:w-auto">
            <ArrowDown className="size-4" aria-hidden="true" strokeWidth={2.2} />
            {t.hero.primary}
          </a>
          <a href="#add" className="btn btn-glass w-full xs:w-auto">
            <Plus className="size-4" aria-hidden="true" strokeWidth={2.2} />
            {t.hero.secondary}
          </a>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.72rem] text-[var(--faint)]">
          <span className="inline-flex items-center gap-1.5">
            <Check className="size-3.5 text-[var(--mint)]" aria-hidden="true" strokeWidth={2.4} />
            {t.hero.hint}
          </span>
        </div>
      </motion.div>

      <motion.div
        className="hero-visual relative mx-auto w-full max-w-[30rem]"
        initial={reduce ? false : { opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="orb -top-7 end-10 size-20 opacity-70" aria-hidden="true" />
        <div
          className="orbit-slow absolute inset-3 rounded-[2.4rem] border border-dashed border-[var(--border)] opacity-70"
          aria-hidden="true"
        >
          <span className="absolute -top-1 start-12 size-2 rounded-full bg-[var(--ice)] shadow-[0_0_12px_var(--ice)]" />
        </div>
        <div
          className="absolute -inset-6 -z-10 rounded-[3rem] bg-[radial-gradient(circle_at_55%_40%,var(--glow-violet),transparent_65%)] opacity-70 blur-2xl"
          aria-hidden="true"
        />

        <div className="hero-card-tilt glass glass-edge relative rounded-[2rem] p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--gold)]">
                <Smartphone className="size-4" aria-hidden="true" strokeWidth={1.9} />
              </span>
              <div>
                <p className="text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-[var(--faint)]">
                  {t.hero.latest}
                </p>
                <p className="flex items-center gap-1.5 text-[0.72rem] font-medium text-[var(--muted)]">
                  <span className="live-dot" aria-hidden="true" />
                  {t.hero.live}
                </p>
              </div>
            </div>
            <span className="chip chip-ice">
              <Sparkles className="size-3" aria-hidden="true" />
              {t.hero.untried}
            </span>
          </div>

          <div className="code-surface relative mt-5 overflow-hidden rounded-2xl p-3.5 sm:p-4">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),transparent)]"
              aria-hidden="true"
            />
            {loading ? (
              <div className="flex items-center justify-between gap-3" aria-hidden="true">
                <div className="skeleton h-7 w-44 rounded-lg" />
                <div className="skeleton size-10 rounded-xl" />
              </div>
            ) : item ? (
              <div className="flex items-center justify-between gap-3">
                <span className="code-text break-all text-lg font-semibold leading-tight text-[var(--text)] sm:text-2xl">
                  {item.code}
                </span>
                <button
                  type="button"
                  onClick={onCopy}
                  className="icon-btn shrink-0 border-[color-mix(in_srgb,var(--gold)_34%,var(--border))] bg-[color-mix(in_srgb,var(--gold)_10%,transparent)] text-[var(--gold)]"
                  aria-label={copied ? t.hero.copied : t.hero.copyCode}
                  title={copied ? t.hero.copied : t.hero.copyCode}
                >
                  {copied ? (
                    <Check className="size-4" aria-hidden="true" strokeWidth={2.4} />
                  ) : (
                    <Copy className="size-4" aria-hidden="true" strokeWidth={1.9} />
                  )}
                </button>
              </div>
            ) : (
              <p className="py-1.5 text-sm text-[var(--muted)]">{t.hero.noCode}</p>
            )}
            {!loading && item ? (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {isNew(item.submittedAt) ? (
                  <span className="chip chip-mint">
                    <span className="size-1.5 rounded-full bg-[var(--mint)]" aria-hidden="true" />
                    {t.codes.new}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="mt-3.5 flex items-center gap-2 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-[0.68rem] leading-5 text-[var(--muted)]">
            <Smartphone className="size-4 shrink-0 text-[var(--gold)]" aria-hidden="true" strokeWidth={1.9} />
            {t.hero.keepOpen}
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 text-[0.66rem]">
            <span className="inline-flex items-center gap-1.5 text-[var(--faint)]">
              <ShieldCheck className="size-3.5 text-[var(--mint)]" aria-hidden="true" />
              {t.hero.floatB}
            </span>
            <a
              href="#codes"
              className="inline-flex items-center gap-1 font-semibold text-[var(--gold)] transition hover:gap-1.5 hover:text-[var(--gold-soft)]"
            >
              {t.hero.primary}
            </a>
          </div>
        </div>

        <div className="glass-nav absolute -top-5 -end-2 z-10 flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 float-slow sm:-end-5">
          <span className="grid size-8 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--gold)_20%,transparent)] text-[var(--lavender)]">
            {tried.length > 0 ? (
              <History className="size-4" aria-hidden="true" />
            ) : (
              <ShieldCheck className="size-4" aria-hidden="true" />
            )}
          </span>
          <div className="min-w-0">
            <p className="text-[0.68rem] font-semibold text-[var(--text)]">
              {tried.length > 0
                ? t.hero.triedLocal.replace('{count}', formatNumber(tried.length, lang))
                : t.how.badge1}
            </p>
            <p className="text-[0.58rem] text-[var(--faint)]">
              {tried.length > 0 ? t.hero.triedLocalHint : t.hero.hint}
            </p>
          </div>
        </div>

        <div className="glass-nav absolute -bottom-4 -start-2 z-10 flex items-center gap-2 rounded-2xl px-3 py-2 text-[0.68rem] font-semibold text-[var(--muted)] float-slower sm:-start-5">
          <span className="grid size-6 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--gold)_16%,transparent)] text-[var(--gold)]">
            <Zap className="size-3.5" aria-hidden="true" />
          </span>
          {t.hero.floatA}
        </div>
      </motion.div>
    </div>
  );
}
