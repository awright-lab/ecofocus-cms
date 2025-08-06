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
  cors: [
    'https://ecofocusresearch.netlify.app',
    'http://localhost:3000',
    'https://ecofocus-cms.onrender.com',
  ],
  csrf: [
    'https://ecofocusresearch.netlify.app',
    'http://localhost:3000',
    'https://ecofocus-cms.onrender.com',
  ],
  collections: [
    Users,
    Media,
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
  plugins: [
    payloadCloudPlugin(),
    s3Storage({
      collections: {
        media: {
          generateFileURL: ({ filename }) => {
            return `https://pub-3816c55026314a19bf7805556b182cb0.r2.dev/${filename}` // Your public R2 bucket URL
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
