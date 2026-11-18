import Link from 'next/link'
import type { CollectionSlug, ServerProps, Where } from 'payload'

type Props = Pick<ServerProps, 'payload' | 'permissions' | 'user'>
const groups: { title: string; description: string; links: { slug: CollectionSlug; label: string }[] }[] = [
  { title: 'Reports & Sales', description: 'Publish research and keep track of the people buying it.', links: [
    { slug: 'reports', label: 'Research reports' }, { slug: 'report-orders', label: 'Report orders' }, { slug: 'report-files', label: 'Private report files' }, { slug: 'case-study-downloads', label: 'Case study downloads' },
  ] },
  { title: 'Website Content', description: 'Share the ideas, evidence, and stories behind EcoFocus.', links: [
    { slug: 'posts', label: 'Articles & insights' }, { slug: 'authors', label: 'Authors' }, { slug: 'topics', label: 'Topics' }, { slug: 'datasets', label: 'Research datasets' },
  ] },
  { title: 'Media', description: 'Manage public covers and website images.', links: [{ slug: 'media', label: 'Media library' }] },
  { title: 'Administration', description: 'Manage your team and connected services.', links: [{ slug: 'users', label: 'Team members' }, { slug: 'api-keys', label: 'API keys' }] },
]
const homepage: { slug: CollectionSlug; label: string }[] = [
  { slug: 'hero-section', label: 'Hero section' }, { slug: 'quick-stats', label: 'Quick stats' }, { slug: 'featured-report', label: 'Featured report' }, { slug: 'dashboard-promo', label: 'Dashboard promotion' },
  { slug: 'eco-nuggets', label: 'EcoNuggets' }, { slug: 'why-choose', label: 'Why EcoFocus' }, { slug: 'trusted-by', label: 'Trusted by' }, { slug: 'cta-banner', label: 'Contact banner' },
]

export default async function WelcomeDashboard({ payload, permissions, user }: Props) {
  if (!user) return null
  const canRead = (slug: CollectionSlug) => Boolean(permissions?.collections?.[slug]?.read)
  const canCreate = (slug: CollectionSlug) => Boolean(permissions?.collections?.[slug]?.create)
  const count = async (collection: CollectionSlug, where: Where) => {
    if (!canRead(collection)) return null
    try { return (await payload.count({ collection, where, overrideAccess: false, user })).totalDocs }
    catch { payload.logger.warn(`Workspace count unavailable for ${collection}.`); return null }
  }
  const [reports, orders, drafts, recentOrders] = await Promise.all([
    count('reports', { _status: { equals: 'published' } }),
    count('report-orders', { livemode: { equals: true } }),
    count('posts', { _status: { equals: 'draft' } }),
    canRead('report-orders') ? payload.find({ collection: 'report-orders', where: { livemode: { equals: true } }, limit: 5, depth: 0, sort: '-orderDate', overrideAccess: false, user }).then(r => r.docs).catch(() => null) : null,
  ])
  const stats = [
    { slug: 'reports' as const, label: 'Published reports', value: reports },
    { slug: 'report-orders' as const, label: 'Live report orders', value: orders },
    { slug: 'posts' as const, label: 'Draft articles', value: drafts },
  ]
  return <div className="ef-workspace">
    <header className="ef-workspace-hero">
      <div><p className="ef-eyebrow">ECOFOCUS CONTENT &amp; REPORTS</p><h1>Your EcoFocus workspace.</h1><p>Publish research, manage report sales,<br className="ef-desktop-break" /> and keep your website moving forward.</p></div>
      <div className="ef-hero-actions">
        {canCreate('reports') && <Link className="ef-button ef-button--gold" href="/admin/collections/reports/create">Add a report <span aria-hidden="true">↗</span></Link>}
        <a className="ef-hero-site" href="https://ecofocusresearch.com" target="_blank" rel="noopener noreferrer">View website <span aria-hidden="true">↗</span><span className="ef-sr-only"> (opens in a new tab)</span></a>
      </div>
    </header>
    <section className="ef-stats" aria-label="Workspace at a glance">{stats.filter(stat => canRead(stat.slug)).map(stat => <Link key={stat.slug} className="ef-stat" href={`/admin/collections/${stat.slug}`}><span>{stat.label}</span><strong>{stat.value === null ? '—' : stat.value.toLocaleString('en-US')}</strong><small>{stat.value === null ? 'Open collection to check availability' : 'Open collection'} <span aria-hidden="true">↗</span></small></Link>)}</section>
    <div className="ef-section-heading"><div><p className="ef-eyebrow">MAKE YOUR NEXT MOVE</p><h2>What are you working on?</h2></div>{canCreate('posts') && <Link className="ef-text-link" href="/admin/collections/posts/create">Create an article <span aria-hidden="true">↗</span></Link>}</div>
    <section className="ef-task-grid" aria-label="Workspace tools">{groups.map(group => {
      const links = group.links.filter(link => canRead(link.slug))
      if (!links.length) return null
      return <article className="ef-tool-card" key={group.title}><h3>{group.title}</h3><p>{group.description}</p><ul>{links.map(link => <li key={link.slug}><Link href={`/admin/collections/${link.slug}`}>{link.label}<span aria-hidden="true">↗</span></Link></li>)}</ul></article>
    })}</section>
    {canRead('report-orders') && <section className="ef-panel ef-orders-panel" aria-labelledby="ef-orders-heading">
      <div className="ef-section-heading"><div><p className="ef-eyebrow">REPORT SALES</p><h2 id="ef-orders-heading">Recent orders</h2></div><Link className="ef-text-link" href="/admin/collections/report-orders">View all orders <span aria-hidden="true">↗</span></Link></div>
      {recentOrders === null ? <p>Orders are temporarily unavailable. Open Report Orders to try again.</p> : recentOrders.length ? <ul className="ef-recent-orders">{recentOrders.map(order => <li key={order.id}><Link href={`/admin/collections/report-orders/${order.id}`}><span><strong>{order.buyerName || order.buyerEmail || order.orderReference}</strong><small>{order.reportsSummary}</small></span><span className="ef-order-total">{order.paidTotal}<small>{order.paymentStatus === 'partially_refunded' ? 'Partially refunded' : order.paymentStatus === 'refunded' ? 'Refunded' : 'Paid'}</small></span></Link></li>)}</ul> : <div className="ef-empty"><h3>Your report orders will appear here.</h3><p>Confirmed purchases are added automatically after payment.</p></div>}
    </section>}
    {homepage.some(link => canRead(link.slug)) && <section className="ef-panel" aria-labelledby="ef-homepage-heading"><div className="ef-section-heading"><div><p className="ef-eyebrow">YOUR FRONT DOOR</p><h2 id="ef-homepage-heading">Homepage sections</h2></div></div><div className="ef-homepage-links">{homepage.filter(link => canRead(link.slug)).map(link => <Link key={link.slug} href={`/admin/collections/${link.slug}`}>{link.label}<span aria-hidden="true">↗</span></Link>)}</div></section>}
    {canCreate('posts') && <div className="ef-workspace-footer"><p>Working with a newsletter template?</p><Link href="/admin/stripo-import">Import Stripo HTML <span aria-hidden="true">↗</span></Link></div>}
  </div>
}
