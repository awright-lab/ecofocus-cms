import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const { docs } = await payload.find({ collection: 'reports', where: { slug: { equals: 'test-report' } }, draft: true, depth: 0, limit: 1, req })
  const report = docs[0]
  if (!report || report._status !== 'published') return
  // Unpublish without deleting the record, file, or Stripe references used by past orders.
  await payload.update({ collection: 'reports', id: report.id, data: { _status: 'draft' }, draft: false, req })
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Do not automatically restore a retired public listing.
}
