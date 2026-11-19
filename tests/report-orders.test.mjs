import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getStripeReportOrder, saveReportOrder, backfillReportOrders, reportOrderStaff } from '../src/lib/report-order-sync.mjs'

const session = { id: 'cs_live_fixture1234567890', status: 'complete', payment_status: 'paid', created: 1700000000, livemode: true, amount_total: 100, currency: 'usd', customer_details: { email: 'buyer@example.test', name: 'Test Buyer' }, metadata: { source: 'report-store', report_ids: '["2"]' }, payment_intent: { id: 'pi_fixture', latest_charge: { created: 1700000010, amount_refunded: 0 } }, total_details: { amount_discount: 149400, amount_tax: 0 } }
const line = { id: 'li_fixture', description: 'Workforce report', price: { id: 'price_fixture' }, quantity: 1, amount_total: 100, currency: 'usd' }
const requestFor = value => async path => path.includes('line_items') ? { data: [line], has_more: false } : value

test('only CMS admins and editors can access the private order records', () => {
  for (const user of [null, { collection: 'api-keys', role: 'admin' }, { collection: 'users', role: 'viewer' }]) assert.equal(reportOrderStaff({ user }), false)
  for (const role of ['admin', 'editor']) assert.equal(reportOrderStaff({ user: { collection: 'users', role } }), true)
})
test('only completed paid report-store sessions are recorded', async () => {
  for (const change of [{ status: 'open' }, { payment_status: 'unpaid' }, { metadata: { source: 'portal' } }, { metadata: { source: 'report-store', report_ids: '["bad"]' } }]) {
    await assert.rejects(getStripeReportOrder(session.id, requestFor({ ...session, ...change })))
  }
  await assert.rejects(getStripeReportOrder('invalid', requestFor(session)))
})
test('buyer, paid amount, discounts, and titles come from verified Stripe records', async () => {
  const order = await getStripeReportOrder(session.id, requestFor(session))
  assert.equal(order.buyerEmail, 'buyer@example.test')
  assert.equal(order.buyerName, 'Test Buyer')
  assert.equal(order.amountTotal, 100)
  assert.equal(order.paidTotal, '$1.00 USD')
  assert.equal(order.amountDiscount, 149400)
  assert.equal(order.paymentStatus, 'paid')
  assert.equal(order.reportsSummary, 'Workforce report (quantity 1)')
  assert.equal(order.stripeDashboardUrl, 'https://dashboard.stripe.com/payments/pi_fixture')
  assert.deepEqual(order.reportIds, ['2'])
  assert.equal('address' in order, false)
})
test('refund refresh uses the current Stripe charge and keeps the original amount paid', async () => {
  for (const [amount, state] of [[50, 'partially_refunded'], [100, 'refunded']]) {
    const order = await getStripeReportOrder(session.id, requestFor({ ...session, payment_intent: { ...session.payment_intent, latest_charge: { amount_refunded: amount } } }))
    assert.equal(order.paymentStatus, state)
    assert.equal(order.amountRefunded, amount)
    assert.equal(order.amountTotal, 100)
  }
})
test('line item pagination preserves every purchased report', async () => {
  let page = 0
  const order = await getStripeReportOrder(session.id, async path => {
    if (!path.includes('line_items')) return session
    page++
    return page === 1 ? { data: [line], has_more: true } : { data: [{ ...line, id: 'li_second', description: 'Second report' }], has_more: false }
  })
  assert.equal(order.lineItems.length, 2)
})
function fakeStore() {
  const docs = new Map(); let id = 0, creates = 0
  return { docs, get creates() { return creates },
    find: async ({ where }) => ({ docs: [...docs.values()].filter(x => x.stripeSessionId === where.stripeSessionId.equals) }),
    create: async ({ data }) => { if ([...docs.values()].some(x => x.stripeSessionId === data.stripeSessionId)) throw Error('unique violation'); const row = { ...data, id: ++id }; docs.set(row.id, row); creates++; return row },
    update: async ({ id, data }) => { const row = { ...data, id }; docs.set(id, row); return row },
  }
}
test('repeated and concurrent deliveries create one order per Stripe session', async () => {
  const payload = fakeStore(), data = await getStripeReportOrder(session.id, requestFor(session))
  await Promise.all([saveReportOrder(payload, data), saveReportOrder(payload, data)])
  await saveReportOrder(payload, data)
  assert.equal(payload.docs.size, 1)
  assert.equal(payload.creates, 1)
})
test('historical import skips unrelated/unpaid payments, paginates, and is repeatable', async () => {
  const payload = fakeStore()
  const request = async path => path.startsWith('checkout/sessions?')
    ? path.includes('starting_after') ? { data: [{ ...session, id: 'cs_live_second' }], has_more: false } : { data: [session, { ...session, id: 'cs_live_unpaid', payment_status: 'unpaid' }, { ...session, id: 'cs_live_portal', metadata: { source: 'portal' } }], has_more: true }
    : path.includes('line_items') ? { data: [line], has_more: false } : { ...session, id: path.split('/')[2].split('?')[0] }
  assert.equal(await backfillReportOrders(payload, request), 2)
  assert.equal(await backfillReportOrders(payload, request), 2)
  assert.equal(payload.docs.size, 2)
})

