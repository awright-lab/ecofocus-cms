import { APIError, type CollectionConfig } from 'payload'
import { syncReportToStripe } from '../lib/report-stripe.mjs'

const editor = ({ req }: { req: { user?: unknown } }) => {
  const user = req.user as { collection?: string; role?: string } | undefined
  return user?.collection === 'users' && ['admin', 'editor'].includes(user.role || '')
}

export const Reports: CollectionConfig = {
  slug: 'reports',
  admin: { useAsTitle: 'title', group: 'Store', defaultColumns: ['title', 'access', 'price', '_status', 'updatedAt'] },
  versions: { drafts: true },
  access: {
    read: (args) => editor(args) || { _status: { equals: 'published' } },
    create: editor, update: editor, delete: editor,
    readVersions: editor,
  },
  hooks: {
    beforeChange: [async ({ data, originalDoc }) => {
      data = { ...originalDoc, ...data }
      // These IDs are managed exclusively by this hook, never by API callers.
      data.stripeProductId = originalDoc?.stripeProductId || null
      data.priceId = originalDoc?.priceId || null
      if (data._status !== 'published') return data
      if (!data.title || !data.slug || !data.description || !data.cover) {
        throw new APIError('Add a title, slug, description, and cover before publishing.', 400)
      }
      if (data.access === 'Premium') {
        if (!data.downloadFile) throw new APIError('Upload the paid report before publishing.', 400)
        try {
          Object.assign(data, await syncReportToStripe({ ...data, stripeProductId: originalDoc?.stripeProductId }))
          data.stripeSyncedAt = new Date().toISOString()
        } catch (error) {
          throw new APIError(`Report was not published: ${error instanceof Error ? error.message : 'Stripe sync failed.'}`, 400)
        }
      } else {
        data.price = 0
        data.priceId = null
        if (!data.freeHref) throw new APIError('Add the public download URL for this free report.', 400)
      }
      return data
    }],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true, admin: { description: 'URL identifier, for example consumer-sustainability-2026.' }, validate: (value: unknown) => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) || 'Use lowercase words separated by hyphens.' },
    { name: 'subtitle', type: 'text' },
    { name: 'description', type: 'textarea', required: true },
    { name: 'body', type: 'textarea', admin: { description: 'Detailed report overview.' } },
    { name: 'year', type: 'number', required: true, min: 2000, max: 2100 },
    { name: 'type', type: 'select', defaultValue: 'report', options: [{ label: 'Report', value: 'report' }, { label: 'Brief', value: 'brief' }, { label: 'Dataset', value: 'dataset' }] },
    { name: 'topic', type: 'text' },
    { name: 'tags', type: 'text', hasMany: true },
    { name: 'wave', type: 'text' },
    { name: 'pages', type: 'number', min: 1 },
    { name: 'format', type: 'text', defaultValue: 'PDF' },
    { name: 'cover', type: 'upload', relationTo: 'media', required: true },
    { name: 'access', type: 'select', required: true, defaultValue: 'Premium', options: ['Free', 'Premium'] },
    { name: 'price', type: 'number', min: 0, defaultValue: 0, admin: { description: 'USD, minimum 0.50 for paid reports (for example 2000.00). Stripe product and price are created automatically when published.', condition: (_, data) => data.access === 'Premium' } },
    { name: 'downloadFile', type: 'upload', relationTo: 'report-files', access: { read: editor }, admin: { description: 'Private paid file. Never upload paid reports to public Media.', condition: (_, data) => data.access === 'Premium' } },
    { name: 'freeHref', type: 'text', admin: { description: 'Public download URL for free reports only.', condition: (_, data) => data.access === 'Free' } },
    { name: 'sampleHref', type: 'text', admin: { description: 'Optional public sample URL.' } },
    { name: 'stripeProductId', type: 'text', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'priceId', type: 'text', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'stripeSyncedAt', type: 'date', admin: { readOnly: true, position: 'sidebar' } },
  ],
}
