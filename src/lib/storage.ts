import { CODE_REGEX, MAX_LOCAL_CODES, MAX_TRIED, STORAGE_KEYS } from './constants';
import type { Lang, Theme } from './i18n';
import type { HiddenCode, LastOpened, LocalCode } from './types';

function canUseStorage(): boolean {
  try {
    const probe = '__anc_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

const storageAvailable = typeof window !== 'undefined' && canUseStorage();

function read(key: string): string | null {
  if (!storageAvailable) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  if (!storageAvailable) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage may be full or blocked; the UI keeps working in memory.
  }
}

function readJson<T>(key: string, fallback: T): T {
  const raw = read(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function isStorageAvailable(): boolean {
  return storageAvailable;
}

export function getTriedCodes(): string[] {
  const parsed = readJson<unknown>(STORAGE_KEYS.tried, []);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((value): value is string => typeof value === 'string' && CODE_REGEX.test(value))
    .slice(0, MAX_TRIED);
}

export function saveTriedCodes(codes: string[]): void {
  write(STORAGE_KEYS.tried, JSON.stringify(codes.slice(0, MAX_TRIED)));
}

export function getLastOpened(): LastOpened | null {
  const parsed = readJson<Partial<LastOpened> | null>(STORAGE_KEYS.lastOpened, null);
  if (
    parsed &&
    typeof parsed.code === 'string' &&
    CODE_REGEX.test(parsed.code) &&
    typeof parsed.at === 'string'
  ) {
    return { code: parsed.code, at: parsed.at };
  }
  return null;
}

export function saveLastOpened(code: string): LastOpened {
  const value = { code, at: new Date().toISOString() };
  write(STORAGE_KEYS.lastOpened, JSON.stringify(value));
  return value;
}

export function getLocalCodes(): LocalCode[] {
  const parsed = readJson<unknown>(STORAGE_KEYS.localCodes, []);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter(
      (entry): entry is LocalCode =>
        Boolean(entry) &&
        typeof entry === 'object' &&
        typeof (entry as LocalCode).code === 'string' &&
        CODE_REGEX.test((entry as LocalCode).code) &&
        typeof (entry as LocalCode).addedAt === 'string',
    )
    .slice(0, MAX_LOCAL_CODES);
}

export function saveLocalCodes(codes: LocalCode[]): void {
  write(STORAGE_KEYS.localCodes, JSON.stringify(codes.slice(0, MAX_LOCAL_CODES)));
}

export function getHiddenCodes(): HiddenCode[] {
  const parsed = readJson<unknown>(STORAGE_KEYS.hiddenCodes, []);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter(
      (entry): entry is HiddenCode =>
        Boolean(entry) &&
        typeof entry === 'object' &&
        typeof (entry as HiddenCode).code === 'string' &&
        CODE_REGEX.test((entry as HiddenCode).code),
    )
    .map((entry) => ({
      code: entry.code,
      reason: typeof entry.reason === 'string' ? entry.reason : 'not_working',
      at: typeof entry.at === 'string' ? entry.at : new Date().toISOString(),
    }))
    .slice(0, MAX_LOCAL_CODES);
}

export function saveHiddenCodes(codes: HiddenCode[]): void {
  write(STORAGE_KEYS.hiddenCodes, JSON.stringify(codes.slice(0, MAX_LOCAL_CODES)));
}

export function getSavedTheme(): Theme | null {
  const value = read(STORAGE_KEYS.theme);
  return value === 'light' || value === 'dark' ? value : null;
}

export function saveTheme(theme: Theme): void {
  write(STORAGE_KEYS.theme, theme);
}

export function getSavedLang(): Lang | null {
  const value = read(STORAGE_KEYS.lang);
  return value === 'ar' || value === 'en' ? value : null;
}

export function saveLang(lang: Lang): void {
  write(STORAGE_KEYS.lang, lang);
}
