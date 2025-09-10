import type { CollectionConfig } from 'payload'
import { slugify } from '../utils/slugify'

export const Authors: CollectionConfig = {
  slug: 'authors',
  labels: { singular: 'Author', plural: 'Authors' },
  admin: { useAsTitle: 'name', group: 'Content' },
  access: {
    read: () => true,
    create: ({ req }) => ['admin', 'editor'].includes(((req.user as any)?.role)),
    update: ({ req }) => ['admin', 'editor'].includes(((req.user as any)?.role)),
    delete: ({ req }) => ((req.user as any)?.role) === 'admin',
  },
  fields: [
    { name: 'name', type: 'text', required: true, admin: { description: 'Full name, e.g. “Jane Doe”.' } },
    { name: 'title', type: 'text', admin: { description: 'Author’s role or byline, e.g. “Senior Analyst”.' } },
    { name: 'bio', type: 'richText', admin: { description: 'Short bio shown on author pages.' } },
    {
      name: 'headshot',
      type: 'relationship',
      relationTo: 'media',
      admin: { description: 'Upload a square image if possible.' },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: { description: 'URL-friendly identifier; auto-generated from the name.' },
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
