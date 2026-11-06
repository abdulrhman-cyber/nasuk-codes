import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { MAX_LOCAL_CODES, MAX_TRIED, STORAGE_KEYS } from './lib/constants';
import { dictionaries, type Dict, type Lang, type Theme } from './lib/i18n';
import {
  getHiddenCodes,
  getLastOpened,
  getLocalCodes,
  getSavedLang,
  getSavedTheme,
  getTriedCodes,
  saveHiddenCodes,
  saveLang,
  saveLastOpened,
  saveLocalCodes,
  saveTheme,
  saveTriedCodes,
} from './lib/storage';
import type { HiddenCode, LastOpened, LocalCode } from './lib/types';
import { ToastStack, type ToastItem, type ToastVariant } from './components/ToastStack';

export interface AddLocalResult {
  added: string[];
  duplicates: string[];
}

interface AppContextValue {
  lang: Lang;
  dir: 'rtl' | 'ltr';
  t: Dict;
  setLanguage: (lang: Lang) => void;
  theme: Theme;
  toggleTheme: () => void;
  tried: string[];
  triedSet: Set<string>;
  markTried: (code: string) => void;
  unmarkTried: (code: string) => void;
  clearTried: () => void;
  lastOpened: LastOpened | null;
  recordOpen: (code: string) => void;
  localCodes: LocalCode[];
  localSet: Set<string>;
  addLocalCodes: (codes: string[]) => AddLocalResult;
  removeLocalCode: (code: string) => void;
  hidden: HiddenCode[];
  hiddenSet: Set<string>;
  hideCode: (code: string, reason: string) => boolean;
  restoreCode: (code: string) => void;
  restoreAll: () => void;
  notify: (message: string, variant?: ToastVariant) => void;
  toasts: ToastItem[];
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function getInitialTheme(): Theme {
  if (typeof document !== 'undefined') {
    const current = document.documentElement.dataset.theme;
    if (current === 'light' || current === 'dark') return current;
  }
  const saved = getSavedTheme();
  if (saved) return saved;
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
}

function getInitialLang(): Lang {
  return getSavedLang() || 'ar';
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(getInitialLang);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [tried, setTried] = useState<string[]>(getTriedCodes);
  const [lastOpened, setLastOpened] = useState<LastOpened | null>(getLastOpened);
  const [localCodes, setLocalCodes] = useState<LocalCode[]>(getLocalCodes);
  const [hidden, setHidden] = useState<HiddenCode[]>(getHiddenCodes);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, number>());
  const toastCounter = useRef(0);
  const localRef = useRef(localCodes);
  const hiddenRef = useRef(hidden);

  useEffect(() => {
    localRef.current = localCodes;
  }, [localCodes]);

