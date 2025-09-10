import type { CollectionConfig } from 'payload'
import { slugify } from '../utils/slugify'

export const Topics: CollectionConfig = {
  slug: 'topics',
  labels: { singular: 'Topic', plural: 'Topics' },
  admin: { useAsTitle: 'label' },
  access: { read: () => true },
  fields: [
    { name: 'label', type: 'text', required: true, unique: true },
    { name: 'slug', type: 'text', unique: true, index: true },
  ],
  hooks: {
    beforeValidate: [({ data }) => {
      if (!data) return data
      if (!data.slug && data.label) data.slug = slugify(data.label)
      return data
    }],
  },
}

