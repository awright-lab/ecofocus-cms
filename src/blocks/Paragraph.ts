import type { Block } from 'payload'
import { lexicalEditor, LinkFeature, InlineToolbarFeature } from '@payloadcms/richtext-lexical'

/**
 * Paragraph block that stores content as Lexical rich text JSON
 * (includes Bold/Italic/Underline, headings, lists, links, etc.).
 */
export const Paragraph: Block = {
  slug: 'paragraph',
  labels: { singular: 'Paragraph', plural: 'Paragraphs' },
  fields: [
    {
      name: 'content',
      type: 'richText',
      required: true,
      admin: {
        description: 'Rich text paragraph (supports bold, italic, links, etc.)',
      },
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures, // includes Bold/Italic/Underline, etc.
          LinkFeature(), // optional: link support
          InlineToolbarFeature(), // optional: inline toolbar
        ],
      }),
    },
  ],
}