  useEffect(() => {
    hiddenRef.current = hidden;
  }, [hidden]);

  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const t = dictionaries[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    saveLang(lang);
  }, [lang, dir]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#F3ECE1' : '#211E1A');
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.tried) setTried(getTriedCodes());
      if (event.key === STORAGE_KEYS.lastOpened) setLastOpened(getLastOpened());
      if (event.key === STORAGE_KEYS.localCodes) setLocalCodes(getLocalCodes());
      if (event.key === STORAGE_KEYS.hiddenCodes) setHidden(getHiddenCodes());
      if (event.key === STORAGE_KEYS.theme) {
        const saved = getSavedTheme();
        if (saved) setTheme(saved);
      }
      if (event.key === STORAGE_KEYS.lang) {
        const saved = getSavedLang();
        if (saved) setLang(saved);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(
    () => () => {
      for (const timer of timers.current.values()) window.clearTimeout(timer);
      timers.current.clear();
    },
    [],
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const notify = useCallback(
    (message: string, variant: ToastVariant = 'success') => {
      toastCounter.current += 1;
      const id = `toast-${toastCounter.current}-${Date.now()}`;
      setToasts((current) => [...current.slice(-2), { id, message, variant }]);
      const timer = window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
        timers.current.delete(id);
      }, 4600);
      timers.current.set(id, timer);
    },
    [],
  );

  const markTried = useCallback((code: string) => {
    setTried((current) => {
      if (current.includes(code)) return current;
      const next = [code, ...current].slice(0, MAX_TRIED);
      saveTriedCodes(next);
      return next;
    });
  }, []);

  const clearTried = useCallback(() => {
    setTried([]);
    saveTriedCodes([]);
  }, []);

  const unmarkTried = useCallback((code: string) => {
    setTried((current) => {
      if (!current.includes(code)) return current;
      const next = current.filter((entry) => entry !== code);
      saveTriedCodes(next);
      return next;
    });
  }, []);

  const recordOpen = useCallback(
    (code: string) => {
      markTried(code);
      setLastOpened(saveLastOpened(code));
    },
    [markTried],
  );

  const addLocalCodes = useCallback(
    (codes: string[]): AddLocalResult => {
      const current = localRef.current;
      const seen = new Set(current.map((entry) => entry.code));
      const added: string[] = [];
      const duplicates: string[] = [];
      const next = [...current];

      for (const code of codes) {
        if (seen.has(code) || next.length >= MAX_LOCAL_CODES) {
          duplicates.push(code);
          continue;
        }
        seen.add(code);
        added.push(code);
        next.unshift({ code, addedAt: new Date().toISOString() });
      }

      if (added.length > 0) {
        localRef.current = next;
        setLocalCodes(next);
        saveLocalCodes(next);
      }

      return { added, duplicates };
    },
    [],
  );

  const removeLocalCode = useCallback((code: string) => {
    const next = localRef.current.filter((entry) => entry.code !== code);
    localRef.current = next;
    setLocalCodes(next);
    saveLocalCodes(next);
  }, []);

  const hideCode = useCallback((code: string, reason: string) => {
    const current = hiddenRef.current;
    if (current.some((entry) => entry.code === code)) return false;
    const next = [{ code, reason, at: new Date().toISOString() }, ...current];
    hiddenRef.current = next;
    setHidden(next);
    saveHiddenCodes(next);
    return true;
  }, []);

  const restoreCode = useCallback((code: string) => {
    const next = hiddenRef.current.filter((entry) => entry.code !== code);
    hiddenRef.current = next;
    setHidden(next);
    saveHiddenCodes(next);
  }, []);

  const restoreAll = useCallback(() => {
    hiddenRef.current = [];
    setHidden([]);
    saveHiddenCodes([]);
  }, []);

  const setLanguage = useCallback((next: Lang) => setLang(next), []);
  const toggleTheme = useCallback(
    () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    [],
  );

  const triedSet = useMemo(() => new Set(tried), [tried]);
  const localSet = useMemo(() => new Set(localCodes.map((entry) => entry.code)), [localCodes]);
  const hiddenSet = useMemo(() => new Set(hidden.map((entry) => entry.code)), [hidden]);

  const value = useMemo<AppContextValue>(
    () => ({
      lang,
      dir,
      t,
      setLanguage,
      theme,
      toggleTheme,
      tried,
      triedSet,
      markTried,
      unmarkTried,
      clearTried,
      lastOpened,
      recordOpen,
      localCodes,
      localSet,
      addLocalCodes,
      removeLocalCode,
      hidden,
      hiddenSet,
      hideCode,
      restoreCode,
      restoreAll,
      notify,
      toasts,
      dismissToast,
    }),
    [
      lang,
      dir,
      t,
      setLanguage,
      theme,
      toggleTheme,
      tried,
      triedSet,
      markTried,
      unmarkTried,
      clearTried,
      lastOpened,
      recordOpen,
      localCodes,
      localSet,
      addLocalCodes,
      removeLocalCode,
      hidden,
      hiddenSet,
      hideCode,
      restoreCode,
      restoreAll,
      notify,
      toasts,
      dismissToast,
    ],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismissToast} label={t.toast.dismiss} />
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
