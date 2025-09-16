// Minimal client for fetching dataset rows and normalizing types
export type Visibility = 'public' | 'private' | 'unlisted' | string;

export type DatasetFieldType =
  | 'string'
  | 'number'
  | 'integer'
  | 'float'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'time'
  | string;

export type DatasetFieldSchema = {
  name: string;
  type: DatasetFieldType;
};

export type DatasetDoc = {
  id: string;
  slug: string;
  visibility: Visibility;
  isLarge?: boolean;
  schema?: DatasetFieldSchema[];
  stats?: Record<string, unknown>;
  // Some datasets may inline small row samples in the document
  rows?: unknown[];
};

export type GetDatasetRowsArgs = {
  slug: string;
  offset?: number;
  limit?: number;
  fields?: string[];
  filters?: Record<string, unknown>;
  orderBy?: string | { field: string; direction?: 'asc' | 'desc' };
  datasetDoc?: DatasetDoc | null;
  baseUrl?: string; // Optional CMS base URL if different origin
  previewToken?: string | null; // For preview-only/private access
};

export type DatasetRowsResult = {
  ok: boolean;
  reason?: 'not_public' | 'forbidden' | 'not_found' | 'error';
  error?: string;
  rows: Record<string, unknown>[];
  total?: number;
};

function coerceValue(value: unknown, type: DatasetFieldType): unknown {
  if (value == null) return value as null;
  switch (type) {
    case 'integer':
    case 'float':
    case 'number': {
      const n = typeof value === 'number' ? value : Number(value);
      return Number.isNaN(n) ? null : n;
    }
    case 'boolean': {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') return ['true', '1', 'yes'].includes(value.toLowerCase());
      if (typeof value === 'number') return value !== 0;
      return null;
    }
    case 'date':
    case 'datetime':
    case 'time': {
      const d = value instanceof Date ? value : new Date(String(value));
      return Number.isNaN(d.getTime()) ? null : d.toISOString();
    }
    default:
      return value;
  }
}

function normalizeRow(
  row: Record<string, unknown>,
  schemaMap: Map<string, DatasetFieldType> | null,
): Record<string, unknown> {
  if (!schemaMap) return row;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    const t = schemaMap.get(k);
    out[k] = t ? coerceValue(v, t) : v;
  }
  return out;
}

function buildQuery(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v == null) continue;
    if (Array.isArray(v)) {
      v.forEach((item) => sp.append(k, String(item)));
    } else if (typeof v === 'object') {
      sp.set(k, JSON.stringify(v));
    } else {
      sp.set(k, String(v));
    }
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

export async function getDatasetRows(args: GetDatasetRowsArgs): Promise<DatasetRowsResult> {
  const {
    slug,
    offset = 0,
    limit = 200,
    fields,
    filters,
    orderBy,
    datasetDoc,
    baseUrl,
    previewToken,
  } = args;

  const schemaMap = datasetDoc?.schema
    ? new Map<string, DatasetFieldType>(datasetDoc.schema.map((f) => [f.name, f.type]))
    : null;

  // Security: if not public and no preview token, do not fetch
  if (datasetDoc && datasetDoc.visibility !== 'public' && !previewToken) {
    return { ok: false, reason: 'not_public', rows: [], total: 0 };
  }

  // Try endpoint first
  const path = `/datasets/${encodeURIComponent(slug)}/rows`;
  const url = (baseUrl ? baseUrl.replace(/\/$/, '') : '') + path;
  const qs = buildQuery({ offset, limit, fields, filters, orderBy, token: previewToken || undefined });

  try {
    const res = await fetch(url + qs, {
      headers: previewToken ? { Authorization: `Bearer ${previewToken}` } : undefined,
      // Avoid caching dynamic pages when previewing
      cache: previewToken ? 'no-store' : 'force-cache',
    });
    if (res.status === 401 || res.status === 403) {
      return { ok: false, reason: 'forbidden', rows: [], total: 0 };
    }
    if (res.status === 404) {
      // Fall back to inline rows if available for small datasets
      if (datasetDoc?.rows && datasetDoc.rows instanceof Array) {
        const slice = (datasetDoc.rows as Record<string, unknown>[]).slice(offset, offset + limit);
        const rows = schemaMap ? slice.map((r) => normalizeRow(r, schemaMap)) : slice;
        return { ok: true, rows, total: (datasetDoc.rows as unknown[]).length };
      }
      return { ok: false, reason: 'not_found', rows: [], total: 0 };
    }
    if (!res.ok) {
      return { ok: false, reason: 'error', error: `HTTP ${res.status}`, rows: [], total: 0 };
    }
    const json: { rows: Record<string, unknown>[]; total?: number } | Record<string, unknown>[] = await res.json();
    const rowsArray = Array.isArray(json) ? (json as Record<string, unknown>[]) : (json.rows || []);
    const total = Array.isArray(json) ? rowsArray.length : json.total;
    const rows = schemaMap ? rowsArray.map((r) => normalizeRow(r, schemaMap)) : rowsArray;
    return { ok: true, rows, total };
  } catch (e: any) {
    // Network or runtime error; fallback to inline if possible
    if (datasetDoc?.rows && datasetDoc.rows instanceof Array) {
      const slice = (datasetDoc.rows as Record<string, unknown>[]).slice(offset, offset + limit);
      const rows = schemaMap ? slice.map((r) => normalizeRow(r, schemaMap)) : slice;
      return { ok: true, rows, total: (datasetDoc.rows as unknown[]).length };
    }
    return { ok: false, reason: 'error', error: e?.message || 'fetch failed', rows: [], total: 0 };
  }
}

export async function getDatasetDoc(args: {
  id?: string;
  slug?: string;
  baseUrl?: string;
  previewToken?: string | null;
}): Promise<DatasetDoc | null> {
  const { id, slug, baseUrl, previewToken } = args;
  if (!id && !slug) return null;
  const path = id
    ? `/datasets/by-id/${encodeURIComponent(id)}`
    : `/datasets/${encodeURIComponent(slug as string)}`;
  const url = (baseUrl ? baseUrl.replace(/\/$/, '') : '') + path;
  try {
    const res = await fetch(url, {
      headers: previewToken ? { Authorization: `Bearer ${previewToken}` } : undefined,
      cache: previewToken ? 'no-store' : 'force-cache',
    });
    if (!res.ok) return null;
    const json = await res.json();
    // Expecting a document with at least id, slug, visibility, schema, isLarge, stats
    return json as DatasetDoc;
  } catch {
    return null;
  }
}
