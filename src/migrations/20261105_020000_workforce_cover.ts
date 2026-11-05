import { createHash } from 'node:crypto'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

const filename = 'environmental-sustainability-and-the-workforce-cover.png'
const source = 'https://6aebde36ed143c09a69fb2fd--ecofocusresearch.netlify.app/images/employment-report-cover.png'
const expectedHash = 'ca8f23af70b259955abba69a644223905727c929a1665cbfea2b53087d679af4'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const existing = await payload.find({ collection: 'media', where: { filename: { equals: filename } }, limit: 1, depth: 0, req })
  if (existing.docs.length) return

  const response = await fetch(source, { signal: AbortSignal.timeout(30000) })
  if (!response.ok) throw new Error(`Workforce cover import failed: HTTP ${response.status}`)
  const data = Buffer.from(await response.arrayBuffer())
  if (createHash('sha256').update(data).digest('hex') !== expectedHash) throw new Error('Workforce cover content did not match the approved image.')

  // Use Payload's upload pipeline so the Media row and public R2 object agree.
  await payload.create({
    collection: 'media',
    data: { alt: 'Environmental Sustainability and the Workforce report cover', altText: 'Environmental Sustainability and the Workforce report cover' },
    file: { data, name: filename, mimetype: 'image/png', size: data.length },
    req,
  })
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Uploaded editorial assets may have been reused. Keep the image on rollback.
}
