// src/blocks/ChartJS.ts
import type { Block } from 'payload'

export const ChartJS: Block = {
  slug: 'chartJS',
  labels: { singular: 'Chart', plural: 'Charts' },
  fields: [
    {
      name: 'chartType',
      type: 'select',
      required: true,
      defaultValue: 'bar',
      options: [
        { label: 'Bar', value: 'bar' },
        { label: 'Line', value: 'line' },
        { label: 'Area (filled line)', value: 'area' }, // map to line+fill in transformer
        { label: 'Pie', value: 'pie' },
        { label: 'Doughnut', value: 'doughnut' }, // Chart.js name
        { label: 'Scatter', value: 'scatter' },
      ],
    },

    // Orientation (only for bars)
    {
      name: 'orientation',
      label: 'Bar orientation',
      type: 'select',
      defaultValue: 'column',
      options: [
        { label: 'Columns (vertical bars)', value: 'column' },
        { label: 'Rows (horizontal bars)', value: 'row' },
      ],
      admin: {
        // IMPORTANT: use siblingData in blocks
        condition: (data, siblingData) => (siblingData ?? data)?.chartType === 'bar',
      },
    },

    {
      type: 'row',
      fields: [
        {
          name: 'xField',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'seriesLabelField',
          type: 'text',
          required: false,
          admin: {
            description:
              'Optional. If provided, rows are pivoted by this field (series per unique value).',
            width: '50%',
          },
        },
      ],
    },

    {
      name: 'yFields',
      type: 'array',
      required: true,
      minRows: 1,
      admin: { description: 'One or more numeric fields to plot.' },
      fields: [
        { name: 'field', type: 'text', required: true },
        { name: 'label', type: 'text', required: false }, // legend label override
      ],
      validate: (val) => (Array.isArray(val) && val.length > 0 ? true : 'Add at least one yField'),
    },

    // Data source
    {
      name: 'dataSource',
      type: 'group',
      fields: [
        {
          name: 'dataset',
          type: 'relationship',
          relationTo: 'datasets' as unknown as import('payload').CollectionSlug,
          required: false,
          admin: { description: 'Reference a reusable dataset (preferred).' },
        },
        {
          name: 'inlineData',
          type: 'json',
          required: false,
          admin: {
            description: 'Optional raw rows (array of objects). Used if no dataset is chosen.',
          },
          validate: (val) => {
            if (val == null) return true
            return Array.isArray(val) ? true : 'inlineData must be an array of row objects'
          },
        },
      ],
      validate: (value) => {
        const v = (typeof value === 'object' && value !== null ? value : {}) as {
          dataset?: unknown
          inlineData?: unknown
        }
        const hasDataset = v.dataset != null && v.dataset !== ''
        const hasInline = Array.isArray(v.inlineData) && v.inlineData.length > 0
        return hasDataset || hasInline ? true : 'Select a dataset or provide inlineData.'
      },
    },

    // Presentation
    {
      type: 'row',
      fields: [
        { name: 'stacked', type: 'checkbox', defaultValue: false, admin: { width: '25%' } },
        { name: 'legend', type: 'checkbox', defaultValue: true, admin: { width: '25%' } },
        { name: 'unit', type: 'text', required: false, admin: { width: '25%' } },
        {
          name: 'height',
          type: 'number',
          defaultValue: 320,
          min: 160,
          admin: { width: '25%' },
        },
      ],
    },

    // Gridline controls
    {
      name: 'grid',
      type: 'group',
      admin: { description: 'Gridline styling (leave defaults to lightly dim the grid).' },
      fields: [
        {
          name: 'showX',
          type: 'checkbox',
          label: 'Show X grid',
          defaultValue: true,
          admin: { width: '25%' },
        },
        {
          name: 'showY',
          type: 'checkbox',
          label: 'Show Y grid',
          defaultValue: true,
          admin: { width: '25%' },
        },
        {
          name: 'drawBorder',
          type: 'checkbox',
          label: 'Draw chart border',
          defaultValue: false,
          admin: { width: '25%' },
        },
        {
          name: 'dim',
          type: 'checkbox',
          label: 'Dim gridlines',
          defaultValue: true,
          admin: { width: '25%' },
        },
        {
          name: 'color',
          type: 'text',
          label: 'Grid color (optional)',
          required: false,
          admin: {
            description:
              'RGBA/hex (e.g., rgba(0,0,0,0.08)). If empty and "Dim" is on, a faint default is used.',
          },
        },
      ],
    },

    // Bar rounding (bars only)
    {
      name: 'barRadius',
      type: 'number',
      defaultValue: 8,
      admin: {
        description: 'Rounded corners for bar charts.',
        condition: (data, siblingData) => (siblingData ?? data)?.chartType === 'bar',
      },
    },

    // Series colors
    {
      name: 'colorPalette',
      type: 'array',
      required: false,
      admin: { description: 'Optional color hex values in series order.' },
      fields: [{ name: 'color', type: 'text', required: true }],
    },
  ],
}
