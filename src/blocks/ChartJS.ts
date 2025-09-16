import type { Block } from 'payload'

export const ChartJS: Block = {
  slug: 'chartJS',
  labels: { singular: 'Chart (Chart.js)', plural: 'Charts (Chart.js)' },
  fields: [
    {
      name: 'chartType',
      type: 'select',
      required: true,
      defaultValue: 'bar',
      options: ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'scatter', 'bubble'],
      admin: { description: 'Chart.js type' },
    },
    {
      name: 'data',
      type: 'json',
      required: true,
      admin: {
        description: 'Paste a Chart.js “data” object: { labels: [...], datasets: [...] }',
      },
    },
    {
      name: 'options',
      type: 'json',
      admin: { description: 'Optional Chart.js “options” object.' },
    },
    { name: 'height', type: 'number', defaultValue: 360 },
    { name: 'caption', type: 'text' },
  ],
}
