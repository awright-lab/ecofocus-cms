"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import ChartRenderer, { type ChartType } from "../../charts/ChartRenderer";
import { getDatasetRows, getDatasetDoc, type DatasetDoc } from "../../../lib/datasets";

type GraphBlock = {
  blockType: 'graphFromDataset';
  dataset: DatasetDoc | { id: string } | null;
  chartType: ChartType;
  xField: string;
  yFields: string[];
  seriesLabelField?: string | null;
  stacked?: boolean;
  numberFormat?: 'compact' | 'default' | string | null;
  unit?: string | null;
  legend?: boolean;
  xLabel?: string | null;
  yLabel?: string | null;
  colorPalette?: string[] | null;
  height?: number | null;
  showTableBelow?: boolean;
  filters?: Record<string, unknown> | null;
  orderBy?: string | { field: string; direction?: 'asc' | 'desc' } | null;
  caption?: string | null;
};

function buildNumberFormatter(kind?: GraphBlock['numberFormat'], unit?: string | null) {
  if (typeof kind === 'function') return kind as any;
  const fmt = kind === 'compact'
    ? new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 2 })
    : new Intl.NumberFormat(undefined, { maximumSignificantDigits: 6 });
  return (n: number) => `${fmt.format(n)}${unit ? ` ${unit}` : ''}`;
}

function sanitizeFields(fields: string[], dataset?: DatasetDoc | null) {
  if (!dataset?.schema?.length) return fields;
  const allowed = new Set(dataset.schema.map((f) => f.name));
  return fields.filter((f) => allowed.has(f));
}

