export type CodeSource = 'dataset' | 'local';

export interface CodeItem {
  id: string;
  code: string;
  /** ISO timestamp, or null when the source file has no recorded date. */
  submittedAt: string | null;
  /** Epoch ms used for sorting/filtering, or null when undated. */
  addedTs: number | null;
  source: CodeSource;
  reportCount?: number;
}

export interface LocalCode {
  code: string;
  addedAt: string;
}

export interface HiddenCode {
  code: string;
  reason: string;
  at: string;
}

export interface Stats {
  /** Unique codes in the bundled dataset. */
  total: number;
  /** Codes that carry an addedAt value in the source file. */
  dated: number;
  /** Codes added within the last 48 hours before the dataset timestamp. */
  recent48h: number;
  /** Codes available in the list right now (after local hidden codes are excluded). */
  available: number;
  /** When the dataset file itself was captured. */
  lastUpdated: string;
  /** Newest recorded addedAt, ISO, or null. */
  newestAddedAt: string | null;
  /** Local additions stored on this device only. */
  localCount: number;
}

export interface CodesResult {
  items: CodeItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  query: string;
  sort: 'newest' | 'oldest';
  untriedFirst: boolean;
}

export interface LastOpened {
  code: string;
  at: string;
}
