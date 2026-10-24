import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

const previous = 'This demonstration listing uses the existing GPI case-study material to preview the EcoFocus report store and PDF download experience. It is clearly labeled as a test report; the listed file and price are unchanged.'
const revised = 'This demonstration listing uses the existing GPI case-study material to preview the EcoFocus report store and PDF download experience. Explore the case study to see how consumer research can inform a clearer packaging story.'

async function replaceNote({ payload, req }: MigrateUpArgs | MigrateDownArgs, from: string, to: string): Promise<void> {
  const { docs } = await payload.find({ collection: 'reports', where: { slug: { equals: 'test-report' } }, limit: 1, depth: 0, req })
  const report = docs[0]
  if (!report || report.title !== 'Glass Packaging & Consumer Choice — Test Report' || !report.body?.endsWith(from)) return
  await payload.update({ collection: 'reports', id: report.id, data: { body: report.body.slice(0, -from.length) + to }, req })
}
export async function up(args: MigrateUpArgs): Promise<void> { await replaceNote(args, previous, revised) }
export async function down(args: MigrateDownArgs): Promise<void> { await replaceNote(args, revised, previous) }
