"use client";

import React from "react";

export type ChartType = "bar" | "line" | "area" | "pie" | "donut" | "scatter";

export type ChartRendererProps = {
  chartType: ChartType;
  data: Record<string, unknown>[];
  xField: string;
  yFields: string[];
  seriesLabelField?: string;
  stacked?: boolean;
  numberFormat?: (n: number) => string;
  unit?: string;
  legend?: boolean;
  xLabel?: string;
  yLabel?: string;
  colorPalette?: string[];
  height?: number;
};

// Lightweight formatter utility
function defaultFormatter(unit?: string) {
  return (n: number) =>
    typeof n === "number" && Number.isFinite(n)
      ? `${new Intl.NumberFormat(undefined, { maximumSignificantDigits: 6 }).format(n)}${unit ? ` ${unit}` : ""}`
      : String(n);
}

function groupBy<T extends Record<string, unknown>>(rows: T[], key: string) {
  const map = new Map<string, T[]>();
  for (const r of rows) {
    const k = String(r[key] ?? "");
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(r);
  }
  return map;
}

function pivotLongToWide(
  rows: Record<string, unknown>[],
  xField: string,
  seriesField: string,
  valueField: string,
) {
  // collect unique x values in order
  const xValues: any[] = [];
  const matrix = new Map<string, Map<string, number | null>>(); // x -> series -> value
  const seriesSet = new Set<string>();
  for (const r of rows) {
    const x = String(r[xField] ?? "");
    const s = String(r[seriesField] ?? "");
    const vRaw = r[valueField];
    const v = typeof vRaw === "number" ? vRaw : Number(vRaw);
    if (!matrix.has(x)) {
      matrix.set(x, new Map());
      xValues.push(x);
    }
    seriesSet.add(s);
    matrix.get(x)!.set(s, Number.isFinite(v) ? v : null);
  }
  const series = Array.from(seriesSet);
  const out: Record<string, unknown>[] = xValues.map((x) => {
    const row: Record<string, unknown> = { [xField]: x };
    for (const s of series) {
      row[s] = matrix.get(x)?.get(s) ?? null;
    }
    return row;
  });
  return { data: out, seriesKeys: series };
}

export default function ChartRenderer(props: ChartRendererProps) {
  const {
    chartType,
    data,
    xField,
    yFields,
    seriesLabelField,
    stacked,
    numberFormat,
    unit,
    legend,
    xLabel,
    yLabel,
    colorPalette,
    height = 320,
  } = props;

  const format = React.useMemo(() => numberFormat ?? defaultFormatter(unit), [numberFormat, unit]);

  const [recharts, setRecharts] = React.useState<any | null>(null);
  React.useEffect(() => {
    let mounted = true;
    import("recharts")
      .then((mod) => {
        if (mounted) setRecharts(mod);
      })
      .catch(() => setRecharts(null));
    return () => {
      mounted = false;
    };
  }, []);

  const palette = colorPalette ?? undefined;

  // Prepare data shape
  const prepared = React.useMemo(() => {
    if (seriesLabelField) {
      const valueField = yFields[0] ?? "value";
      return pivotLongToWide(data, xField, seriesLabelField, valueField);
    }
    return { data, seriesKeys: yFields };
  }, [data, xField, yFields, seriesLabelField]);

  // Fallback UI when recharts is not present
  if (!recharts) {
    return (
      <div style={{ height }}>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          Interactive chart unavailable. Rendering requires the client chart library.
        </div>
      </div>
    );
  }

  const {
    ResponsiveContainer,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    LineChart,
    Line,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    ScatterChart,
    Scatter,
    Label,
  } = recharts;

  const commonAxes = (
    <>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xField}>
        {xLabel ? <Label value={xLabel} position="insideBottom" dy={12} /> : null}
      </XAxis>
      <YAxis tickFormatter={(v: any) => format(Number(v))}>
        {yLabel ? <Label value={yLabel} angle={-90} position="insideLeft" dx={-10} /> : null}
      </YAxis>
      <Tooltip formatter={(value: any) => format(Number(value))} />
      {legend ? <Legend /> : null}
    </>
  );

  const colors = (idx: number) => (palette ? palette[idx % palette.length] : undefined);

  const renderCartesianSeries = (kind: 'bar' | 'line' | 'area') => {
    const series = prepared.seriesKeys.length ? prepared.seriesKeys : yFields;
    const keyList = series.length ? series : [yFields[0]].filter(Boolean);
    const SeriesComp = kind === 'bar' ? Bar : kind === 'line' ? Line : Area;
    const ChartComp = kind === 'bar' ? BarChart : kind === 'line' ? LineChart : AreaChart;
    const baseProps = kind === 'bar' ? { barSize: 24 } : kind === 'line' ? { dot: false } : { stackOffset: 'none' };
    return (
      <ResponsiveContainer width="100%" height={height}>
        <ChartComp data={prepared.data} {...baseProps}>
          {commonAxes}
          {keyList.map((k: string, i: number) => (
            <SeriesComp
              key={k}
              type="monotone"
              dataKey={k}
              stackId={stacked ? 'stack' : undefined}
              stroke={colors(i)}
              fill={colors(i)}
            />
          ))}
        </ChartComp>
      </ResponsiveContainer>
    );
  };

  if (chartType === 'bar' || chartType === 'line' || chartType === 'area') {
    return renderCartesianSeries(chartType);
  }

  if (chartType === 'pie' || chartType === 'donut') {
    // use first y-field or infer 'value'
    const valueKey = yFields[0] ?? 'value';
    let pieData: { name: string; value: number }[] = [];
    if (seriesLabelField) {
      const g = groupBy(prepared.data as any, seriesLabelField);
      pieData = Array.from(g.entries()).map(([name, rows]) => ({
        name,
        value: rows.reduce((acc, r) => acc + (Number(r[valueKey] as any) || 0), 0),
      }));
    } else {
      // group by xField
      const g = groupBy(prepared.data as any, xField);
      pieData = Array.from(g.entries()).map(([name, rows]) => ({
        name,
        value: rows.reduce((acc, r) => acc + (Number(r[valueKey] as any) || 0), 0),
      }));
    }
    const innerRadius = chartType === 'donut' ? '50%' : 0;
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Tooltip formatter={(value: any) => format(Number(value))} />
          {legend ? <Legend /> : null}
          <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={innerRadius} outerRadius="80%">
            {pieData.map((_, i) => (
              <Cell key={`cell-${i}`} fill={colors(i)} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === 'scatter') {
    const yKey = yFields[0];
    return (
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xField} type="number" name={xLabel || xField} />
          <YAxis dataKey={yKey} type="number" name={yLabel || yKey} tickFormatter={(v: any) => format(Number(v))} />
          <Tooltip formatter={(value: any) => format(Number(value))} />
          {legend ? <Legend /> : null}
          <Scatter data={prepared.data} fill={colors(0)} />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  return (
    <div style={{ height }}>
      <div style={{ fontSize: 12, opacity: 0.7 }}>Unsupported chart type.</div>
    </div>
  );
}