function applyClientFilters(
  rows: Record<string, unknown>[],
  filters?: Record<string, unknown> | null,
  orderBy?: GraphBlock['orderBy'],
) {
  let out = rows;
  if (filters && Object.keys(filters).length) {
    out = out.filter((r) => {
      for (const [k, v] of Object.entries(filters)) {
        if (r[k] !== v) return false;
      }
      return true;
    });
  }
  if (orderBy) {
    const spec = typeof orderBy === 'string' ? { field: orderBy, direction: 'asc' as const } : orderBy;
    out = [...out].sort((a, b) => {
      const av = a[spec.field] as any;
      const bv = b[spec.field] as any;
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av < bv) return spec.direction === 'asc' ? -1 : 1;
      if (av > bv) return spec.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }
  return out;
}

export default function GraphFromDatasetBlock({ block, previewToken, baseUrl }: {
  block: GraphBlock;
  previewToken?: string | null;
  baseUrl?: string;
}) {
  const searchParams = useSearchParams();
  const qpToken = searchParams?.get('preview') || searchParams?.get('token') || null;
  const effPreviewToken = previewToken ?? qpToken;
  const effBaseUrl = baseUrl ?? (process.env.NEXT_PUBLIC_CMS_URL as string | undefined);

  const [dataset, setDataset] = React.useState<DatasetDoc | null>(
    block.dataset && 'slug' in (block.dataset as any) ? (block.dataset as DatasetDoc) : null,
  );

  const [state, setState] = React.useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ok'; rows: Record<string, unknown>[]; total?: number }
  >({ status: 'loading' });

  const xFieldRaw = block.xField;
  const xField = (dataset?.schema ? sanitizeFields([xFieldRaw], dataset)[0] : xFieldRaw) || xFieldRaw;
  const yFields = sanitizeFields(block.yFields || [], dataset);
  const seriesLabelFieldRaw = block.seriesLabelField || undefined;
  const seriesLabelField = (dataset?.schema && seriesLabelFieldRaw)
    ? sanitizeFields([seriesLabelFieldRaw], dataset)[0]
    : seriesLabelFieldRaw;

  // Fetch dataset doc if only id provided
  React.useEffect(() => {
    let mounted = true;
    async function ensureDataset() {
      if (!dataset && block.dataset && 'id' in (block.dataset as any)) {
        const doc = await getDatasetDoc({ id: (block.dataset as any).id, baseUrl: effBaseUrl, previewToken: effPreviewToken });
        if (mounted) setDataset(doc);
      }
    }
    ensureDataset();
    return () => {
      mounted = false;
    };
  }, [dataset, block.dataset, effBaseUrl, effPreviewToken]);

  React.useEffect(() => {
    let mounted = true;
    async function run() {
      if (!dataset) {
        setState({ status: 'error', message: 'Dataset not attached.' });
        return;
      }
      // Security: respect visibility
      if (dataset.visibility !== 'public' && !effPreviewToken) {
        setState({ status: 'error', message: "This chart's data isn't public." });
        return;
      }
      const res = await getDatasetRows({
        slug: dataset.slug,
        offset: 0,
        limit: 200,
        fields: Array.from(new Set([xField, ...yFields, seriesLabelField].filter(Boolean))) as string[],
        filters: block.filters || undefined,
        orderBy: block.orderBy || undefined,
        datasetDoc: dataset,
        baseUrl: effBaseUrl,
        previewToken: effPreviewToken || null,
      });
      if (!mounted) return;
      if (!res.ok) {
        setState({ status: 'error', message: res.reason === 'forbidden' || res.reason === 'not_public' ? "This chart's data isn't public." : 'Failed to load dataset.' });
        return;
      }
      const rows = applyClientFilters(res.rows, block.filters, block.orderBy);
      setState({ status: 'ok', rows, total: res.total });
    }
    run();
    return () => {
      mounted = false;
    };
  }, [dataset?.slug, dataset?.visibility, effPreviewToken, effBaseUrl, xField, JSON.stringify(yFields), block.filters ? JSON.stringify(block.filters) : '', block.orderBy ? JSON.stringify(block.orderBy) : '']);

  if (!dataset) {
    return <div className="text-sm text-muted-foreground">Dataset reference missing.</div>;
  }

  if (state.status === 'loading') {
    return <div className="text-sm opacity-70">Loading chart…</div>;
  }
  if (state.status === 'error') {
    return <div className="text-sm opacity-70">{state.message}</div>;
  }

  const numberFmtFn = React.useMemo(() => buildNumberFormatter(block.numberFormat, block.unit), [block.numberFormat, block.unit]);
  const total = state.total ?? state.rows.length;
  const showMore = dataset.isLarge && total > state.rows.length;

  const height = block.height ?? 320;

  return (
    <figure>
      <div className="w-full" style={{ height }}>
        <ChartRenderer
          chartType={block.chartType}
          data={state.rows}
          xField={xField}
          yFields={yFields}
          seriesLabelField={seriesLabelField || undefined}
          stacked={!!block.stacked}
          numberFormat={numberFmtFn}
          unit={block.unit || undefined}
          legend={!!block.legend}
          xLabel={block.xLabel || undefined}
          yLabel={block.yLabel || undefined}
          colorPalette={block.colorPalette || undefined}
          height={height}
        />
      </div>

      {block.showTableBelow ? (
        <div className="mt-3">
          <div className="overflow-x-auto max-h-64 overflow-y-auto border rounded">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {[xField, ...yFields, seriesLabelField].filter(Boolean).map((h) => (
                    <th key={h as string} className="text-left px-2 py-1 border-b bg-gray-50">{h as string}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {state.rows.slice(0, 20).map((r, i) => (
                  <tr key={i} className="border-b last:border-0">
                    {[xField, ...yFields, seriesLabelField].filter(Boolean).map((k) => (
                      <td key={k as string} className="px-2 py-1 whitespace-nowrap">
                        {typeof r[k as string] === 'number' ? numberFmtFn(r[k as string] as number) : String(r[k as string] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {showMore ? (
        <div className="mt-2 text-xs text-muted-foreground">
          Showing first {state.rows.length} of {total} rows. View more data in the dataset page.
        </div>
      ) : null}

      {block.caption ? (
        <figcaption className="mt-2 text-sm text-muted-foreground">{block.caption}</figcaption>
      ) : null}

      {!(block.showTableBelow ?? false) ? (
        <style jsx>{`
          @media print {
            /* Hide heavy interactive chart; show a simple notice */
            div[style*='height'] { display: none; }
            figure::after { content: 'Interactive chart — see online.'; font-size: 12px; color: #555; }
          }
        `}</style>
      ) : (
        <style jsx>{`
          @media print {
            /* Hide heavy interactive chart; keep the table visible */
            div[style*='height'] { display: none; }
          }
        `}</style>
      )}
    </figure>
  );
}
