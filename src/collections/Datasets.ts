// src/collections/Datasets.ts
import type { CollectionConfig } from 'payload'
import { slugify } from '../utils/slugify'

export const Datasets: CollectionConfig = {
  slug: 'datasets',
  labels: { singular: 'Dataset', plural: 'Datasets' },
  admin: { useAsTitle: 'title', group: 'Content' },
  access: {
    read: () => true, // public fetch OK (adjust if needed)
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: { description: 'Auto-generated from title if left blank.' },
    },
    {
      name: 'sourceUrl',
      type: 'text',
      required: false,
      admin: { description: 'Where this data came from (optional).' },
    },
    {
      name: 'data',
      type: 'json',
      required: true,
      admin: {
        description: 'Array of row objects. Example: [{"month":"2024-01","value":123}, ...]',
      },
      validate: (val) =>
        Array.isArray(val) ? true : 'Dataset data must be an array of row objects',
    },
    {
      name: 'notes',
      type: 'textarea',
      required: false,
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && !data.slug && typeof data.title === 'string') {
          data.slug = slugify(data.title)
        }
        return data
      },
    ],
  },
}
