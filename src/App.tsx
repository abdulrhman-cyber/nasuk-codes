import { useCallback, useEffect, useState } from 'react';
import { useApp } from './context';
import { loadDataset, resetDatasetCache, type CodeIndex, itemAt } from './lib/dataset';
import type { CodeItem, Stats } from './lib/types';
import { Background } from './components/Background';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { StatsBar } from './components/StatsBar';
import { CodesSection } from './components/CodesSection';
import { AddCode } from './components/AddCode';
import { HowItWorks } from './components/HowItWorks';
import { Faq } from './components/Faq';
import { Footer } from './components/Footer';

export default function App() {
  const { t, localCodes, hidden } = useApp();
  const [index, setIndex] = useState<CodeIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [preview, setPreview] = useState<CodeItem[]>([]);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);

    loadDataset()
      .then((loaded) => {
        if (!active) return;
        setIndex(loaded);
        setPreview(loaded.orderNewest.slice(0, 3).map((slot) => itemAt(loaded, slot)));
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    resetDatasetCache();
    setAttempt((value) => value + 1);
  }, []);

  const stats: Stats | null = index
    ? {
        ...index.stats,
        available: Math.max(0, index.stats.total - hidden.length),
        localCount: localCodes.length,
      }
    : null;

  return (
    <div className="relative min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-[100] focus:rounded-xl focus:border focus:border-[var(--border-strong)] focus:bg-[var(--surface-solid)] focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-[var(--text)]"
      >
        {t.nav.skip}
      </a>

      <Background />
      <Header />

      <main id="main" tabIndex={-1}>
        <section
          id="home"
          className="band-dark relative overflow-hidden pb-2 pt-28 sm:pt-32 lg:pt-36"
          aria-labelledby="hero-title"
        >
          <div className="container-page">
            <Hero preview={preview} loading={loading} />
            <StatsBar stats={stats} loading={loading} error={error} onRetry={retry} />
          </div>
        </section>

        <CodesSection dataset={index} loading={loading} error={error} onRetry={retry} />
        <AddCode dataset={index} />
        <HowItWorks />
        <Faq />
      </main>

      <Footer />
    </div>
  );
}
