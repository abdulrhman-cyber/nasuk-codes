import { useMemo, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  HardDrive,
  Info,
  Lock,
  MessageCircle,
  Plus,
  Quote,
  Send,
  ShieldCheck,
  Smartphone,
  Trash2,
  UserX,
  X,
} from 'lucide-react';
import { useApp } from '../context';
import { MAX_CODES_PER_SUBMIT } from '../lib/constants';
import type { CodeIndex } from '../lib/dataset';
import { copyText, formatNumber, isValidCode, parseCodeInput, referralUrl } from '../lib/format';
import { Reveal } from './Reveal';

interface Outcome {
  kind: 'success' | 'info';
  added: number;
  duplicates: number;
  invalid: number;
}

const WHATSAPP_BASE = 'https://wa.me/201034904205';

function whatsappLink(codes: string[]): string {
  const message = [
    'السلام عليكم، هذه أكواد نسك أريد مشاركتها في صفحة أكواد عبدالرحمن:',
    ...codes,
    '',
    `عدد الأكواد: ${codes.length}`,
  ].join('\n');
  return `${WHATSAPP_BASE}?text=${encodeURIComponent(message)}`;
}

export function AddCode({ dataset }: { dataset: CodeIndex | null }) {
  const { t, lang, notify, localCodes, localSet, addLocalCodes, removeLocalCode } = useApp();
  const reduce = useReducedMotion();

  const [raw, setRaw] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [shared, setShared] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const parsed = useMemo(() => parseCodeInput(raw), [raw]);
  const overLimit = parsed.length > MAX_CODES_PER_SUBMIT;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setFormError('');

    if (parsed.length === 0) {
      setFormError(t.add.emptyError);
      textareaRef.current?.focus();
      return;
    }
    if (overLimit) {
      setFormError(t.add.tooManyError);
      return;
    }

    const candidates = parsed
      .filter((token) => token.valid && !token.duplicate)
      .map((token) => token.value);

    if (candidates.length === 0) {
      setFormError(t.add.invalidAll);
      textareaRef.current?.focus();
      return;
    }

    setSubmitting(true);

    // Duplicate checks run against the bundled dataset and this device's additions.
    const alreadyGlobal = candidates.filter((code) => dataset?.codeSet.has(code));
    const alreadyLocal = candidates.filter((code) => localSet.has(code) && !alreadyGlobal.includes(code));
    const fresh = candidates.filter(
      (code) => !alreadyGlobal.includes(code) && !alreadyLocal.includes(code),
    );

    const { added } = addLocalCodes(fresh);
    const duplicates = alreadyGlobal.length + alreadyLocal.length + (fresh.length - added.length);
    const invalid = parsed.filter((token) => !token.valid).length;

    setOutcome({
      kind: added.length > 0 ? 'success' : 'info',
      added: added.length,
      duplicates,
      invalid,
    });
    setShared(added.length > 0 ? fresh : []);

    if (added.length > 0) {
      notify(t.add.localSuccessTitle, 'success');
      setRaw('');
    } else {
      notify(t.add.duplicatesOnly, 'info');
    }

    setSubmitting(false);
  };

  const resetForNew = () => {
    setOutcome(null);
    setFormError('');
    setRaw('');
    setShared([]);
    textareaRef.current?.focus();
  };

  const copyLocal = async (code: string) => {
    const ok = await copyText(code);
    notify(ok ? t.codes.copySuccess : t.codes.copyFail, ok ? 'success' : 'error');
  };

  return (
    <section id="add" className="band-sand section" aria-labelledby="add-title">
      <div className="container-page">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">{t.add.eyebrow}</span>
            <h2 id="add-title" className="display-title mt-2 text-3xl text-[var(--text)] sm:text-4xl">
              {t.add.title}
            </h2>
            <p className="mt-3 text-sm leading-8 text-[var(--muted)] sm:text-base">{t.add.desc}</p>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="mt-8">
          <div className="grid items-start gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="glass glass-edge relative overflow-hidden rounded-[1.8rem] p-5 sm:p-7">
              <div
                className="pointer-events-none absolute -end-16 -top-20 size-56 rounded-full bg-[radial-gradient(circle,var(--glow-violet),transparent_70%)] opacity-60 blur-2xl"
                aria-hidden="true"
              />
              <form onSubmit={onSubmit} noValidate className="relative">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="codes-input" className="text-sm font-semibold text-[var(--text)]">
                    {t.add.label}
                  </label>
                  <span
                    dir="ltr"
                    className={`num text-xs font-semibold ${
                      overLimit ? 'text-[var(--danger)]' : 'text-[var(--faint)]'
                    }`}
                  >
                    {t.add.counter.replace('{count}', formatNumber(parsed.length, lang))}
                  </span>
                </div>

                <textarea
                  id="codes-input"
                  ref={textareaRef}
                  value={raw}
                  onChange={(event) => {
                    setRaw(event.target.value);
                    if (formError) setFormError('');
                  }}
                  rows={5}
                  maxLength={600}
                  placeholder={t.add.placeholder}
                  className="field code-text mt-2 min-h-[8.5rem] resize-y text-left text-sm leading-7"
                  dir="ltr"
                  autoComplete="off"
                  spellCheck={false}
                  aria-describedby="codes-format"
                  aria-invalid={formError ? true : undefined}
                />

                <p id="codes-format" className="mt-2 flex items-start gap-1.5 text-[0.68rem] leading-5 text-[var(--faint)]">
                  <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                  {t.add.format}
                </p>

                {parsed.length > 0 ? (
                  <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={t.add.label}>
                    {parsed.slice(0, 14).map((token, index) => {
                      const label = token.duplicate
                        ? t.add.duplicate
                        : token.valid
                          ? t.add.valid
                          : t.add.invalid;
                      return (
                        <li
                          key={`${token.value}-${index}`}
                          title={label}
                          className={`chip ${
                            token.duplicate ? 'chip-warning' : token.valid ? 'chip-mint' : 'chip-danger'
                          }`}
                        >
                          {token.duplicate ? (
                            <Info className="size-3" aria-hidden="true" />
                          ) : token.valid ? (
                            <Check className="size-3" aria-hidden="true" strokeWidth={2.5} />
                          ) : (
                            <X className="size-3" aria-hidden="true" strokeWidth={2.5} />
                          )}
                          <span className="code-text max-w-[9rem] truncate" dir="ltr">
                            {token.value}
                          </span>
                          <span className="sr-only">{label}</span>
                        </li>
                      );
                    })}
                    {parsed.length > 14 ? (
                      <li className="chip">+{formatNumber(parsed.length - 14, lang)}</li>
                    ) : null}
                  </ul>
                ) : null}

                <div className="mt-4 rounded-2xl border border-[color-mix(in_srgb,var(--ice)_22%,var(--border))] bg-[color-mix(in_srgb,var(--ice)_7%,transparent)] p-3.5">
                  <p className="flex items-start gap-2 text-[0.7rem] leading-6 text-[var(--muted)]">
                    <HardDrive className="mt-0.5 size-3.5 shrink-0 text-[var(--ice)]" aria-hidden="true" />
                    {t.add.localOnlyNote}
                  </p>
                </div>

                {formError ? (
                  <p
                    role="alert"
                    className="mt-4 flex items-start gap-2 rounded-xl border border-[color-mix(in_srgb,var(--danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--danger)_9%,transparent)] px-3 py-2.5 text-xs leading-6 text-[var(--danger)]"
                  >
                    <X className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                    {formError}
                  </p>
                ) : null}

                <AnimatePresence>
                  {outcome ? (
                    <motion.div
                      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div
                        className={`mt-4 rounded-2xl border p-4 ${
                          outcome.kind === 'success'
                            ? 'border-[color-mix(in_srgb,var(--mint)_30%,transparent)] bg-[color-mix(in_srgb,var(--mint)_9%,transparent)]'
                            : 'border-[color-mix(in_srgb,var(--ice)_30%,transparent)] bg-[color-mix(in_srgb,var(--ice)_9%,transparent)]'
                        }`}
                        role="status"
                      >
                        <div className="flex items-start gap-3">
                          {outcome.kind === 'success' ? (
                            <CheckCircle2
                              className="mt-0.5 size-5 shrink-0 text-[var(--mint)]"
                              aria-hidden="true"
                              strokeWidth={1.9}
                            />
                          ) : (
                            <Info
                              className="mt-0.5 size-5 shrink-0 text-[var(--ice)]"
                              aria-hidden="true"
                              strokeWidth={1.9}
                            />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[var(--text)]">
                              {outcome.kind === 'success' ? t.add.localSuccessTitle : t.add.duplicatesOnly}
                            </p>
                            {outcome.added > 0 ? (
                              <p className="mt-1 text-xs leading-6 text-[var(--muted)]">
                                {t.add.localSuccessDesc.replace(
                                  '{count}',
                                  formatNumber(outcome.added, lang),
                                )}
                              </p>
                            ) : null}
                            {outcome.duplicates > 0 ? (
                              <p className="mt-1 text-[0.7rem] leading-5 text-[var(--warning)]">
                                {t.add.successDupes.replace(
                                  '{count}',
                                  formatNumber(outcome.duplicates, lang),
                                )}
                              </p>
                            ) : null}
                            {outcome.invalid > 0 ? (
                              <p className="mt-1 text-[0.7rem] leading-5 text-[var(--danger)]">
                                {t.add.successInvalid.replace(
                                  '{count}',
                                  formatNumber(outcome.invalid, lang),
                                )}
                              </p>
                            ) : null}
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                              <button
                                type="button"
                                onClick={resetForNew}
                                className="text-xs font-semibold text-[var(--ice)] underline decoration-dotted underline-offset-4"
                              >
                                {t.add.newSubmit}
                              </button>
                              {shared.length > 0 ? (
                                <a
                                  href={whatsappLink(shared)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--mint)] underline decoration-dotted underline-offset-4"
                                >
                                  <MessageCircle className="size-3.5" aria-hidden="true" />
                                  {t.add.shareWhatsapp}
                                </a>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <div className="mt-4 flex flex-col gap-2 xs:flex-row">
                  <button type="submit" disabled={submitting} className="btn btn-primary flex-1">
                    <Plus className="size-4" aria-hidden="true" strokeWidth={2.2} />
                    {t.add.submit}
                  </button>
                  <a
                    href={whatsappLink(
                      parsed.filter((token) => token.valid).map((token) => token.value),
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-glass"
                    aria-label={t.add.sendWhatsapp}
                  >
                    <Send className="size-4" aria-hidden="true" strokeWidth={1.9} />
                    {t.add.sendWhatsapp}
                  </a>
                </div>

                <p className="mt-3 flex items-start justify-center gap-1.5 text-center text-[0.66rem] leading-5 text-[var(--faint)]">
                  <Lock className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                  {t.add.privacy}
                </p>
              </form>
            </div>

            <div className="grid gap-4">
              <div className="glass-card rounded-[1.6rem] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--lavender)]">
                      <HardDrive className="size-4.5" aria-hidden="true" strokeWidth={1.8} />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold leading-6 text-[var(--text)]">
                        {t.add.localListTitle}
                      </h3>
                      <p className="text-[0.66rem] text-[var(--faint)]">
                        {t.add.localListCount.replace(
                          '{count}',
                          formatNumber(localCodes.length, lang),
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="chip chip-ice">{t.add.localBadge}</span>
                </div>

                {localCodes.length === 0 ? (
                  <p className="mt-4 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-3 py-4 text-center text-[0.7rem] leading-6 text-[var(--faint)]">
                    {t.add.localEmpty}
                  </p>
                ) : (
                  <ul className="mt-4 grid max-h-56 gap-2 overflow-y-auto pe-1">
                    {localCodes.map((entry) => (
                      <li
                        key={entry.code}
                        className="code-surface flex items-center gap-1.5 rounded-xl px-2.5 py-2"
                      >
                        <span className="code-text min-w-0 flex-1 truncate text-xs font-semibold text-[var(--text)]">
                          {entry.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => void copyLocal(entry.code)}
                          className="grid size-7 shrink-0 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition hover:text-[var(--text)]"
                          aria-label={`${t.codes.copy} ${entry.code}`}
                          title={t.codes.copy}
                        >
                          <Copy className="size-3" aria-hidden="true" />
                        </button>
                        {isValidCode(entry.code) ? (
                          <a
                            href={referralUrl(entry.code)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="grid size-7 shrink-0 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--ice)] transition hover:text-[var(--text)]"
                            aria-label={`${t.codes.open} ${entry.code}`}
                            title={t.codes.open}
                          >
                            <ExternalLink className="size-3" aria-hidden="true" />
                          </a>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => {
                            removeLocalCode(entry.code);
                            notify(t.codes.localRemoved, 'info');
                          }}
                          className="grid size-7 shrink-0 place-items-center rounded-lg border border-[color-mix(in_srgb,var(--danger)_28%,transparent)] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] text-[var(--danger)] transition hover:text-[var(--danger)]"
                          aria-label={`${t.codes.removeLocal} ${entry.code}`}
                          title={t.codes.removeLocal}
                        >
                          <Trash2 className="size-3" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="glass-card rounded-[1.6rem] p-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--mint)]">
                    <UserX className="size-4.5" aria-hidden="true" strokeWidth={1.8} />
                  </span>
                  <h3 className="text-sm font-bold leading-6 text-[var(--text)]">{t.add.noAccount}</h3>
                </div>
                <ul className="mt-4 grid gap-3">
                  <li className="flex items-start gap-2.5 text-xs leading-6 text-[var(--muted)]">
                    <ShieldCheck
                      className="mt-0.5 size-4 shrink-0 text-[var(--mint)]"
                      aria-hidden="true"
                      strokeWidth={1.8}
                    />
                    {t.add.privacy}
                  </li>
                  <li className="flex items-start gap-2.5 text-xs leading-6 text-[var(--muted)]">
                    <MessageCircle
                      className="mt-0.5 size-4 shrink-0 text-[var(--ice)]"
                      aria-hidden="true"
                      strokeWidth={1.8}
                    />
                    {t.add.review}
                  </li>
                  <li className="flex items-start gap-2.5 text-xs leading-6 text-[var(--muted)]">
                    <Smartphone
                      className="mt-0.5 size-4 shrink-0 text-[var(--lavender)]"
                      aria-hidden="true"
                      strokeWidth={1.8}
                    />
                    {t.hero.keepOpen}
                  </li>
                </ul>
              </div>

              <div className="glass-card relative overflow-hidden rounded-[1.6rem] p-5">
                <Quote
                  className="absolute -end-3 -top-3 size-20 text-[var(--surface-strong)] opacity-70"
                  aria-hidden="true"
                  strokeWidth={1}
                />
                <p className="relative text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--faint)]">
                  {t.add.ownerTitle}
                </p>
                <blockquote className="relative mt-3 text-sm leading-8 text-[var(--muted)]">
                  «{t.add.ownerQuote}»
                </blockquote>
                <p className="relative mt-3 flex items-center gap-2 text-[0.7rem] font-semibold text-[var(--ice)]">
                  <span className="h-px w-6 bg-[var(--ice)] opacity-60" aria-hidden="true" />
                  {t.add.ownerSign}
                </p>
              </div>

              <div className="glass-soft flex items-start gap-2.5 rounded-2xl p-4 text-[0.68rem] leading-6 text-[var(--faint)]">
                <Info className="mt-0.5 size-3.5 shrink-0 text-[var(--ice)]" aria-hidden="true" />
                {t.how.notice}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
