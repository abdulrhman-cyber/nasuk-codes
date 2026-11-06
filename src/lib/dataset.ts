import type { CodeItem, CodesResult, LocalCode, Stats } from './types';

const DATA_URL = `${import.meta.env.BASE_URL}data/codes.json`;
const PAGE_DEFAULT = 20;

interface RawDataset {
  schemaVersion: number;
  updatedAt: string;
  linkTemplate: string;
  pinned?: { code: string; note?: string } | null;
  total: number;
  dated: number;
  codes: Array<[string, string | null]>;
}

export interface DatasetMeta {
  updatedAt: string;
  linkTemplate: string;
  pinned: { code: string; note?: string } | null;
  schemaVersion: number;
}

export interface CodeIndex {
  codes: string[];
  codeSet: Set<string>;
  rawDates: Array<string | null>;
  times: Array<number | null>;
  orderNewest: number[];
  orderOldest: number[];
  recentThreshold: number;
  meta: DatasetMeta;
  stats: Omit<Stats, 'localCount'>;
}

let cache: CodeIndex | null = null;
let pending: Promise<CodeIndex> | null = null;

/**
 * The source file stores dates as "YYYY-MM-DD HH:mm" without a timezone.
 * We interpret them as UTC so ordering and the 48h window stay deterministic
 * regardless of the visitor's device timezone.
 */
export function parseAddedAt(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(value);
  if (!match) return null;
  const timestamp = Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
  );
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

export async function loadDataset(): Promise<CodeIndex> {
  if (cache) return cache;
  if (pending) return pending;

  pending = (async () => {
    const response = await fetch(DATA_URL, { cache: 'force-cache' });
    if (!response.ok) throw new Error(`dataset_${response.status}`);
    const raw = (await response.json()) as RawDataset;

    if (!raw || !Array.isArray(raw.codes) || raw.codes.length === 0) {
      throw new Error('dataset_empty');
    }

    const total = raw.codes.length;
    const codes = new Array<string>(total);
    const rawDates = new Array<string | null>(total);
    const times = new Array<number | null>(total);
    let dated = 0;
    let newest = -Infinity;

    for (let index = 0; index < total; index += 1) {
      const entry = raw.codes[index];
      const code = Array.isArray(entry) ? entry[0] : '';
      const addedAt = Array.isArray(entry) ? entry[1] : null;
      codes[index] = typeof code === 'string' ? code : '';
      rawDates[index] = typeof addedAt === 'string' ? addedAt : null;
      const iso = parseAddedAt(rawDates[index]);
      const timestamp = iso ? Date.parse(iso) : null;
      times[index] = timestamp;
      if (timestamp != null) {
        dated += 1;
        if (timestamp > newest) newest = timestamp;
      }
    }

    const indices = Array.from({ length: total }, (_, index) => index);

    // Newest first: dated entries descending, undated entries last in file order.
    const orderNewest = indices.slice().sort((a, b) => {
      const ta = times[a];
      const tb = times[b];
      if (ta == null && tb == null) return a - b;
      if (ta == null) return 1;
      if (tb == null) return -1;
      if (tb !== ta) return tb - ta;
      return a - b;
    });

    // Oldest first: dated entries ascending, undated entries last in file order.
    const orderOldest = indices.slice().sort((a, b) => {
      const ta = times[a];
      const tb = times[b];
      if (ta == null && tb == null) return a - b;
      if (ta == null) return 1;
      if (tb == null) return -1;
      if (ta !== tb) return ta - tb;
      return a - b;
    });

    const updatedAt = typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString();
    const updatedMs = Date.parse(updatedAt);
    const recentThreshold = (Number.isFinite(updatedMs) ? updatedMs : Date.now()) - 48 * 60 * 60 * 1000;

    let recent48h = 0;
    for (let index = 0; index < total; index += 1) {
      const timestamp = times[index];
      if (timestamp != null && timestamp >= recentThreshold) recent48h += 1;
    }

    const meta: DatasetMeta = {
      updatedAt,
      linkTemplate:
        typeof raw.linkTemplate === 'string'
          ? raw.linkTemplate
          : 'https://services.nusuk.sa/app/?p=27&id={code}',
      pinned: raw.pinned && typeof raw.pinned.code === 'string' ? raw.pinned : null,
      schemaVersion: Number(raw.schemaVersion) || 1,
    };

    const stats: Omit<Stats, 'localCount'> = {
      total,
      dated,
      recent48h,
      available: total,
      lastUpdated: updatedAt,
      newestAddedAt: Number.isFinite(newest) ? new Date(newest).toISOString() : null,
    };

    cache = {
      codes,
      codeSet: new Set(codes),
      rawDates,
      times,
      orderNewest,
      orderOldest,
      recentThreshold,
      meta,
      stats,
    };
    return cache;
  })();

  try {
    return await pending;
  } catch (error) {
    pending = null;
    throw error;
  }
}

