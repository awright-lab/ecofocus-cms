import type { CollectionConfig } from 'payload'

export const EcoNuggets: CollectionConfig = {
  slug: 'eco-nuggets',
  labels: {
    singular: 'Eco Nugget',
    plural: 'Eco Nuggets',
  },
  admin: {
    useAsTitle: 'heading',
    group: 'Website Content',
  },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'description', type: 'textarea' },
  ],
}
