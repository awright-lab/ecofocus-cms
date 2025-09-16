import type { Access, CollectionConfig, PayloadRequest } from 'payload'

import { Paragraph } from '../blocks/Paragraph'
import { ImageBlock } from '../blocks/ImageBlock'
import { PullQuote } from '../blocks/PullQuote'
import { KeyTakeaways } from '../blocks/KeyTakeaways'
import { CTAGroup } from '../blocks/CTAGroup'
import { ChartJS } from '../blocks/ChartJS'

import { slugify } from '../utils/slugify'
import { verifyPreviewToken } from '../utils/previewToken'

// -----------------------------
// Helpers (no any)
// -----------------------------

const countWords = (text?: string | null): number => {
  if (!text) return 0
  return (text.trim().match(/\b\w+\b/g) || []).length
}

// Narrow runtime-checked shapes for the blocks we care about.
type BaseBlock = { blockType?: string | null } & Record<string, unknown>

type ParagraphBlock = BaseBlock & {
  blockType: 'paragraph'
  content?: string | null
}

type ImageCaptionBlock = BaseBlock & {
  blockType: 'imageBlock'
  caption?: string | null
}

type PullQuoteBlock = BaseBlock & {
  blockType: 'pullQuote'
  quote?: string | null
  attribution?: string | null
}

type KeyTakeawaysBlock = BaseBlock & {
  blockType: 'keyTakeaways'
  items?: { text?: string | null }[] | null
}

type CTAGroupBlock = BaseBlock & {
  blockType: 'ctaGroup'
  ctas?: { label?: string | null }[] | null
}

type ChartJSBlock = BaseBlock & {
  blockType: 'chartJS'
  caption?: string | null
}

type KnownBlocks =
  | ParagraphBlock
  | ImageCaptionBlock
  | PullQuoteBlock
  | KeyTakeawaysBlock
  | CTAGroupBlock
  | ChartJSBlock

function isKnownBlock(b: unknown): b is KnownBlocks {
  return (
    typeof b === 'object' &&
    b !== null &&
    'blockType' in (b as Record<string, unknown>) &&
    typeof (b as Record<string, unknown>).blockType === 'string'
  )
}

const extractBlockText = (blocks: unknown[]): string => {
  const parts: string[] = []
  for (const raw of blocks || []) {
    if (!isKnownBlock(raw)) continue
    switch (raw.blockType) {
      case 'paragraph': {
        const content = (raw as ParagraphBlock).content
        if (typeof content === 'string' && content.trim()) parts.push(content)
        break
      }
      case 'imageBlock': {
        const caption = (raw as ImageCaptionBlock).caption
        if (typeof caption === 'string' && caption.trim()) parts.push(caption)
        break
      }
      case 'pullQuote': {
        const { quote, attribution } = raw as PullQuoteBlock
        if (typeof quote === 'string' && quote.trim()) parts.push(quote)
        if (typeof attribution === 'string' && attribution.trim()) parts.push(attribution)
        break
      }
      case 'keyTakeaways': {
        const items = (raw as KeyTakeawaysBlock).items || []
        if (Array.isArray(items) && items.length) {
          parts.push(
            items
              .map((i) => (typeof i?.text === 'string' ? i.text : ''))
              .filter(Boolean)
              .join(' '),
          )
        }
        break
      }
      case 'ctaGroup': {
        const ctas = (raw as CTAGroupBlock).ctas || []
        if (Array.isArray(ctas) && ctas.length) {
          parts.push(
            ctas
              .map((c) => (typeof c?.label === 'string' ? c.label : ''))
              .filter(Boolean)
              .join(' '),
          )
        }
        break
      }
      case 'chartJS': {
        const caption = (raw as ChartJSBlock).caption
        if (typeof caption === 'string' && caption.trim()) parts.push(caption)
        break
      }
      default:
        break
    }
  }
  return parts.join(' ')
}

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
        const bodyBlocks: unknown[] = Array.isArray(data.body) ? data.body : []
        const words =
          countWords(typeof data.dek === 'string' ? data.dek : undefined) +
          countWords(extractBlockText(bodyBlocks))
        data.readTime = Math.max(1, Math.ceil(words / 200)) // 200 wpm
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
