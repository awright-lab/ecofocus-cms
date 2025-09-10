import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    read: ({ req }) => ((req.user as any)?.role) === 'admin',
    create: ({ req }) => ((req.user as any)?.role) === 'admin',
    update: ({ req }) => ((req.user as any)?.role) === 'admin',
    delete: ({ req }) => ((req.user as any)?.role) === 'admin',
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      required: true,
      admin: {
        description: 'Admins can manage all settings and users. Editors manage content and media only.',
      },
    },
  ],
}
