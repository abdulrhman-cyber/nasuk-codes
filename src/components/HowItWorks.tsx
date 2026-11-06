import {
  Check,
  MousePointerClick,
  RefreshCcw,
  Share2,
  ShieldAlert,
  Smartphone,
} from 'lucide-react';
import { useApp } from '../context';
import { formatNumber } from '../lib/format';
import { Reveal } from './Reveal';

const stepIcons = [Smartphone, MousePointerClick, RefreshCcw, Share2] as const;

export function HowItWorks() {
  const { t, lang } = useApp();

  return (
    <section id="how" className="band-dark section" aria-labelledby="how-title">
      <div className="container-page">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">{t.how.eyebrow}</span>
            <h2 id="how-title" className="display-title mt-2 text-3xl text-[var(--text)] sm:text-4xl">
              {t.how.title}
            </h2>
            <p className="mt-3 text-sm leading-8 text-[var(--muted)] sm:text-base">{t.how.desc}</p>
          </div>
        </Reveal>

        <div className="relative mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            className="pointer-events-none absolute inset-x-[10%] top-[3.4rem] hidden h-px bg-[linear-gradient(90deg,transparent,var(--border-strong),var(--border-strong),transparent)] lg:block"
            aria-hidden="true"
          />
          {t.how.steps.map((step, index) => {
            const Icon = stepIcons[index] ?? Smartphone;
            return (
              <Reveal key={step.title} delay={index * 0.07} className="relative h-full">
                <div className="glass-card group relative flex h-full flex-col rounded-[1.6rem] p-5 transition duration-300 hover:-translate-y-1 hover:border-[var(--border-strong)]">
                  <div className="flex items-start justify-between gap-2">
                    <span className="num grid size-9 place-items-center rounded-xl border border-[var(--border)] bg-[linear-gradient(145deg,var(--surface-strong),var(--surface))] text-sm font-bold text-[var(--ice)] shadow-[inset_0_1px_0_var(--highlight)]">
                      {formatNumber(index + 1, lang)}
                    </span>
                    <span className="grid size-10 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--lavender)] transition group-hover:border-[color-mix(in_srgb,var(--lavender)_30%,var(--border))]">
                      <Icon className="size-4.5" aria-hidden="true" strokeWidth={1.8} />
                    </span>
                  </div>
                  <h3 className="mt-5 text-[0.95rem] font-bold text-[var(--text)]">{step.title}</h3>
                  <p className="mt-2 text-xs leading-7 text-[var(--muted)]">{step.desc}</p>
                  <span
                    className="code-text mt-auto pt-4 text-[0.6rem] tracking-[0.2em] text-[var(--faint)] opacity-50"
                    aria-hidden="true"
                  >
                    0{index + 1}
                  </span>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.12}>
          <div className="glass mt-6 flex flex-col gap-4 rounded-[1.5rem] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[color-mix(in_srgb,var(--warning)_28%,transparent)] bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] text-[var(--warning)]">
                <ShieldAlert className="size-4.5" aria-hidden="true" strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[var(--text)]">{t.how.noticeTitle}</p>
                <p className="mt-1 text-[0.7rem] leading-6 text-[var(--muted)]">{t.how.notice}</p>
              </div>
            </div>
            <ul className="flex flex-wrap gap-2">
              {[t.how.badge1, t.how.badge2, t.how.badge3].map((badge) => (
                <li key={badge} className="chip">
                  <Check className="size-3 text-[var(--mint)]" aria-hidden="true" strokeWidth={2.6} />
                  {badge}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
