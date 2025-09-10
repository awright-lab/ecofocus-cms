import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true, // ✅ Allow public read
  },
  upload: {
    mimeTypes: ['image/*', 'video/*'], // Optional filter for allowed uploads
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'altText',
      type: 'text',
      admin: { description: 'Alias of alt for frontend compatibility' },
    },
  ],
  hooks: {
    beforeValidate: [({ data }) => {
      if (!data) return data
      // Keep alt and altText in sync
      if (data.alt && !data.altText) data.altText = data.alt
      if (data.altText && !data.alt) data.alt = data.altText
      return data
    }],
  },
}
