import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

const filename = 'environmental-sustainability-and-the-workforce-cover-v6-1.webp'
const expectedHash = '1b6e3862865c21eca24410525bf88cd3fc49a1976c84b30dcd399908120c183b'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const existing = await payload.find({ collection: 'media', where: { filename: { equals: filename } }, limit: 1, depth: 0, req })
  let media = existing.docs[0]
  if (!media) {
    const data = await readFile(resolve(process.cwd(), 'src/assets/workforce-cover-v6-1.webp'))
    if (createHash('sha256').update(data).digest('hex') !== expectedHash) throw new Error('Workforce v6.1 cover did not match the approved asset.')
    media = await payload.create({
      collection: 'media',
      data: { alt: 'Environmental Sustainability and the Workforce report cover, version 6.1', altText: 'Environmental Sustainability and the Workforce report cover, version 6.1' },
      file: { data, name: filename, mimetype: 'image/webp', size: data.length },
      req,
    })
  }
  const reports = await payload.find({ collection: 'reports', where: { slug: { equals: 'environmental-sustainability-and-the-workforce' } }, draft: true, limit: 1, depth: 0, req })
  const report = reports.docs[0]
  if (report && report.cover !== media.id) {
    await payload.update({ collection: 'reports', id: report.id, data: { cover: media.id }, draft: report._status === 'draft', req })
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Preserve editorial media and cover choices if application code is rolled back.
}
