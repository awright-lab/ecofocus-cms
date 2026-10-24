import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
const code = ts.transpileModule(fs.readFileSync(new URL('../src/migrations/20261024_170000_test_report_copy.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
const exports = {}; vm.runInNewContext(code, { exports })
const report = { id: 1, title: 'Test', subtitle: 'Testing', description: 'This is a test description for the EcoFocus sustainability report, providing a concise overview of the key findings and data analysis included in this document.', body: 'Provide a comprehensive executive summary of the report, highlighting key findings, the primary sustainability data analyzed, and the strategic implications for industry stakeholders.' }

test('test copy update uses Payload and preserves price, file and slug', async () => {
  let updated
  const req = {}
  const payload = { find: async () => ({ docs: [report] }), update: async args => { updated = args } }
  await exports.up({ payload, req })
  assert.equal(updated.id, 1)
  assert.equal(updated.req, req)
  assert.deepEqual(Object.keys(updated.data).sort(), ['body', 'description', 'subtitle', 'title'])
  assert.match(updated.data.title, /Test Report/)
  assert.ok(updated.data.body.length > 700)
  let rollback
  payload.find = async () => ({ docs: [{ ...report, ...updated.data }] })
  payload.update = async args => { rollback = args }
  await exports.down({ payload, req })
  assert.equal(rollback.data.title, 'Test')
})
test('migration skips missing listings and existing editorial changes', async () => {
  for (const docs of [[], [{ ...report, title: 'Edited by user' }], [{ ...report, body: 'New content' }]]) {
    await exports.up({ payload: { find: async () => ({ docs }), update: async () => assert.fail('Must preserve editorial changes') }, req: {} })
  }
})