export type CodeFilter = 'all' | 'recent' | 'dated' | 'local' | 'hidden';

export interface QueryParams {
  q?: string;
  sort?: 'newest' | 'oldest';
  untriedFirst?: boolean;
  filter?: CodeFilter;
  tried?: Set<string>;
  hidden?: Set<string>;
  local?: LocalCode[];
  page?: number;
  pageSize?: number;
}

export function itemAt(index: CodeIndex, position: number): CodeItem {
  return {
    id: `d:${index.codes[position]}`,
    code: index.codes[position],
    submittedAt: parseAddedAt(index.rawDates[position]),
    addedTs: index.times[position],
    source: 'dataset',
  };
}

function localItem(entry: LocalCode): CodeItem {
  return {
    id: `l:${entry.code}`,
    code: entry.code,
    submittedAt: entry.addedAt,
    addedTs: Date.parse(entry.addedAt) || null,
    source: 'local',
  };
}

function normalizePage(page: number, totalPages: number): number {
  if (totalPages < 1) return 1;
  return Math.min(Math.max(1, Math.trunc(page) || 1), totalPages);
}

export function queryCodes(
  index: CodeIndex,
  {
    q = '',
    sort = 'newest',
    untriedFirst = false,
    filter = 'all',
    tried = new Set<string>(),
    hidden = new Set<string>(),
    local = [],
    page = 1,
    pageSize = PAGE_DEFAULT,
  }: QueryParams,
): CodesResult {
  const limit = Math.max(1, Math.trunc(pageSize) || PAGE_DEFAULT);
  const needle = q.trim().toUpperCase();

  // Local-only and hidden-only views are small and live outside the dataset.
  if (filter === 'local' || filter === 'hidden') {
    let source: CodeItem[];
    if (filter === 'local') {
      source = local
        .filter((entry) => {
          if (hidden.has(entry.code)) return false;
          if (!needle) return true;
          return entry.code.toUpperCase().includes(needle);
        })
        .map(localItem);
    } else {
      source = [...hidden].map((code) => {
        const found = local.find((entry) => entry.code === code);
        const addedTs = found ? Date.parse(found.addedAt) : null;
        return {
          id: `h:${code}`,
          code,
          submittedAt: found ? found.addedAt : null,
          addedTs: Number.isFinite(addedTs) ? addedTs : null,
          source: found ? 'local' : 'dataset',
        } satisfies CodeItem;
      });
    }

    source.sort((a, b) => (b.addedTs ?? 0) - (a.addedTs ?? 0));

    if (filter === 'local' && untriedFirst) {
      source = [
        ...source.filter((item) => !tried.has(item.code)),
        ...source.filter((item) => tried.has(item.code)),
      ];
    }

    const total = source.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = normalizePage(page, totalPages);
    const start = (safePage - 1) * limit;

    return {
      items: source.slice(start, start + limit),
      page: safePage,
      limit,
      total,
      totalPages,
      query: q,
      sort,
      untriedFirst,
    };
  }

  const order = sort === 'oldest' ? index.orderOldest : index.orderNewest;
  const matches: number[] = [];

  for (let position = 0; position < order.length; position += 1) {
    const slot = order[position];
    const code = index.codes[slot];
    if (hidden.has(code)) continue;

    if (filter === 'dated' && index.times[slot] == null) continue;
    if (filter === 'recent') {
      const timestamp = index.times[slot];
      if (timestamp == null || timestamp < index.recentThreshold) continue;
    }
    if (needle && !code.toUpperCase().includes(needle)) continue;

    matches.push(slot);
  }

  if (untriedFirst && matches.length > 1) {
    const untried: number[] = [];
    const done: number[] = [];
    for (const slot of matches) {
      if (tried.has(index.codes[slot])) done.push(slot);
      else untried.push(slot);
    }
    matches.length = 0;
    matches.push(...untried, ...done);
  }

  const total = matches.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = normalizePage(page, totalPages);
  const start = (safePage - 1) * limit;
  const window = matches.slice(start, start + limit);

  return {
    items: window.map((slot) => itemAt(index, slot)),
    page: safePage,
    limit,
    total,
    totalPages,
    query: q,
    sort,
    untriedFirst,
  };
}

export function resetDatasetCache(): void {
  cache = null;
  pending = null;
}
