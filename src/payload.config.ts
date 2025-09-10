import { buildConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { s3Storage } from '@payloadcms/storage-s3'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Authors } from './collections/Authors'
import { Topics } from './collections/Topics'
import { Posts } from './collections/Posts'
import { HeroSection } from './collections/homepage/HeroSection'
import { QuickStats } from './collections/homepage/QuickStats'
import { FeaturedReport } from './collections/homepage/FeaturedReport'
import { DashboardPromo } from './collections/homepage/DashboardPromo'
import { EcoNuggets } from './collections/homepage/EcoNuggets'
import { WhyChoose } from './collections/homepage/WhyChoose'
import { TrustedBy } from './collections/homepage/TrustedBy'
import { CTABanner } from './collections/homepage/CTABanner'
import { ApiKeys } from './collections/ApiKeys'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Debug for Render deployment
console.log('==============================')
console.log('DEBUG: Environment Variables')
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'MISSING')
console.log('PAYLOAD_SECRET:', process.env.PAYLOAD_SECRET ? 'SET' : 'MISSING')
console.log('Cloudflare Config:', {
  bucket: process.env.S3_BUCKET || '(missing)',
  endpoint: process.env.S3_ENDPOINT || '(missing)',
  region: process.env.S3_REGION || '(missing)',
  accessKeyId: !!process.env.S3_ACCESS_KEY_ID,
  secretKey: !!process.env.S3_SECRET_ACCESS_KEY,
})
console.log('==============================')

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing. Check your Render environment variables.')
}

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  cors: [
    'https://ecofocusresearch.netlify.app',
    'http://localhost:3000',
  ],
  csrf: [
    'https://ecofocusresearch.netlify.app',
    'http://localhost:3000',
  ],
  defaultDepth: 2,
  collections: [
    Users,
    Media,
    Authors,
    Topics,
    Posts,
    HeroSection,
    QuickStats,
    FeaturedReport,
    DashboardPromo,
    EcoNuggets,
    WhyChoose,
    TrustedBy,
    CTABanner,
    ApiKeys,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      ssl: { rejectUnauthorized: false },
    },
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  endpoints: ([
    {
      path: '/preview-token',
      method: 'post',
      handler: (async (req, res, _next, _ctx) => {
        try {
          const secret = process.env.PREVIEW_SECRET || process.env.PAYLOAD_SECRET || ''
          if (!secret) {
            return res.status(500).json({ error: 'Missing PREVIEW_SECRET' })
          }
          const exp = Date.now() + 5 * 60 * 1000 // 5 minutes
          const payload = { exp, sub: 'preview' }
          const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
          const crypto = await import('crypto')
          const signature = crypto
            .createHmac('sha256', secret)
            .update(data)
            .digest('base64url')
          const token = `${data}.${signature}`
          return res.status(200).json({ token, exp })
        } catch (_e) {
          return res.status(500).json({ error: 'Failed to create token' })
        }
      }) as unknown as any,
    },
  ] as unknown as any),
  plugins: [
    payloadCloudPlugin(),
    s3Storage({
      collections: {
        media: {
          disableLocalStorage: true,
          generateFileURL: ({ filename }) => {
            const base = process.env.S3_PUBLIC_BASE_URL
            if (base) return `${base.replace(/\/+$/, '')}/${filename}`
            const endpoint = (process.env.S3_ENDPOINT || '').replace(/^https?:\/\//, '').replace(/\/+$/, '')
            const bucket = (process.env.S3_BUCKET || '').replace(/\/+$/, '')
            return `https://${endpoint}/${bucket}/${filename}`
          },
        },
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        endpoint: process.env.S3_ENDPOINT || '',
        region: process.env.S3_REGION || 'auto',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        forcePathStyle: true, // Required for Cloudflare R2
      },
    }),
  ],
})
