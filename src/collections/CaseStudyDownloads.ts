import { createHash, timingSafeEqual } from 'node:crypto'
import { exportCaseStudyDownloads } from '../lib/caseStudyDownloadsCsv'
import type { Access, CollectionConfig } from 'payload'

export const downloadAdmin: Access = ({ req }) => (req.user as { role?: string } | null)?.role === 'admin'
export const recordDownload: Access = ({ req }) => {
  const expected = process.env.CASE_STUDY_DOWNLOADS_API_KEY
  const supplied = req.headers.get('x-case-study-download-key')
  if (!expected || !supplied) return false
  const digest = (value: string) => createHash('sha256').update(value).digest()
  return timingSafeEqual(digest(expected), digest(supplied))
}

export const CaseStudyDownloads: CollectionConfig = {
  slug: 'case-study-downloads',
  labels: { singular: 'Case Study Download', plural: 'Case Study Downloads' },
  admin: {
    useAsTitle: 'email', group: 'Research',
    defaultColumns: ['firstName', 'lastName', 'email', 'caseStudy', 'createdAt'],
    description: 'PDF download requests only. These records do not subscribe anyone to marketing. Repeat requests are recorded separately.',
    components: { beforeListTable: [{ path: 'src/ui/admin/CaseStudyDownloadsExport.tsx' }] },
    hidden: ({ user }) => user?.role !== 'admin',
  },
  endpoints: [{ path: '/export-csv', method: 'get', handler: exportCaseStudyDownloads }],
  access: { read: downloadAdmin, create: recordDownload, update: () => false, delete: downloadAdmin },
  // Disable editing locks for the append-only log. Payload still includes this
  // collection in its shared polymorphic relationship schema.
  lockDocuments: false,
  timestamps: true,
  fields: [
    { name: 'firstName', type: 'text', required: true, maxLength: 80 },
    { name: 'lastName', type: 'text', required: true, maxLength: 80 },
    { name: 'email', type: 'email', required: true, index: true },
    { name: 'caseStudy', type: 'text', required: true, index: true, defaultValue: 'glass-packaging-institute-2026', validate: (value: unknown) => value === 'glass-packaging-institute-2026' || 'Unknown case study' },
  ],
}
