import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Info, Plus } from 'lucide-react';
import { useApp } from '../context';
import { Reveal } from './Reveal';

export function Faq() {
  const { t } = useApp();
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();

  return (
    <section id="faq" className="band-light section" aria-labelledby="faq-title">
      <div className="container-page">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">{t.faq.eyebrow}</span>
            <h2 id="faq-title" className="display-title mt-2 text-3xl text-[var(--text)] sm:text-4xl">
              {t.faq.title}
            </h2>
            <p className="mt-3 text-sm leading-8 text-[var(--muted)] sm:text-base">{t.faq.desc}</p>
          </div>
        </Reveal>

        <Reveal delay={0.07}>
          <div className="mx-auto mt-9 max-w-3xl space-y-2.5">
            {t.faq.items.map((item, index) => {
              const isOpen = open === index;
              const panelId = `faq-panel-${index}`;
              const buttonId = `faq-button-${index}`;
              return (
                <div
                  key={item.q}
                  className={`glass-card overflow-hidden rounded-2xl transition ${
                    isOpen ? 'border-[var(--border-strong)]' : ''
                  }`}
                >
                  <h3>
                    <button
                      id={buttonId}
                      type="button"
                      onClick={() => setOpen(isOpen ? null : index)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className="flex w-full items-center justify-between gap-4 px-4 py-4 text-start sm:px-5"
                    >
                      <span className={`text-sm font-semibold transition ${isOpen ? 'text-[var(--text)]' : 'text-[var(--muted)]'}`}>
                        {item.q}
                      </span>
                      <motion.span
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.22 }}
                        className={`grid size-7 shrink-0 place-items-center rounded-lg border transition ${
                          isOpen
                            ? 'border-[color-mix(in_srgb,var(--ice)_30%,transparent)] bg-[color-mix(in_srgb,var(--ice)_10%,transparent)] text-[var(--ice)]'
                            : 'border-[var(--border)] bg-[var(--surface)] text-[var(--faint)]'
                        }`}
                        aria-hidden="true"
                      >
                        <Plus className="size-3.5" strokeWidth={2.2} />
                      </motion.span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        animate={reduce ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                        exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-4 pb-4 text-xs leading-7 text-[var(--muted)] sm:px-5 sm:pb-5 sm:text-[0.8rem]">
                          {item.a}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mx-auto mt-5 max-w-3xl">
            <div className="glass relative overflow-hidden rounded-[1.4rem] border-[color-mix(in_srgb,var(--lavender)_24%,var(--border))] p-4 sm:p-5">
              <div
                className="pointer-events-none absolute -end-10 -top-10 size-36 rounded-full bg-[radial-gradient(circle,var(--glow-violet),transparent_70%)] opacity-40 blur-2xl"
                aria-hidden="true"
              />
              <div className="relative flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-[color-mix(in_srgb,var(--lavender)_28%,transparent)] bg-[color-mix(in_srgb,var(--lavender)_10%,transparent)] text-[var(--lavender)]">
                  <Info className="size-4" aria-hidden="true" strokeWidth={1.8} />
                </span>
                <div>
                  <p className="text-xs font-bold text-[var(--text)]">{t.faq.disclaimerTitle}</p>
                  <p className="mt-1.5 text-[0.7rem] leading-6 text-[var(--muted)]">{t.faq.disclaimer}</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
