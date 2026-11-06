/** Official Nusuk referral-code shape: NG- followed by 8 Latin letters/digits. */
export const CODE_REGEX = /^N[Gg]-[A-Za-z0-9]{8}$/;
export const REFERRAL_BASE = 'https://services.nusuk.sa/app/?p=27&id=';
export const MAX_TRIED = 400;
export const PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [20, 50, 100] as const;
export const MAX_CODES_PER_SUBMIT = 10;
export const MAX_LOCAL_CODES = 200;
export const STORAGE_KEYS = {
  tried: 'anc-tried-codes',
  lastOpened: 'anc-last-opened',
  theme: 'anc-theme',
  lang: 'anc-lang',
  localCodes: 'anc-local-codes',
  hiddenCodes: 'anc-hidden-codes',
} as const;
