import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: true, // Enable upload (cloud storage will override local)
  fields: [{ name: 'alt', type: 'text' }],
}
