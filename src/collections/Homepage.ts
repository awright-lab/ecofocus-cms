import { CollectionConfig } from 'payload'

const Homepage: CollectionConfig = {
  slug: 'homepage',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true, // Public
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Page Title',
      required: true,
    },
    // Hero Section
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
    // Quick Stats
    {
      name: 'quickStats',
      type: 'array',
      label: 'Quick Stats',
      fields: [
        { name: 'value', type: 'text', required: true },
        { name: 'description', type: 'text', required: true },
      ],
    },
    // Featured Report
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
    // Solutions / Dashboard Section
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
    // EcoNugget Insights (Dynamic via Posts Collection)
    {
      name: 'ecoNuggetsHeading',
      type: 'text',
      label: 'EcoNuggets Section Heading',
    },
    // Why Choose EcoFocus
    {
      name: 'whyChoose',
      type: 'array',
      label: 'Why Choose EcoFocus',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
      ],
    },
    // Trusted Partners
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
    // CTA Banner
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
