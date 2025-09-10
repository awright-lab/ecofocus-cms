import type { Block } from 'payload'

export const KeyTakeaways: Block = {
  slug: 'keyTakeaways',
  interfaceName: 'KeyTakeawaysBlock',
  fields: [
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
  labels: {
    singular: 'Key Takeaway',
    plural: 'Key Takeaways',
  },
}

