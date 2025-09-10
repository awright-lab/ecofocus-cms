import type { Block } from 'payload'

export const CTAGroup: Block = {
  slug: 'ctaGroup',
  interfaceName: 'CTAGroupBlock',
  fields: [
    {
      name: 'ctas',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
        { name: 'style', type: 'select', options: ['primary', 'secondary'], defaultValue: 'primary' },
      ],
    },
  ],
  labels: {
    singular: 'CTA Group',
    plural: 'CTA Groups',
  },
}

