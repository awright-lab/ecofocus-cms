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
  ],
}
