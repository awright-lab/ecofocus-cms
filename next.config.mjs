import { withPayload } from '@payloadcms/next/withPayload'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    // ✅ Add these aliases for Next.js build on Render
    webpackConfig.resolve.alias['@payload-config'] = path.resolve(
      __dirname,
      'src/payload.config.ts',
    )
    webpackConfig.resolve.alias['@'] = path.resolve(__dirname, 'src')

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
