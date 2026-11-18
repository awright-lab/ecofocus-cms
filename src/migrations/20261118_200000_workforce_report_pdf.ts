import { createDecipheriv, createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

const filename = 'EcoFocus-Environmental-Sustainability-and-the-Workforce-2026.pdf'
const expectedHash = '1173e3c2a5b376794a0b623a885da08fba3b7a91a0c99b2182bffa533b833855'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const files = await payload.find({ collection: 'report-files', where: { filename: { equals: filename } }, limit: 1, depth: 0, req })
  let file = files.docs[0]
  if (!file) {
    const key = Buffer.from(process.env.WORKFORCE_REPORT_IMPORT_KEY || '', 'base64')
    if (key.length !== 32) throw new Error('Configure the temporary workforce PDF import key before this migration.')
    // The repository is public. Only authenticated ciphertext is stored here;
    // its temporary decryption key is supplied separately by the deployment.
    const encrypted = await readFile(resolve(process.cwd(), 'src/assets/workforce-report-2026.pdf.enc'))
    const decipher = createDecipheriv('aes-256-gcm', key, encrypted.subarray(0, 12))
    decipher.setAAD(Buffer.from('ecofocus-workforce-report-2026'))
    decipher.setAuthTag(encrypted.subarray(12, 28))
    const data = Buffer.concat([decipher.update(encrypted.subarray(28)), decipher.final()])
    if (createHash('sha256').update(data).digest('hex') !== expectedHash) throw new Error('Workforce PDF did not match the approved file.')
    file = await payload.create({
      collection: 'report-files', data: { label: 'Environmental Sustainability and the Workforce — November 2026, 65 pages' },
      file: { data, name: filename, mimetype: 'application/pdf', size: data.length }, req,
    })
  }
  const { report: copy } = JSON.parse(await readFile(resolve(process.cwd(), 'src/assets/workforce-report-launch.json'), 'utf8'))
  const reports = await payload.find({ collection: 'reports', where: { slug: { equals: copy.slug } }, draft: true, limit: 1, depth: 0, req })
  const report = reports.docs[0]
  if (report?._status === 'published') return
  const data = { ...copy, _status: 'draft' as const, downloadFile: file.id }
  if (report) await payload.update({ collection: 'reports', id: report.id, data, draft: true, req })
  else await payload.create({ collection: 'reports', data, draft: true, req })
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Never delete purchased report files or undo subsequent editorial changes.
}
