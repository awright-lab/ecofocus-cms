import type { CollectionConfig } from 'payload'

export const Homepage: CollectionConfig = {
  slug: 'homepage',
  labels: {
    singular: 'Homepage',
    plural: 'Homepages',
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
      required: true,
    },
  ],
}
