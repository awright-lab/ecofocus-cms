import { buildConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import cloudStorage from '@payloadcms/plugin-cloud-storage'

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
    cloudStorage({
      collections: {
        media: {
          adapter: 's3', // ✅ Using S3 adapter for Backblaze B2
          config: {
            endpoint: process.env.S3_ENDPOINT || 'https://s3.us-west-002.backblazeb2.com', // Backblaze endpoint
            credentials: {
              accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
            },
            region: process.env.S3_REGION || 'us-west-002',
            bucket: process.env.S3_BUCKET || 'ecofocus-media',
          },
          baseUrl: process.env.CDN_BASE_URL || undefined, // ✅ Optional Cloudflare CDN URL
        },
      },
    }),
  ],
})
