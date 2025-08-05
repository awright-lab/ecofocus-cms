import type { CollectionConfig } from 'payload'

export const HeroSection: CollectionConfig = {
  slug: 'hero-section',
  labels: {
    singular: 'Hero Section',
    plural: 'Hero Sections',
  },
  admin: {
    useAsTitle: 'headline',
    group: 'Homepage',
  },
  access: {
    read: () => true, // Public read for homepage
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'headline',
      type: 'text',
      required: true,
    },
    {
      name: 'subheadline',
      type: 'text',
      required: false,
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'backgroundVideo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'ctaButtons',
      type: 'array',
      label: 'CTA Buttons',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
  ],
}
