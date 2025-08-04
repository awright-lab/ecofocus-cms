import type { CollectionConfig } from 'payload'

export const TrustedBy: CollectionConfig = {
  slug: 'trusted-by',
  labels: {
    singular: 'Trusted By',
    plural: 'Trusted By Sections',
  },
  admin: {
    useAsTitle: 'id',
    group: 'Homepage',
  },
  fields: [
    {
      name: 'logos',
      type: 'array',
      label: 'Partner Logos',
      fields: [{ name: 'logo', type: 'upload', relationTo: 'media' }],
    },
  ],
}
