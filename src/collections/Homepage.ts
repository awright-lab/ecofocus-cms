import { CollectionConfig } from 'payload'

const Homepage: CollectionConfig = {
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
      label: 'Page Title',
      required: true,
    },
    {
      name: 'layout',
      type: 'blocks',
      label: 'Homepage Layout',
      blocks: [
        {
          slug: 'hero',
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
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'url', type: 'text', required: true },
              ],
            },
          ],
        },
        {
          slug: 'quickStats',
          fields: [
            {
              name: 'stats',
              type: 'array',
              fields: [
                { name: 'value', type: 'text' },
                { name: 'description', type: 'text' },
              ],
            },
          ],
        },
        {
          slug: 'featuredReport',
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
        {
          slug: 'dashboardPromo',
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
        {
          slug: 'ecoNuggets',
          fields: [
            { name: 'heading', type: 'text' },
            { name: 'description', type: 'textarea' },
          ],
        },
        {
          slug: 'whyChoose',
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
