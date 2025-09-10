import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'
import { fileURLToPath } from 'url'

import config from '@/payload.config'
import './styles.css'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`

  return (
    <div className="home" style={{
      background: 'linear-gradient(135deg, #f3fbf7 0%, #e8f7f0 100%)',
    }}>
      <div className="content">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Image alt="EcoFocus Logo" src="/ecofocus-logo.svg" width={160} height={36} />
        </div>
        <p style={{ marginTop: 8, color: '#176342' }}>
          Manage authors, topics, and posts for EcoFocus Research.
        </p>
        {user ? (
          <p>Signed in as {user.email}</p>
        ) : (
          <p>You are not signed in.</p>
        )}
        <div className="links">
          <a
            className="admin"
            href={payloadConfig.routes.admin}
            rel="noopener noreferrer"
            target="_blank"
          >
            Open Admin
          </a>
          <a
            className="docs"
            href="https://ecofocusresearch.netlify.app"
            rel="noopener noreferrer"
            target="_blank"
          >
            View Website
          </a>
        </div>
      </div>
      <div className="footer">
        <p>Update this page by editing</p>
        <a className="codeLink" href={fileURL}>
          <code>app/(frontend)/page.tsx</code>
        </a>
      </div>
    </div>
  )
}
