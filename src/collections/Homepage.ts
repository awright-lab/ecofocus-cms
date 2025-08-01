import { CollectionConfig } from 'payload'

const Homepage: CollectionConfig = {
  slug: 'homepage',
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
      label: 'Page Title',
      required: true,
    },
    {
      name: 'hero',
      type: 'group',
      label: 'Hero Section',
      fields: [
        { name: 'headline', type: 'text', required: true },
        { name: 'subheadline', type: 'textarea' },
        {
          name: 'backgroundVideo',
          type: 'upload',
          relationTo: 'media',
          label: 'Hero Background Video',
        },
        {
          name: 'backgroundImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Hero Background Image',
        },
        {
          name: 'ctaButtons',
          type: 'array',
          label: 'Hero CTAs',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'url', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      name: 'quickStats',
      type: 'array',
      label: 'Quick Stats',
      fields: [
        { name: 'value', type: 'text', required: true },
        { name: 'description', type: 'text', required: true },
      ],
    },
    {
      name: 'featuredReport',
      type: 'group',
      label: 'Featured Report',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'price', type: 'text' },
        { name: 'ctaLabel', type: 'text' },
        { name: 'ctaUrl', type: 'text' },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'solutions',
      type: 'group',
      label: 'Solutions Section',
      fields: [
        { name: 'headline', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'ctaLabel', type: 'text' },
        { name: 'ctaUrl', type: 'text' },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'ecoNuggetsHeading',
      type: 'text',
      label: 'EcoNuggets Section Heading',
    },
    {
      name: 'whyChoose',
      type: 'array',
      label: 'Why Choose EcoFocus',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
      ],
    },
    {
      name: 'trustedPartners',
      type: 'array',
      label: 'Trusted Partners',
      fields: [
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'ctaBanner',
      type: 'group',
      label: 'CTA Banner',
      fields: [
        { name: 'text', type: 'text' },
        { name: 'buttonLabel', type: 'text' },
        { name: 'buttonUrl', type: 'text' },
      ],
    },
  ],
}

export default Homepage
