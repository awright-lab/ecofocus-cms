import type { CollectionConfig } from 'payload'

export const FeaturedReport: CollectionConfig = {
  slug: 'featured-report',
  labels: {
    singular: 'Featured Report',
    plural: 'Featured Reports',
  },
  admin: {
    useAsTitle: 'title',
    group: 'Website Content',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'price', type: 'text' },
    { name: 'ctaLabel', type: 'text' },
    { name: 'ctaUrl', type: 'text' },
    { name: 'image', type: 'upload', relationTo: 'media' },
  ],
}
