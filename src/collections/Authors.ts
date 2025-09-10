import type { CollectionConfig } from 'payload'
import { slugify } from '../utils/slugify'

export const Authors: CollectionConfig = {
  slug: 'authors',
  labels: { singular: 'Author', plural: 'Authors' },
  admin: { useAsTitle: 'name' },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'title', type: 'text' },
    { name: 'bio', type: 'richText' },
    {
      name: 'headshot',
      type: 'relationship',
      relationTo: 'media',
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
    },
  ],
  hooks: {
    beforeValidate: [({ data }) => {
      if (!data) return data
      if (!data.slug && data.name) {
        data.slug = slugify(data.name)
      }
      return data
    }],
  },
}

