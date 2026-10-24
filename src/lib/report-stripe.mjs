import { createHash } from 'node:crypto'

// Stable IDs let a failed database save be retried without duplicating products.
const hash = (value) => createHash('sha256').update(value).digest('hex').slice(0, 32)

export async function syncReportToStripe(report, { secret = process.env.STRIPE_SECRET_KEY, fetcher = fetch } = {}) {
  if (!secret) throw new Error('Set STRIPE_SECRET_KEY on the CMS before publishing paid reports.')
  if (!Number.isFinite(report.price) || report.price <= 0 || !Number.isSafeInteger(Math.round(report.price * 100))) {
    throw new Error('A paid report requires a positive USD price.')
  }
  const amount = Math.round(report.price * 100)
  if (Math.abs(report.price * 100 - amount) > 0.00001) throw new Error('Use at most two decimal places for the price.')
  if (amount < 50) throw new Error('Paid reports must cost at least $0.50 USD for card checkout. Use Free for a free download.')
  const request = async (path, method = 'GET', values, key) => {
    const response = await fetcher(`https://api.stripe.com/v1/${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${secret}`,
        ...(values ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
        ...(key ? { 'Idempotency-Key': key } : {}),
      },
      ...(values ? { body: new URLSearchParams(values).toString() } : {}),
    })
    const result = await response.json()
    if (!response.ok) {
      const error = new Error(result.error?.message || 'Stripe synchronization failed.')
      error.status = response.status
      throw error
    }
    return result
  }
  const productId = report.stripeProductId || `ecofocus_report_${hash(report.slug)}`
  let exists = true
  try { await request(`products/${productId}`) } catch (error) {
    if (error.status !== 404) throw error
    exists = false
  }
  const values = { name: report.title, description: report.description || '', active: 'true', 'metadata[ecofocus_report]': report.slug }
  if (exists) await request(`products/${productId}`, 'POST', values)
  else await request('products', 'POST', { id: productId, ...values }, `report-product-${hash(JSON.stringify({ productId, ...values }))}`)

  const lookup = `ecofocus_${hash(`${productId}:usd:${amount}`)}`
  const prices = await request(`prices?lookup_keys[]=${lookup}&limit=1`)
  let price = prices.data?.[0]
  if (price && (!price.active || price.unit_amount !== amount || price.currency !== 'usd' || price.product !== productId)) {
    throw new Error('The matching Stripe price is inactive or inconsistent. Contact an administrator.')
  }
  if (!price) price = await request('prices', 'POST', {
    product: productId, currency: 'usd', unit_amount: String(amount), lookup_key: lookup,
  }, `report-price-${lookup}`)
  await request(`products/${productId}`, 'POST', { default_price: price.id })
  return { stripeProductId: productId, priceId: price.id }
}
