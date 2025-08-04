import type { CollectionConfig } from 'payload'

export const WhyChoose: CollectionConfig = {
  slug: 'why-choose',
  labels: {
    singular: 'Why Choose',
    plural: 'Why Choose Sections',
  },
  admin: {
    useAsTitle: 'id',
    group: 'Homepage',
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Why Choose Items',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
      ],
    },
  ],
}
