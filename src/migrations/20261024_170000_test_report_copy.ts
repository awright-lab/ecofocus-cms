import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

const original = {
  title: 'Test',
  subtitle: 'Testing',
  description: 'This is a test description for the EcoFocus sustainability report, providing a concise overview of the key findings and data analysis included in this document.',
  body: 'Provide a comprehensive executive summary of the report, highlighting key findings, the primary sustainability data analyzed, and the strategic implications for industry stakeholders.',
}
const updated = {
  title: 'Glass Packaging & Consumer Choice — Test Report',
  subtitle: 'Turning consumer evidence into a stronger business conversation.',
  description: 'Explore how EcoFocus helped the Glass Packaging Institute understand consumer perspectives on glass packaging and translate that evidence into a clearer story for its members, brands, and policymakers.',
  body: 'Packaging decisions connect consumer expectations with business priorities. This case study looks at how the Glass Packaging Institute worked with EcoFocus to build a clearer understanding of the attitudes and preferences surrounding glass packaging.\n\nThe EcoFocus approach combined consumer research with custom questions for GPI, exploring packaging preferences, brand associations, and the role packaging plays in purchase decisions. The case study explains the business need and the research approach behind that work.\n\nFor brand, packaging, and sustainability teams, the material offers a practical example of using consumer evidence to support communications and stakeholder conversations. It illustrates how research can connect the questions an organization needs to answer with a story its audiences can understand.\n\nThis demonstration listing uses the existing GPI case-study material to preview the EcoFocus report store and PDF download experience. It is clearly labeled as a test report; the listed file and price are unchanged.',
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const { docs } = await payload.find({ collection: 'reports', where: { slug: { equals: 'test-report' } }, limit: 1, depth: 0, req })
  const report = docs[0]
  // Never replace editorial changes made since the original test listing.
  if (!report || report.title !== original.title || report.body !== original.body || report.description !== original.description) return
  // Use Payload so version history and Stripe's product description stay in sync.
  await payload.update({ collection: 'reports', id: report.id, data: updated, req })
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  const { docs } = await payload.find({ collection: 'reports', where: { slug: { equals: 'test-report' } }, limit: 1, depth: 0, req })
  const report = docs[0]
  if (!report || report.title !== updated.title || report.body !== updated.body) return
  await payload.update({ collection: 'reports', id: report.id, data: original, req })
}
