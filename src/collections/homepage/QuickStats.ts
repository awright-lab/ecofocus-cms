import type { CollectionConfig } from 'payload'

export const QuickStats: CollectionConfig = {
  slug: 'quick-stats',
  labels: {
    singular: 'Quick Stats',
    plural: 'Quick Stats',
  },
  admin: {
    useAsTitle: 'id',
    group: 'Homepage',
  },
  fields: [
    {
      name: 'stats',
      type: 'array',
      label: 'Stats',
      fields: [
        { name: 'value', type: 'text', required: true },
        { name: 'description', type: 'text', required: true },
      ],
    },
  ],
}
