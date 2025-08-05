import type { CollectionConfig } from 'payload'
import crypto from 'crypto'

export const ApiKeys: CollectionConfig = {
  slug: 'api-keys',
  admin: {
    useAsTitle: 'label',
    group: 'Settings',
  },
  access: {
    read: () => true, // or restrict to admins
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
    },
    {
      name: 'key',
      type: 'text',
      admin: {
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          async ({ value }) => {
            return value || crypto.randomBytes(32).toString('hex')
          },
        ],
      },
    },
  ],
}
