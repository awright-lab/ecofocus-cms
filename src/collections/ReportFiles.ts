import { APIError, type CollectionConfig } from 'payload'

const authenticated = ({ req }: { req: { user?: unknown } }) => Boolean(req.user)

export const ReportFiles: CollectionConfig = {
  slug: 'report-files',
  admin: { useAsTitle: 'label', group: 'Store', description: 'Private purchased files. Requires a private REPORTS_S3_BUCKET.' },
  access: { read: authenticated, create: authenticated, update: authenticated, delete: authenticated },
  upload: { mimeTypes: ['application/pdf', 'application/zip'], disableLocalStorage: true },
  hooks: { beforeOperation: [({ operation }) => {
    if (['create', 'update'].includes(operation) && (!process.env.REPORTS_S3_BUCKET || process.env.REPORTS_S3_BUCKET === process.env.S3_BUCKET)) {
      throw new APIError('Configure a private REPORTS_S3_BUCKET before uploading paid reports.', 400)
    }
  }] },
  fields: [{ name: 'label', type: 'text', required: true }],
}
