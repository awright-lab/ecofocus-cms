import type { CollectionConfig } from 'payload'

export const DashboardPromo: CollectionConfig = {
  slug: 'dashboard-promo',
  labels: {
    singular: 'Dashboard Promo',
    plural: 'Dashboard Promos',
  },
  admin: {
    useAsTitle: 'headline',
    group: 'Homepage',
  },
  fields: [
    { name: 'headline', type: 'text' },
    { name: 'description', type: 'textarea' },
    { name: 'ctaLabel', type: 'text' },
    { name: 'ctaUrl', type: 'text' },
    { name: 'image', type: 'upload', relationTo: 'media' },
  ],
}
