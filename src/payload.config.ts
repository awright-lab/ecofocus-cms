import { buildConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
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
          // Optional: folder prefix
          prefix: 'uploads/',
          // Optional: signed URLs for MP4
          signedDownloads: {
            shouldUseSignedURL: ({ filename }) => filename.endsWith('.mp4'),
          },
          // Optional: CDN or custom URL
          generateFileURL: ({ filename }) => {
            if (process.env.CDN_BASE_URL) {
              return `${process.env.CDN_BASE_URL}/${filename}`
            }
            // Default S3 URL fallback
            return `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${filename}`
          },
        },
      },
      bucket: process.env.S3_BUCKET || 'ecofocus-media',
      config: {
        endpoint: process.env.S3_ENDPOINT || 'https://s3.us-west-002.backblazeb2.com',
        region: process.env.S3_REGION || 'us-west-002',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  ],
})
