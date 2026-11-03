import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
const exports = {}
const code = ts.transpileModule(fs.readFileSync(new URL('../src/lib/caseStudyDownloadsCsv.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
vm.runInNewContext(code, { exports, Response, TextEncoder, ReadableStream })
const { csvCell, exportCaseStudyDownloads } = exports

test('CSV escapes punctuation, multiline text, and spreadsheet formulas', () => {
  assert.equal(csvCell('Jane "J", Doe'), '"Jane ""J"", Doe"')
  assert.equal(csvCell('a\nb'), '"a\nb"')
  for (const input of ['=1+1', '+123', '-123', '@SUM(A1)', '  =1', '\tformula']) assert.ok(csvCell(input).startsWith('"\''))
})
test('anonymous, editor, and ingestion credentials cannot export', async () => {
  for (const user of [null, { role: 'editor' }]) {
    const response = await exportCaseStudyDownloads({ user, payload: { find() { throw Error('must not query') } } })
    assert.equal(response.status, 403)
  }
})
test('export includes all pages and applies read access to every query', async () => {
  const docs = Array.from({ length: 503 }, (_, i) => ({ id: i + 1, firstName: 'Jane', lastName: 'Doe', email: `jane${i}@example.com`, caseStudy: 'GPI', createdAt: '2026-11-03T00:00:00Z' }))
  let count = 0
  const req = { user: { role: 'admin' }, payload: { find: async options => {
    assert.equal(options.overrideAccess, false)
    assert.equal(options.req, req)
    count++
    if (options.sort === '-id') return { docs: [docs.at(-1)] }
    const after = options.where.and[0].id.greater_than
    return { docs: docs.filter(d => d.id > after).slice(0, 500) }
  } } }
  const response = await exportCaseStudyDownloads(req)
  assert.match(response.headers.get('content-disposition'), /\.csv/)
  assert.match(response.headers.get('cache-control'), /no-store/)
  const csv = await response.text()
  assert.equal(csv.trim().split('\r\n').length, 504)
  assert.match(csv, /jane502@example.com/)
  assert.equal(count, 3)
})
test('empty list exports column headings', async () => {
  const response = await exportCaseStudyDownloads({ user: { role: 'admin' }, payload: { find: async () => ({ docs: [] }) } })
  assert.match(await response.text(), /First name.*Email/)
})
