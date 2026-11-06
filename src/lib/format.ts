import type { Lang } from './i18n';
import { CODE_REGEX, REFERRAL_BASE } from './constants';

export function formatNumber(value: number, lang: Lang): string {
  return new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDateTime(iso: string, lang: Lang): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatDate(iso: string, lang: Lang): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-GB', {
    dateStyle: 'medium',
  }).format(date);
}

export function timeAgo(iso: string, lang: Lang): string {
  const timestamp = new Date(iso).getTime();
  if (Number.isNaN(timestamp)) return '—';

  const diffSeconds = Math.round((timestamp - Date.now()) / 1000);
  const abs = Math.abs(diffSeconds);
  const locale = lang === 'ar' ? 'ar-EG' : 'en-GB';
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (abs < 45) return lang === 'ar' ? 'الآن' : 'just now';
  if (abs < 3600) return rtf.format(Math.round(diffSeconds / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diffSeconds / 3600), 'hour');
  if (abs < 86400 * 7) return rtf.format(Math.round(diffSeconds / 86400), 'day');
  if (abs < 86400 * 30) return rtf.format(Math.round(diffSeconds / (86400 * 7)), 'week');
  if (abs < 86400 * 365) return rtf.format(Math.round(diffSeconds / (86400 * 30)), 'month');
  return rtf.format(Math.round(diffSeconds / (86400 * 365)), 'year');
}

export function isNew(iso: string | null | undefined, hours = 48): boolean {
  if (!iso) return false;
  const timestamp = new Date(iso).getTime();
  if (Number.isNaN(timestamp)) return false;
  return Date.now() - timestamp < hours * 60 * 60 * 1000;
}

export function referralUrl(code: string): string {
  return `${REFERRAL_BASE}${encodeURIComponent(code)}`;
}

export function isValidCode(code: string): boolean {
  return CODE_REGEX.test(code);
}

export interface ParsedCode {
  value: string;
  valid: boolean;
  duplicate: boolean;
}

export function parseCodeInput(raw: string): ParsedCode[] {
  const tokens = raw
    .split(/[\s,،;؛|]+/u)
    .map((value) => value.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  return tokens.map((value) => {
    const valid = CODE_REGEX.test(value);
    const duplicate = valid && seen.has(value);
    if (valid) seen.add(value);
    return { value, valid, duplicate };
  });
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the manual fallback.
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-1000px';
    textarea.style.opacity = '0';
    textarea.style.fontSize = '16px';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
