import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Menu, Moon, Plus, Sun, X } from 'lucide-react';
import { useApp } from '../context';
import { BrandLockup } from './Brand';

const sections = ['home', 'codes', 'how', 'faq', 'add'] as const;

export function Header() {
  const { t, lang, setLanguage, theme, toggleTheme } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        setScrolled(window.scrollY > 16);
        const probe = window.scrollY + window.innerHeight * 0.32;
        let current = 'home';
        for (const id of sections) {
          const element = document.getElementById(id);
          if (element && element.offsetTop <= probe) current = id;
        }
        setActive(current);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [menuOpen]);

  const links = [
    { id: 'home', label: t.nav.home },
    { id: 'codes', label: t.nav.codes },
    { id: 'how', label: t.nav.how },
    { id: 'faq', label: t.nav.faq },
  ] as const;

  return (
    <header className="theme-dark fixed inset-x-0 top-0 z-40 pt-2.5 sm:pt-4">
      <div className="container-page">
        <nav
          className={`glass-nav glass-edge flex items-center gap-2 rounded-[1.35rem] px-2 py-2 transition-shadow duration-300 sm:px-3 ${
            scrolled ? 'shadow-[0_24px_60px_-30px_rgba(0,0,0,0.65)]' : ''
          }`}
          aria-label={t.brand.name}
        >
          <a
            href="#home"
            onClick={() => setMenuOpen(false)}
            className="flex shrink-0 items-center rounded-xl p-1 transition hover:bg-[var(--surface)]"
            aria-label={t.brand.name}
          >
            <BrandLockup compact />
          </a>

          <ul className="mx-auto hidden items-center gap-0.5 lg:flex">
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  aria-current={active === link.id ? 'true' : undefined}
                  className={`inline-flex items-center rounded-xl px-3.5 py-2 text-[0.84rem] font-semibold transition ${
                    active === link.id
                      ? 'bg-[color-mix(in_srgb,var(--gold)_16%,transparent)] text-[var(--gold-soft)] shadow-[inset_0_1px_0_var(--highlight)]'
                      : 'text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--gold-soft)]'
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="ms-auto flex items-center gap-1.5 lg:ms-0">
            <a href="#add" className="btn btn-primary btn-sm hidden md:inline-flex">
              <Plus className="size-4" aria-hidden="true" strokeWidth={2.2} />
              {t.nav.addCta}
            </a>

            <div
              className="flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] p-0.5"
              role="group"
              aria-label={t.nav.language}
            >
              {(['ar', 'en'] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLanguage(code)}
                  aria-pressed={lang === code}
                  aria-label={code === 'ar' ? 'العربية' : 'English'}
                  className={`rounded-[0.6rem] px-2 py-1.5 text-[0.68rem] font-bold uppercase leading-none transition ${
                    lang === code
                      ? 'bg-[color-mix(in_srgb,var(--gold)_18%,transparent)] text-[var(--gold-soft)] shadow-[inset_0_1px_0_var(--highlight)]'
                      : 'text-[var(--faint)] hover:text-[var(--gold-soft)]'
                  }`}
                >
                  {code === 'ar' ? 'ع' : 'EN'}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="icon-btn"
              aria-label={theme === 'dark' ? t.nav.themeToLight : t.nav.themeToDark}
              title={theme === 'dark' ? t.nav.themeToLight : t.nav.themeToDark}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={reduce ? false : { opacity: 0, rotate: -35, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, rotate: 35, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="grid place-items-center"
                >
                  {theme === 'dark' ? (
                    <Sun className="size-[1.1rem]" aria-hidden="true" strokeWidth={1.9} />
                  ) : (
                    <Moon className="size-[1.1rem]" aria-hidden="true" strokeWidth={1.9} />
                  )}
                </motion.span>
              </AnimatePresence>
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="icon-btn lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={menuOpen ? t.nav.closeMenu : t.nav.menu}
            >
              {menuOpen ? (
                <X className="size-[1.15rem]" aria-hidden="true" />
              ) : (
                <Menu className="size-[1.15rem]" aria-hidden="true" />
              )}
            </button>
          </div>
        </nav>

        <AnimatePresence initial={false}>
          {menuOpen ? (
            <motion.div
              id="mobile-navigation"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.99 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="glass-nav mt-2 overflow-hidden rounded-[1.35rem] p-2 lg:hidden"
            >
              <ul className="grid gap-1">
                {links.map((link) => (
                  <li key={link.id}>
                    <a
                      href={`#${link.id}`}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition ${
                        active === link.id
                          ? 'bg-[color-mix(in_srgb,var(--gold)_16%,transparent)] text-[var(--gold-soft)]'
                          : 'text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--gold-soft)]'
                      }`}
                    >
                      {link.label}
                      {active === link.id ? (
                        <span className="size-1.5 rounded-full bg-[var(--gold)]" aria-hidden="true" />
                      ) : null}
                    </a>
                  </li>
                ))}
              </ul>
              <a
                href="#add"
                onClick={() => setMenuOpen(false)}
                className="btn btn-primary mt-2 w-full"
              >
                <Plus className="size-4" aria-hidden="true" />
                {t.nav.addCta}
              </a>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  );
}
