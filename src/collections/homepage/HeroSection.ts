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
  fields: [
    { name: 'headline', type: 'text', required: true },
    { name: 'highlightedWord', type: 'text', label: 'Highlighted Word', required: false },
    { name: 'subheadline', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'backgroundImage', type: 'upload', relationTo: 'media' },
    { name: 'backgroundVideo', type: 'upload', relationTo: 'media' },
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
