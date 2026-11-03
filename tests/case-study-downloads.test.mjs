import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

test('Payload log denies anonymous/editor reads and permits only the scoped server key to create', async () => {
  const crypto = await import('node:crypto');
  const code = ts.transpileModule(fs.readFileSync(new URL('../src/collections/CaseStudyDownloads.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  const env = { CASE_STUDY_DOWNLOADS_API_KEY: 'test-secret' };
  vm.runInNewContext(code, { exports, require: name => { if (name === '../lib/caseStudyDownloadsCsv') return { exportCaseStudyDownloads() {} }; assert.equal(name, 'node:crypto'); return crypto; }, process: { env } });
  const access = exports.CaseStudyDownloads.access;
  const req = (role, key) => ({ req: { user: role ? { role } : null, headers: new Headers(key ? { 'x-case-study-download-key': key } : {}) } });
  assert.equal(access.read(req()), false);
  assert.equal(access.read(req('editor')), false);
  assert.equal(access.read(req('admin')), true);
  assert.equal(access.read(req(null, 'test-secret')), false);
  assert.equal(access.create(req()), false);
  assert.equal(access.create(req('admin')), false);
  assert.equal(access.create(req(null, 'wrong')), false);
  assert.equal(access.create(req(null, 'test-secret')), true);
  assert.equal(access.update(req('admin')), false);
  assert.equal(access.delete(req('editor')), false);
  assert.equal(access.delete(req('admin')), true);
  delete env.CASE_STUDY_DOWNLOADS_API_KEY;
  assert.equal(access.create(req(null, 'test-secret')), false);
});
