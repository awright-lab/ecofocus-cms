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
  admin: { useAsTitle: 'title', group: 'Content', defaultColumns: ['title', 'status', 'publishedAt'] },
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
    { name: 'title', type: 'text', required: true, admin: { description: 'Headline for the article.' } },
    { name: 'slug', type: 'text', unique: true, index: true, admin: { description: 'URL-friendly identifier; auto-generated from the title.' } },
    { name: 'dek', type: 'textarea', admin: { description: '1–2 sentence summary shown on lists and social.' } },
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
      admin: { description: 'Pick 1–3 topics to help readers find this post.' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      defaultValue: () => new Date(),
      admin: { description: 'Publication date; defaults to now.' },
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
      admin: { description: 'Lead image for the article.' },
    },
    {
      name: 'body',
      type: 'blocks',
      blocks: [Paragraph, ImageBlock, PullQuote, KeyTakeaways, CTAGroup],
      admin: { description: 'Write your article content with paragraphs, images, quotes, and calls to action.' },
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'metaTitle', type: 'text', admin: { description: 'Custom title for search and social (optional).' } },
        { name: 'metaDescription', type: 'textarea', admin: { description: 'Short description for search and social (optional).' } },
        { name: 'ogImage', type: 'relationship', relationTo: 'media', admin: { description: 'Override social image (optional).' } },
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
    afterChange: [async ({ doc, req }) => {
      try {
        if (doc?.status === 'published') {
          const url = process.env.FRONTEND_REVALIDATE_URL
          const secret = process.env.REVALIDATE_SECRET
          if (url && secret && doc.slug) {
            const u = new URL(url)
            // also pass secret in query for handlers that expect it
            if (!u.searchParams.get('secret')) u.searchParams.set('secret', secret)
            const payload = {
              slug: doc.slug,
              type: 'post',
              path: `/posts/${doc.slug}`,
              secret,
            }
            const res = await fetch(u.toString(), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-secret': secret,
              },
              body: JSON.stringify(payload),
            }).catch(() => undefined)
            if (!res || !res.ok) {
              console.warn('Revalidate webhook failed', { status: res?.status, url: u.toString() })
            }
          } else {
            console.warn('Missing FRONTEND_REVALIDATE_URL or REVALIDATE_SECRET; skip revalidate')
          }
        }
      } catch (e) {
        console.warn('Error in posts.afterChange revalidate', e)
      }
    }],
  },
}
