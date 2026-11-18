import type { CollectionConfig } from 'payload'
import { getStripeReportOrder, reportOrderStaff, saveReportOrder, stripeRequest } from '../lib/report-order-sync.mjs'

export const ReportOrders: CollectionConfig = {
  slug: 'report-orders',
  labels: { singular: 'Report Order', plural: 'Report Orders' },
  admin: {
    useAsTitle: 'orderReference', group: 'Reports & Sales',
    defaultColumns: ['orderReference', 'buyerName', 'companyName', 'buyerEmail', 'reportsSummary', 'paidTotal', 'paymentStatus', 'orderDate', 'livemode', 'stripeDashboardUrl'],
    description: 'Verified Stripe report purchases. Read-only payment records; manage payments and refunds in Stripe. These buyers are not subscribed to marketing.',
    hidden: ({ user }) => !['admin', 'editor'].includes(String(user?.role)),
  },
  defaultSort: '-orderDate',
  lockDocuments: false,
  access: { read: ({ req }) => reportOrderStaff(req), create: () => false, update: () => false, delete: () => false },
  endpoints: [{ path: '/sync', method: 'post', handler: async req => {
    if (!reportOrderStaff(req)) return Response.json({ error: 'Unauthorized' }, { status: 403 })
    let sessionId: unknown
    try { sessionId = (await req.json!()).sessionId } catch { return Response.json({ error: 'Invalid request' }, { status: 400 }) }
    if (typeof sessionId !== 'string' || !/^cs_(test_|live_)?[a-zA-Z0-9]+$/.test(sessionId)) return Response.json({ error: 'Invalid checkout session' }, { status: 400 })
    try {
      const data = await getStripeReportOrder(sessionId, stripeRequest())
      const order = await saveReportOrder(req.payload, data)
      return Response.json({ recorded: true, id: order.id }, { headers: { 'Cache-Control': 'no-store' } })
    } catch {
      req.payload.logger.error('Report order sync failed; retry the verified checkout session.')
      return Response.json({ error: 'Could not verify and record this report order.' }, { status: 503 })
    }
  } }],
  fields: [
    { name: 'orderReference', type: 'text', required: true, index: true, admin: { readOnly: true } },
    { name: 'buyerName', type: 'text', admin: { readOnly: true } },
    { name: 'companyName', type: 'text', index: true, admin: { readOnly: true, description: 'Company supplied at checkout. Older orders may not include this information.' } },
    { name: 'buyerEmail', type: 'email', index: true, admin: { readOnly: true } },
    { name: 'reportsSummary', type: 'textarea', label: 'Reports purchased', admin: { readOnly: true } },
    { name: 'paidTotal', type: 'text', label: 'Amount paid', required: true, admin: { readOnly: true } },
    { name: 'paymentStatus', type: 'select', required: true, options: [{ label: 'Paid', value: 'paid' }, { label: 'Partially refunded', value: 'partially_refunded' }, { label: 'Refunded', value: 'refunded' }], admin: { readOnly: true } },
    { name: 'orderDate', type: 'date', required: true, index: true, admin: { readOnly: true, description: 'Stripe payment charge date, or checkout creation date if unavailable.', date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'livemode', type: 'checkbox', label: 'Live payment', required: true, admin: { readOnly: true } },
    { name: 'stripeDashboardUrl', type: 'text', label: 'View in Stripe', required: true, admin: { readOnly: true, components: { Cell: { path: 'src/ui/admin/StripeOrderLink.tsx', exportName: 'StripeOrderLinkCell' }, Field: { path: 'src/ui/admin/StripeOrderLink.tsx', exportName: 'StripeOrderLinkField' } } } },
    { name: 'stripeSessionId', type: 'text', required: true, unique: true, admin: { readOnly: true, description: 'Unique checkout reference. Keep private.' } },
    { name: 'stripePaymentIntentId', type: 'text', index: true, admin: { readOnly: true } },
    { name: 'stripeCustomerId', type: 'text', admin: { readOnly: true } },
    { name: 'currency', type: 'text', required: true, admin: { readOnly: true } },
    ...['amountTotal', 'amountTax', 'amountDiscount', 'amountRefunded'].map(name => ({ name, type: 'number' as const, min: 0, required: true, admin: { readOnly: true, description: 'Minor currency units (cents for USD).' } })),
    { name: 'reportIds', type: 'json', required: true, admin: { readOnly: true } },
    { name: 'lineItems', type: 'json', required: true, admin: { readOnly: true } },
    { name: 'lastSyncedAt', type: 'date', required: true, admin: { readOnly: true } },
  ],
}
