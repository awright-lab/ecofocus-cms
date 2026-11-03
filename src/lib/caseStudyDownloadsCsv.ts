import type { PayloadHandler } from 'payload'

// Quote every cell and prevent contact data from becoming spreadsheet formulas.
export function csvCell(value: unknown): string {
  let text = String(value ?? '')
  if (/^[\s\uFEFF]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

export const exportCaseStudyDownloads: PayloadHandler = async (req) => {
  if ((req.user as { role?: string } | null)?.role !== 'admin') {
    return new Response('Forbidden', { status: 403, headers: { 'Cache-Control': 'no-store' } })
  }
  const encoder = new TextEncoder()
  // An ID boundary excludes new submissions arriving while this export runs.
  const latest = await req.payload.find({ collection: 'case-study-downloads', limit: 1, sort: '-id', depth: 0, overrideAccess: false, req })
  const maxID = latest.docs[0]?.id
  let cursor = 0
  let first = true
  const stream = new ReadableStream({
    async pull(controller) {
      try {
        if (first) {
          controller.enqueue(encoder.encode('\uFEFF' + ['First name', 'Last name', 'Email', 'Case study', 'Requested at (UTC)'].map(csvCell).join(',') + '\r\n'))
          first = false
        }
        if (maxID === undefined) { controller.close(); return }
        const batch = await req.payload.find({
          collection: 'case-study-downloads', limit: 500, sort: 'id', depth: 0,
          where: { and: [{ id: { greater_than: cursor } }, { id: { less_than_equal: maxID } }] },
          overrideAccess: false, req,
        })
        for (const doc of batch.docs) {
          controller.enqueue(encoder.encode([doc.firstName, doc.lastName, doc.email, doc.caseStudy, doc.createdAt].map(csvCell).join(',') + '\r\n'))
          cursor = Number(doc.id)
        }
        if (batch.docs.length < 500 || cursor >= Number(maxID)) controller.close()
      } catch (error) { controller.error(error) }
    },
  })
  return new Response(stream, { headers: {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="case-study-downloads-${new Date().toISOString().slice(0, 10)}.csv"`,
    'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff',
  } })
}
