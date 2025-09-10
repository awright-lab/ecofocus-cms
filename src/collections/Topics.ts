import type { CollectionConfig } from 'payload'
import { slugify } from '../utils/slugify'

export const Topics: CollectionConfig = {
  slug: 'topics',
  labels: { singular: 'Topic', plural: 'Topics' },
  admin: { useAsTitle: 'label', group: 'Content' },
  access: { read: () => true },
  fields: [
    { name: 'label', type: 'text', required: true, unique: true, admin: { description: 'The tag shown to readers, e.g. “Sustainability”.' } },
    { name: 'slug', type: 'text', unique: true, index: true, admin: { description: 'URL-friendly identifier; auto-generated from the label.' } },
  ],
  hooks: {
    beforeValidate: [({ data }) => {
      if (!data) return data
      if (!data.slug && data.label) data.slug = slugify(data.label)
      return data
    }],
  },
}
