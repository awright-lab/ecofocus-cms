import type { CollectionConfig, PayloadRequest } from 'payload'
import { Paragraph } from '../blocks/Paragraph'
import { ImageBlock } from '../blocks/ImageBlock'
import { PullQuote } from '../blocks/PullQuote'
import { KeyTakeaways } from '../blocks/KeyTakeaways'
import { CTAGroup } from '../blocks/CTAGroup'
import { slugify } from '../utils/slugify'
import { verifyPreviewToken } from '../utils/previewToken'

const countWords = (text?: string): number => {
  if (!text) return 0
  return (text.trim().match(/\b\w+\b/g) || []).length
}

const extractBlockText = (blocks: any[]): string => {
  const parts: string[] = []
  for (const b of blocks || []) {
    switch (b.blockType) {
      case 'paragraph':
        // lexical richText stores JSON; fall back to plaintext if present
        if (typeof b.content === 'string') parts.push(b.content)
        break
      case 'imageBlock':
        if (b.caption) parts.push(b.caption)
        break
      case 'pullQuote':
        if (b.quote) parts.push(b.quote)
        if (b.attribution) parts.push(b.attribution)
        break
      case 'keyTakeaways':
        if (Array.isArray(b.items)) parts.push(b.items.map((i: any) => i?.text || '').join(' '))
        break
      case 'ctaGroup':
        if (Array.isArray(b.ctas)) parts.push(b.ctas.map((c: any) => c?.label || '').join(' '))
        break
      default:
        break
    }
  }
  return parts.join(' ')
}

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Post', plural: 'Posts' },
  admin: { useAsTitle: 'title' },
  access: {
    read: async ({ req }) => {
      // Public can read published posts; drafts allowed with preview token or auth
      if (req.user) return true
      if (verifyPreviewToken(req as PayloadRequest)) return true
      return {
        or: [
          { status: { equals: 'published' } },
        ],
      }
    },
  },
  // Using explicit status field and preview-token access instead of versions/drafts
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', unique: true, index: true },
    { name: 'dek', type: 'textarea' },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'authors' as unknown as any,
      required: true,
    },
    {
      name: 'topics',
      type: 'relationship',
      relationTo: 'topics' as unknown as any,
      hasMany: true,
    },
    {
      name: 'publishedAt',
      type: 'date',
      defaultValue: () => new Date(),
    },
    {
      name: 'readTime',
      type: 'number',
      admin: { readOnly: true },
    },
    {
      name: 'heroImage',
      type: 'relationship',
      relationTo: 'media',
    },
    {
      name: 'body',
      type: 'blocks',
      blocks: [Paragraph, ImageBlock, PullQuote, KeyTakeaways, CTAGroup],
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'metaTitle', type: 'text' },
        { name: 'metaDescription', type: 'textarea' },
        { name: 'ogImage', type: 'relationship', relationTo: 'media' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
  hooks: {
    beforeValidate: [({ data }) => {
      if (!data) return data
      if (!data.slug && data.title) data.slug = slugify(data.title)
      return data
    }],
    beforeChange: [({ data }) => {
      if (!data) return data
      const words = countWords(data.dek) + countWords(extractBlockText(data.body || []))
      data.readTime = Math.max(1, Math.ceil(words / 200))
      return data
    }],
    afterChange: [async ({ doc }) => {
      try {
        if (doc?.status === 'published') {
          const url = process.env.FRONTEND_REVALIDATE_URL
          const secret = process.env.REVALIDATE_SECRET
          if (url && secret) {
            await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-secret': secret,
              },
              body: JSON.stringify({ slug: doc.slug }),
            }).catch(() => {})
          }
        }
      } catch {}
    }],
  },
}
