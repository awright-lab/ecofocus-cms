import type { CollectionConfig } from 'payload'

export const CTABanner: CollectionConfig = {
  slug: 'cta-banner',
  labels: {
    singular: 'CTA Banner',
    plural: 'CTA Banners',
  },
  admin: {
    useAsTitle: 'text',
    group: 'Homepage',
  },
  fields: [
    { name: 'text', type: 'text' },
    { name: 'buttonLabel', type: 'text' },
    { name: 'buttonUrl', type: 'text' },
  ],
}
