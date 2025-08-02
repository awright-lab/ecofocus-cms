import { CollectionConfig } from 'payload'

const Homepage: CollectionConfig = {
  slug: 'homepage',
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
      label: 'Page Title',
      required: true,
    },
    {
      name: 'layout',
      type: 'blocks',
      label: 'Homepage Layout',
      blocks: [
        // Hero Block
        {
          slug: 'hero',
          labels: {
            singular: 'Hero Section',
            plural: 'Hero Sections',
          },
          fields: [
            { name: 'headline', type: 'text', required: true },
            { name: 'subheadline', type: 'textarea' },
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
              label: 'Hero CTAs',
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'url', type: 'text', required: true },
              ],
            },
          ],
        },
        // Quick Stats Block
        {
          slug: 'quickStats',
          labels: {
            singular: 'Quick Stats',
            plural: 'Quick Stats',
          },
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
        // Featured Report Block
        {
          slug: 'featuredReport',
          labels: {
            singular: 'Featured Report',
            plural: 'Featured Reports',
          },
          fields: [
            { name: 'title', type: 'text' },
            { name: 'description', type: 'textarea' },
            { name: 'price', type: 'text' },
            { name: 'ctaLabel', type: 'text' },
            { name: 'ctaUrl', type: 'text' },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
        // Dashboard Promo Block
        {
          slug: 'dashboardPromo',
          labels: {
            singular: 'Dashboard Promo',
            plural: 'Dashboard Promos',
          },
          fields: [
            { name: 'headline', type: 'text' },
            { name: 'description', type: 'textarea' },
            { name: 'ctaLabel', type: 'text' },
            { name: 'ctaUrl', type: 'text' },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
        // EcoNugget Insights Block
        {
          slug: 'ecoNuggets',
          labels: {
            singular: 'EcoNugget Insights',
            plural: 'EcoNugget Insights',
          },
          fields: [
            { name: 'heading', type: 'text' },
            { name: 'description', type: 'textarea' },
          ],
        },
        // Why Choose Block
        {
          slug: 'whyChoose',
          labels: {
            singular: 'Why Choose EcoFocus',
            plural: 'Why Choose EcoFocus Sections',
          },
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
        // Trusted By Block
        {
          slug: 'trustedBy',
          labels: {
            singular: 'Trusted By',
            plural: 'Trusted By Sections',
          },
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
        // Call To Action Block
        {
          slug: 'callToAction',
          labels: {
            singular: 'Call To Action',
            plural: 'Call To Action Sections',
          },
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

export default Homepage
