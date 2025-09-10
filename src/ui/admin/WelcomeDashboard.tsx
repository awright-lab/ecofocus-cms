import * as React from 'react'
import Link from 'next/link'

const Card: React.FC<React.PropsWithChildren<{ title: string }>> = ({ title, children }) => (
  <div style={{
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: 8,
    padding: 16,
    background: 'var(--theme-elevation-0)',
  }}>
    <h3 style={{ marginTop: 0 }}>{title}</h3>
    <div>{children}</div>
  </div>
)

const WelcomeDashboard: React.FC = () => {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Card title="Welcome to EcoFocus CMS">
        <p style={{ margin: 0 }}>Create posts, manage authors, and organize topics.</p>
      </Card>
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        <Card title="Quick Actions">
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li><Link href="/admin/collections/posts/create">Create a Post</Link></li>
            <li><Link href="/admin/collections/authors">Manage Authors</Link></li>
            <li><Link href="/admin/collections/topics">Manage Topics</Link></li>
            <li><Link href="/admin/collections/media">Upload Media</Link></li>
          </ul>
        </Card>
        <Card title="Helpful Links">
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li><a href="https://ecofocusresearch.netlify.app" target="_blank" rel="noreferrer">View Website</a></li>
            <li><a href="https://payloadcms.com/docs" target="_blank" rel="noreferrer">Payload Docs</a></li>
          </ul>
        </Card>
      </div>
    </div>
  )
}

export default WelcomeDashboard