test('the CMS endpoint denies anonymous access and ignores caller-supplied buyer/payment data', async () => {
  const fs = await import('node:fs'), vm = await import('node:vm'), ts = (await import('typescript')).default
  const exports = {}, payload = fakeStore()
  payload.logger = { error() {} }
  const code = ts.transpileModule(fs.readFileSync(new URL('../src/collections/ReportOrders.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  vm.runInNewContext(code, { exports, Response, require: () => ({ getStripeReportOrder, saveReportOrder, reportOrderStaff, stripeRequest: () => requestFor(session) }) })
  const collection = exports.ReportOrders
  assert.equal(collection.access.create(), false)
  assert.equal(collection.access.update(), false)
  assert.equal(collection.access.delete(), false)
  assert.equal(collection.access.read({ req: { user: null } }), false)
  const endpoint = collection.endpoints[0].handler
  assert.equal((await endpoint({ user: null, json: () => assert.fail('Must authenticate first') })).status, 403)
  const response = await endpoint({ user: { collection: 'users', role: 'editor' }, payload, json: async () => ({ sessionId: session.id, buyerEmail: 'attacker@example.test', companyName: 'Spoofed company', amountTotal: 149500, paymentStatus: 'paid' }) })
  assert.equal(response.status, 200)
  assert.equal([...payload.docs.values()][0].buyerEmail, 'buyer@example.test')
  assert.equal([...payload.docs.values()][0].amountTotal, 100)
  assert.equal([...payload.docs.values()][0].companyName, null)
})

 test('company is taken only from the verified checkout field, with legacy orders left blank', async () => {
  const order = await getStripeReportOrder(session.id, requestFor({ ...session, custom_fields: [{ key: 'companyName', type: 'text', text: { value: '  Example Company  ' } }] }))
  assert.equal(order.companyName, 'Example Company')
  assert.equal((await getStripeReportOrder(session.id, requestFor(session))).companyName, null)
  assert.equal((await getStripeReportOrder(session.id, requestFor({ ...session, custom_fields: [{ key: 'other', type: 'text', text: { value: 'Unrelated' } }] }))).companyName, null)
 })

test('complimentary checkouts are recorded only after a zero-total payment-mode checkout completes', async () => {
 const free = { ...session, mode: 'payment', payment_status: 'no_payment_required', amount_total: 0, payment_intent: null };
 const order = await getStripeReportOrder(free.id, requestFor(free));
 assert.equal(order.amountTotal, 0);
 assert.equal(order.paidTotal, '$0.00 USD');
 assert.equal(order.stripePaymentIntentId, null);
 for (const change of [{ amount_total: 100 }, { amount_total: null }, { status: 'open' }, { mode: 'setup' }, { payment_status: 'unpaid' }]) await assert.rejects(getStripeReportOrder(free.id, requestFor({ ...free, ...change })));
});
