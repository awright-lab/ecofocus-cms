import type { Access, CollectionConfig, PayloadRequest } from 'payload'

import { Paragraph } from '../blocks/Paragraph'
import { ImageBlock } from '../blocks/ImageBlock'
import { PullQuote } from '../blocks/PullQuote'
import { KeyTakeaways } from '../blocks/KeyTakeaways'
import { CTAGroup } from '../blocks/CTAGroup'
import { ChartJS } from '../blocks/ChartJS'

import { slugify } from '../utils/slugify'
import { verifyPreviewToken } from '../utils/previewToken'
import { calculateReadTimeMinutes } from '../utils/readTime'

// -----------------------------
// Collection
// -----------------------------

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Post', plural: 'Posts' },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'status', 'publishedAt'],
  },

  access: {
    // Public can read published posts; drafts allowed with preview token or auth
    read: (async ({ req }) => {
      const user = (req as PayloadRequest).user
      if (user) return true
      if (verifyPreviewToken(req as PayloadRequest)) return true
      return {
        or: [{ status: { equals: 'published' } }],
      }
    }) as Access,
  },

  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'Headline for the article.' },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: { description: 'URL-friendly identifier; auto-generated from the title.' },
    },
    {
      name: 'dek',
      type: 'textarea',
      admin: { description: '1–2 sentence summary shown on lists and social.' },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'authors' as unknown as import('payload').CollectionSlug,
      required: true,
    },
    {
      name: 'topics',
      type: 'relationship',
      relationTo: 'topics' as unknown as import('payload').CollectionSlug,
      hasMany: true,
      admin: { description: 'Pick 1–3 topics to help readers find this post.' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
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
      blocks: [Paragraph, ImageBlock, PullQuote, KeyTakeaways, CTAGroup, ChartJS],
      admin: {
        description:
          'Write your article content with paragraphs, images, quotes, charts, and calls to action.',
      },
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          admin: { description: 'Custom title for search and social (optional).' },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          admin: { description: 'Short description for search and social (optional).' },
        },
        {
          name: 'ogImage',
          type: 'relationship',
          relationTo: 'media',
          admin: { description: 'Override social image (optional).' },
        },
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
    beforeValidate: [
      ({ data }) => {
        if (!data) return data
        if (!data.slug && typeof data.title === 'string') {
          data.slug = slugify(data.title)
        }
        return data
      },
    ],
    beforeChange: [
      ({ data }) => {
        if (!data) return data
        data.readTime = calculateReadTimeMinutes({
          dek: typeof data.dek === 'string' ? data.dek : undefined,
          body: Array.isArray(data.body) ? data.body : [],
        })
        return data
      },
    ],
    afterChange: [
      async ({ doc }) => {
        try {
          if (doc?.status === 'published') {
            const url = process.env.FRONTEND_REVALIDATE_URL
            const secret = process.env.REVALIDATE_SECRET
            if (url && secret && doc.slug) {
              const u = new URL(url)
              if (!u.searchParams.get('secret')) u.searchParams.set('secret', secret)
              const payload = {
                slug: String(doc.slug),
                type: 'post' as const,
                path: `/posts/${String(doc.slug)}`,
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
                console.warn('Revalidate webhook failed', {
                  status: res?.status,
                  url: u.toString(),
                })
              }
            } else {
              console.warn('Missing FRONTEND_REVALIDATE_URL or REVALIDATE_SECRET; skip revalidate')
            }
          }
        } catch (e) {
          console.warn('Error in posts.afterChange revalidate', e)
        }
      },
    ],
  },
}
