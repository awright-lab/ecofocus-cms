import { test } from 'node:test'
import assert from 'node:assert/strict'
import { syncReportToStripe } from '../src/lib/report-stripe.mjs'

const report = { slug: 'consumer-2026', title: 'Consumer 2026', description: 'Research', price: 2000 }
function stripe() {
  const products = new Map(), prices = new Map(), calls = []
  let priceCount = 0
  return { calls, products, prices, fetcher: async (url, init) => {
    const path = new URL(url).pathname.replace('/v1/', '')
    const params = new URLSearchParams(init.body)
    calls.push({ path, method: init.method, params, headers: init.headers })
    let result
    if (init.method === 'GET' && path.startsWith('products/')) {
      result = products.get(path.split('/')[1])
      if (!result) return { ok: false, status: 404, json: async () => ({ error: { message: 'Missing' } }) }
    } else if (path === 'products') { result = { id: params.get('id') }; products.set(result.id, result) }
    else if (path.startsWith('products/')) result = products.get(path.split('/')[1])
    else if (init.method === 'GET') result = { data: [...prices.values()].filter(p => p.lookup_key === new URL(url).searchParams.get('lookup_keys[]')) }
    else { result = { id: `price_${++priceCount}`, active: true, product: params.get('product'), currency: params.get('currency'), unit_amount: Number(params.get('unit_amount')), lookup_key: params.get('lookup_key') }; prices.set(result.id, result) }
    return { ok: true, status: 200, json: async () => result }
  } }
}
test('publishing creates a product and correct one-time USD price', async () => {
  const fake = stripe()
  const result = await syncReportToStripe(report, { secret: 'test', fetcher: fake.fetcher })
  assert.equal(result.priceId, 'price_1')
  assert.equal(fake.prices.get('price_1').unit_amount, 200000)
  assert.ok(fake.calls.find(c => c.path === 'products').headers['Idempotency-Key'])
})
test('retries reuse the product and price; changed amount preserves old price', async () => {
  const fake = stripe(), options = { secret: 'test', fetcher: fake.fetcher }
  const first = await syncReportToStripe(report, options)
  assert.deepEqual(await syncReportToStripe(report, options), first)
  const changed = await syncReportToStripe({ ...report, ...first, price: 2500 }, options)
  assert.equal(changed.stripeProductId, first.stripeProductId)
  assert.notEqual(changed.priceId, first.priceId)
  assert.equal(fake.prices.size, 2)
  assert.equal(fake.products.size, 1)
})
test('changing a slug reuses the stored product ID', async () => {
  const fake = stripe(), options = { secret: 'test', fetcher: fake.fetcher }
  const first = await syncReportToStripe(report, options)
  assert.deepEqual(await syncReportToStripe({ ...report, ...first, slug: 'new-slug' }, options), first)
})
test('rejects invalid prices and absent credentials before any request', async () => {
  for (const price of [0, -1, 0.01, 0.49, NaN, Infinity, 1.005]) await assert.rejects(syncReportToStripe({ ...report, price }, { secret: 'test', fetcher: () => assert.fail('Unexpected request') }))
  await assert.rejects(syncReportToStripe(report, { secret: '' }), /STRIPE_SECRET_KEY/)
})
test('Stripe failures prevent publishing and inactive prices are rejected', async () => {
  await assert.rejects(syncReportToStripe(report, { secret: 'test', fetcher: async () => ({ ok: false, status: 401, json: async () => ({ error: { message: 'Invalid credentials' } }) }) }), /Invalid credentials/)
  const fake = stripe(), options = { secret: 'test', fetcher: fake.fetcher }
  const first = await syncReportToStripe(report, options)
  fake.prices.get(first.priceId).active = false
  await assert.rejects(syncReportToStripe(report, options), /inactive/)
})

test('Payload publication hook protects Stripe IDs and synchronizes partial updates', async () => {
  const fs = await import('node:fs')
  const vm = await import('node:vm')
  const ts = (await import('typescript')).default
  const source = fs.readFileSync(new URL('../src/collections/Reports.ts', import.meta.url), 'utf8')
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const exports = {}, synced = []
  vm.runInNewContext(code, { exports, Date, require: (name) => name === 'payload' ? { APIError: Error } : { syncReportToStripe: async data => { synced.push(data); return { stripeProductId: 'prod_stored', priceId: 'price_new' } } } })
  const hook = exports.Reports.hooks.beforeChange[0]
  const originalDoc = { ...report, cover: 1, downloadFile: 2, access: 'Premium', _status: 'published', stripeProductId: 'prod_stored', priceId: 'price_old' }
  const updated = await hook({ originalDoc, data: { price: 2500, stripeProductId: 'prod_injected', priceId: 'price_injected' } })
  assert.equal(synced[0].stripeProductId, 'prod_stored')
  assert.equal(updated.priceId, 'price_new')
  const draft = await hook({ originalDoc, data: { _status: 'draft', price: 999 } })
  assert.equal(draft.priceId, 'price_old')
  assert.equal(synced.length, 1)
  await assert.rejects(hook({ originalDoc: {}, data: { ...originalDoc, downloadFile: null } }), /Upload the paid report/)
  const publicRead = exports.Reports.access.read({ req: {} })
  assert.equal(publicRead._status.equals, 'published')
  assert.equal(exports.Reports.access.create({ req: {} }), false)
})


test('minimum USD report price synchronizes as 50 cents', async () => {
  const fake = stripe()
  const result = await syncReportToStripe({ ...report, price: 0.50 }, { secret: 'test', fetcher: fake.fetcher })
  assert.equal(fake.prices.get(result.priceId).unit_amount, 50)
})
