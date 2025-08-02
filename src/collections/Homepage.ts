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
      required: true,
    },
  ],
}

export default Homepage
