// Stripe is the authority; callers supply only a Checkout Session ID.
export function reportOrderStaff(req) {
  return req.user?.collection === 'users' && ['admin', 'editor'].includes(req.user.role)
}

export function stripeRequest({ secret = process.env.STRIPE_SECRET_KEY, fetcher = fetch } = {}) {
  if (!secret) throw new Error('Stripe is not configured for report orders.')
  return async (path) => {
    const response = await fetcher(`https://api.stripe.com/v1/${path}`, {
      headers: { Authorization: `Bearer ${secret}` }, signal: AbortSignal.timeout(15000),
    })
    if (!response.ok) throw new Error(`Report order verification failed (${response.status}).`)
    return response.json()
  }
}

export async function getStripeReportOrder(sessionId, request) {
  if (typeof sessionId !== 'string' || !/^cs_(test_|live_)?[a-zA-Z0-9]+$/.test(sessionId)) throw new Error('Invalid checkout session.')
  const session = await request(`checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=payment_intent.latest_charge`)
  if (session.metadata?.source !== 'report-store' || session.status !== 'complete' || session.payment_status !== 'paid') {
    throw new Error('Only confirmed paid report orders can be recorded.')
  }
  const ids = JSON.parse(session.metadata.report_ids || '[]')
  if (!Array.isArray(ids) || !ids.length || ids.some(id => typeof id !== 'string' || !/^\d+$/.test(id))) throw new Error('Invalid purchased report references.')
  const lines = []
  let after = ''
  do {
    const page = await request(`checkout/sessions/${encodeURIComponent(sessionId)}/line_items?limit=100${after ? `&starting_after=${encodeURIComponent(after)}` : ''}`)
    lines.push(...page.data)
    after = page.has_more ? page.data.at(-1)?.id : ''
    if (page.has_more && !after) throw new Error('Incomplete report order line items.')
  } while (after)
  if (!lines.length || !Number.isSafeInteger(session.amount_total) || session.amount_total < 0) throw new Error('Invalid paid report order.')
  const intent = typeof session.payment_intent === 'object' ? session.payment_intent : null
  const charge = typeof intent?.latest_charge === 'object' ? intent.latest_charge : null
  const refunded = charge?.amount_refunded || 0
  const currency = String(session.currency || 'usd').toLowerCase()
  const format = amount => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100)
  return {
    orderReference: `EF-${session.id.slice(-10).toUpperCase()}`,
    stripeSessionId: session.id,
    stripePaymentIntentId: intent?.id || (typeof session.payment_intent === 'string' ? session.payment_intent : null),
    stripeCustomerId: typeof session.customer === 'string' ? session.customer : session.customer?.id || null,
    stripeDashboardUrl: `https://dashboard.stripe.com/${session.livemode ? '' : 'test/'}${intent?.id ? `payments/${intent.id}` : `checkout/sessions/${session.id}`}`,
    buyerName: session.customer_details?.name || '',
    buyerEmail: session.customer_details?.email || session.customer_email || null,
    orderDate: new Date((charge?.created || session.created) * 1000).toISOString(),
    paymentStatus: refunded > 0 ? refunded >= session.amount_total ? 'refunded' : 'partially_refunded' : 'paid',
    paidTotal: `${format(session.amount_total)} ${currency.toUpperCase()}`,
    amountTotal: session.amount_total,
    amountTax: session.total_details?.amount_tax || 0,
    amountDiscount: session.total_details?.amount_discount || 0,
    amountRefunded: refunded,
    currency,
    livemode: Boolean(session.livemode),
    reportIds: [...new Set(ids)],
    reportsSummary: lines.map(line => `${line.description || 'EcoFocus report'} (quantity ${line.quantity || 1})`).join('\n'),
    lineItems: lines.map(line => ({ title: line.description || 'EcoFocus report', quantity: line.quantity || 1, priceId: typeof line.price === 'string' ? line.price : line.price?.id || '', amountTotal: line.amount_total, currency: line.currency || currency })),
    lastSyncedAt: new Date().toISOString(),
  }
}

export async function saveReportOrder(payload, data, req) {
  const find = () => payload.find({ collection: 'report-orders', where: { stripeSessionId: { equals: data.stripeSessionId } }, depth: 0, limit: 1, ...(req ? { req } : {}) })
  const existing = (await find()).docs[0]
  if (existing) return payload.update({ collection: 'report-orders', id: existing.id, data, ...(req ? { req } : {}) })
  try {
    return await payload.create({ collection: 'report-orders', data, ...(req ? { req } : {}) })
  } catch (error) {
    // A concurrent delivery may have won the unique-index race. Runtime writes
    // use separate Local API transactions, so the losing write is rolled back.
    if (req) throw error
    const winner = (await find()).docs[0]
    if (!winner) throw error
    return payload.update({ collection: 'report-orders', id: winner.id, data })
  }
}

export async function backfillReportOrders(payload, request, req) {
  let after = '', count = 0
  do {
    const page = await request(`checkout/sessions?status=complete&limit=100${after ? `&starting_after=${encodeURIComponent(after)}` : ''}`)
    for (const session of page.data) {
      if (session.metadata?.source !== 'report-store' || session.payment_status !== 'paid') continue
      await saveReportOrder(payload, await getStripeReportOrder(session.id, request), req)
      count++
    }
    after = page.has_more ? page.data.at(-1)?.id : ''
    if (page.has_more && !after) throw new Error('Incomplete historical checkout list.')
  } while (after)
  return count
}
