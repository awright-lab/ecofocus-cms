import type { CollectionConfig } from 'payload'

export const Homepage: CollectionConfig = {
  slug: 'homepage',
  labels: {
    singular: 'Homepage',
    plural: 'Homepage',
  },
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'layout',
      type: 'blocks',
      label: 'Homepage Layout',
      blocks: [
        {
          slug: 'hero',
          labels: { singular: 'Hero Section', plural: 'Hero Sections' },
          fields: [
            {
              name: 'headline',
              type: 'text',
              required: true,
            },
            {
              name: 'subheadline',
              type: 'textarea',
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
        },
        {
          slug: 'quickStats',
          labels: { singular: 'Quick Stats', plural: 'Quick Stats' },
          fields: [
            {
              name: 'stats',
              type: 'array',
              fields: [
                { name: 'value', type: 'text', required: true },
                { name: 'description', type: 'text', required: true },
              ],
            },
          ],
        },
        {
          slug: 'featuredReport',
          labels: { singular: 'Featured Report', plural: 'Featured Reports' },
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'description', type: 'textarea' },
            { name: 'price', type: 'text' },
            { name: 'ctaLabel', type: 'text' },
            { name: 'ctaUrl', type: 'text' },
            { name: 'image', type: 'upload', relationTo: 'media' },
          ],
        },
        {
          slug: 'dashboardPromo',
          labels: { singular: 'Dashboard Promo', plural: 'Dashboard Promos' },
          fields: [
            { name: 'headline', type: 'text' },
            { name: 'description', type: 'textarea' },
            { name: 'ctaLabel', type: 'text' },
            { name: 'ctaUrl', type: 'text' },
            { name: 'image', type: 'upload', relationTo: 'media' },
          ],
        },
        {
          slug: 'ecoNuggets',
          labels: { singular: 'EcoNuggets', plural: 'EcoNuggets' },
          fields: [
            { name: 'heading', type: 'text' },
            { name: 'description', type: 'textarea' },
          ],
        },
        {
          slug: 'whyChoose',
          labels: { singular: 'Why Choose', plural: 'Why Choose' },
          fields: [
            {
              name: 'items',
              type: 'array',
              fields: [
                { name: 'title', type: 'text' },
                { name: 'description', type: 'textarea' },
              ],
            },
          ],
        },
        {
          slug: 'trustedBy',
          labels: { singular: 'Trusted By', plural: 'Trusted By' },
          fields: [
            {
              name: 'logos',
              type: 'array',
              fields: [
                {
                  name: 'logo',
                  type: 'upload',
                  relationTo: 'media',
                },
              ],
            },
          ],
        },
        {
          slug: 'callToAction',
          labels: { singular: 'CTA Banner', plural: 'CTA Banners' },
          fields: [
            { name: 'text', type: 'text' },
            { name: 'buttonLabel', type: 'text' },
            { name: 'buttonUrl', type: 'text' },
          ],
        },
      ],
    },
  ],
}
