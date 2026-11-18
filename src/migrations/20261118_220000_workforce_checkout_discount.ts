import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const secret = process.env.STRIPE_SECRET_KEY || ''
  if (!/^(sk|rk)_live_/.test(secret)) throw new Error('The checkout test requires the live Stripe key.')
  const request = async (path: string, values?: Record<string, string>) => {
    const response = await fetch(`https://api.stripe.com/v1/${path}`, {
      method: values ? 'POST' : 'GET',
      headers: { Authorization: `Bearer ${secret}`, 'Stripe-Version': '2025-03-31.basil', ...(values ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}) },
      ...(values ? { body: new URLSearchParams(values) } : {}),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(`Workforce test discount: ${data.error?.message || response.status}`)
    return data
  }
  const account = await request('account')
  if (account.id !== 'acct_1RE0IPCDE2vGnqXK' || !account.charges_enabled) throw new Error('The live EcoFocus account must be enabled.')
  const reports = await payload.find({ collection: 'reports', where: { slug: { equals: 'environmental-sustainability-and-the-workforce' } }, depth: 0, limit: 1, req })
  const report = reports.docs[0]
  if (report?._status !== 'published' || report.price !== 1495 || !report.stripeProductId) throw new Error('The approved report must be published first.')
  const couponID = 'workforce_live_checkout_test_20261118_v2'
  // Use the same API contract as the existing hosted checkout integration.
  const existing = await request(`coupons?limit=100`)
  let coupon = existing.data.find((item: { id: string }) => item.id === couponID)
  if (!coupon) coupon = await request('coupons', {
    id: couponID, amount_off: '149400', currency: 'usd', duration: 'once', max_redemptions: '5',
    redeem_by: String(Math.floor(Date.now() / 1000) + 72 * 3600),
    name: 'Workforce report — $1 checkout test',
    'applies_to[products][0]': report.stripeProductId,
    'metadata[purpose]': 'temporary-live-checkout-test-v2',
  })
  if (!coupon.valid || !coupon.applies_to?.products?.includes(report.stripeProductId)) throw new Error('The test coupon must be valid and restricted to the workforce report.')
  const promotions = await request(`promotion_codes?coupon=${encodeURIComponent(couponID)}&limit=1`)
  if (!promotions.data.length) await request('promotion_codes', {
    coupon: couponID, max_redemptions: '5', expires_at: String(coupon.redeem_by),
    'metadata[purpose]': 'temporary-live-checkout-test-v2',
  })
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Stripe retains transaction history; the test discount expires automatically.
}
