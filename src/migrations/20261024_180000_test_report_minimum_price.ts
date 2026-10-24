import type { MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const { docs } = await payload.find({ collection: 'reports', where: { slug: { equals: 'test-report' } }, limit: 1, depth: 0, req })
  const report = docs[0]
  // The user approved raising this one-cent demonstration listing to $0.50.
  // Preserve any different price entered by an editor since that approval.
  if (!report || report.access !== 'Premium' || report.price !== 0.01) return
  await payload.update({ collection: 'reports', id: report.id, data: { price: 0.50 }, req })
}

export async function down(): Promise<void> {
  // Retain the valid price: restoring $0.01 would break card checkout again.
}
