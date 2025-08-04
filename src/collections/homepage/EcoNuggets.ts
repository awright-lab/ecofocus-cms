import type { CollectionConfig } from 'payload'

export const EcoNuggets: CollectionConfig = {
  slug: 'eco-nuggets',
  labels: {
    singular: 'Eco Nugget',
    plural: 'Eco Nuggets',
  },
  admin: {
    useAsTitle: 'heading',
    group: 'Homepage',
  },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'description', type: 'textarea' },
  ],
}
