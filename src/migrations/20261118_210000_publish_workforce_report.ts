import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const secret = process.env.STRIPE_SECRET_KEY || ''
  if (!/^(sk|rk)_live_/.test(secret)) throw new Error('Workforce publication requires a live Stripe key.')
  const response = await fetch('https://api.stripe.com/v1/account', { headers: { Authorization: `Bearer ${secret}` } })
  const account = await response.json()
  if (!response.ok || account.id !== 'acct_1RE0IPCDE2vGnqXK' || !account.charges_enabled) {
    throw new Error('Verify the live EcoFocus Stripe account and payment capability before publishing.')
  }
  const result = await payload.find({ collection: 'reports', where: { slug: { equals: 'environmental-sustainability-and-the-workforce' } }, draft: true, depth: 0, limit: 1, req })
  const report = result.docs[0]
  if (!report || report.price !== 1495 || report.pages !== 65 || report.downloadFile !== 2 || report.cover !== 395) {
    throw new Error('The approved workforce report, price, cover, and private PDF must be staged before publication.')
  }
  if (report._status === 'published') return
  // Publishing through Payload runs the normal product/price synchronization hook.
  await payload.update({ collection: 'reports', id: report.id, data: { _status: 'published' }, draft: false, req })
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Preserve published orders and subsequent editorial changes.
}
