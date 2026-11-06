import { useState } from 'react';
import {
  ArrowUp,
  Info,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context';
import { formatNumber } from '../lib/format';
import { BrandMark } from './Brand';
import { InfoDialog, type InfoKind } from './InfoDialog';

const WHATSAPP_URL =
  'https://wa.me/201034904205?text=' + encodeURIComponent('السلام عليكم، وصلت من صفحة أكواد نسك.');

export function Footer() {
  const { t, lang } = useApp();
  const [info, setInfo] = useState<InfoKind>(null);
  const year = formatNumber(new Date().getFullYear(), lang);

  const backToTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  const links = [
    { href: '#home', label: t.nav.home },
    { href: '#codes', label: t.nav.codes },
    { href: '#how', label: t.nav.how },
    { href: '#add', label: t.nav.addCta },
    { href: '#faq', label: t.nav.faq },
  ];

  return (
    <footer className="band-dark relative mt-0 border-t border-[var(--border)]">
      <div className="container-page py-10 sm:py-14">
        <div className="glass glass-edge rounded-[2rem] p-5 sm:p-7 lg:p-8">
          <div className="grid gap-7 lg:grid-cols-[1.35fr_0.75fr_1fr] lg:gap-10">
            <div>
              <div className="flex items-center gap-3">
                <BrandMark size={46} />
                <div>
                  <p className="text-base font-bold text-[var(--text)]">{t.brand.name}</p>
                  <p className="text-[0.6rem] font-medium uppercase tracking-[0.2em] text-[var(--faint)]">
                    {t.brand.sub}
                  </p>
                </div>
              </div>
              <p className="mt-4 max-w-sm text-xs leading-7 text-[var(--muted)]">{t.brand.tagline}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="chip chip-ice">
                  <ShieldCheck className="size-3" aria-hidden="true" />
                  {t.footer.independent}
                </span>
                <span className="chip">
                  <Sparkles className="size-3 text-[var(--lavender)]" aria-hidden="true" />
                  {t.how.badge3}
                </span>
              </div>
            </div>

            <nav aria-labelledby="footer-links-title">
              <h2
                id="footer-links-title"
                className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--faint)]"
              >
                {t.footer.linksTitle}
              </h2>
              <ul className="mt-3 grid gap-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="inline-flex rounded text-xs font-medium text-[var(--muted)] transition hover:text-[var(--text)]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5 border-t border-[var(--border)] pt-3">
                <button
                  type="button"
                  onClick={() => setInfo('privacy')}
                  className="text-[0.7rem] text-[var(--faint)] transition hover:text-[var(--text)]"
                >
                  {t.footer.privacy}
                </button>
                <button
                  type="button"
                  onClick={() => setInfo('terms')}
                  className="text-[0.7rem] text-[var(--faint)] transition hover:text-[var(--text)]"
                >
                  {t.footer.terms}
                </button>
              </div>
            </nav>

            <div>
              <h2 className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--faint)]">
                {t.footer.contactTitle}
              </h2>
              <div className="glass-card mt-3 rounded-2xl p-4">
                <p className="text-[0.65rem] text-[var(--faint)]">{t.footer.devLabel}</p>
                <p className="mt-0.5 text-sm font-bold text-[var(--text)]">{t.footer.devName}</p>
                <div className="mt-3 grid gap-2">
                  <a
                    href="tel:+201034904205"
                    className="btn btn-glass btn-sm w-full justify-start"
                    aria-label={`${t.footer.call} ${t.footer.phone}`}
                  >
                    <Phone className="size-3.5 text-[var(--ice)]" aria-hidden="true" />
                    <span className="code-text text-[0.72rem]" dir="ltr">
                      {t.footer.phone}
                    </span>
                  </a>
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm w-full justify-start border-[color-mix(in_srgb,var(--mint)_28%,var(--border))] bg-[color-mix(in_srgb,var(--mint)_9%,transparent)] text-[var(--mint)] transition hover:bg-[color-mix(in_srgb,var(--mint)_14%,transparent)]"
                  >
                    <MessageCircle className="size-3.5" aria-hidden="true" />
                    {t.footer.whatsapp}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-7 flex items-start gap-2.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <Info className="mt-0.5 size-4 shrink-0 text-[var(--lavender)]" aria-hidden="true" strokeWidth={1.8} />
            <p className="text-[0.66rem] leading-6 text-[var(--muted)]">{t.footer.notice}</p>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
            <p className="text-[0.66rem] text-[var(--faint)]">{t.footer.rights.replace('{year}', year)}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setInfo('privacy')}
                className="hidden text-[0.66rem] text-[var(--faint)] transition hover:text-[var(--text)] xs:block"
              >
                {t.footer.privacy}
              </button>
              <button
                type="button"
                onClick={() => setInfo('terms')}
                className="hidden text-[0.66rem] text-[var(--faint)] transition hover:text-[var(--text)] xs:block"
              >
                {t.footer.terms}
              </button>
              <button
                type="button"
                onClick={backToTop}
                className="icon-btn icon-btn-sm"
                aria-label={t.footer.backToTop}
                title={t.footer.backToTop}
              >
                <ArrowUp className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <InfoDialog kind={info} onClose={() => setInfo(null)} />
    </footer>
  );
}
