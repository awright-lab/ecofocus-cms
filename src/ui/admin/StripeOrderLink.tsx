'use client'
import { useField } from '@payloadcms/ui'

function Link({ value }: { value: unknown }) {
  if (typeof value !== 'string' || !/^https:\/\/dashboard\.stripe\.com\/(test\/)?(payments|checkout\/sessions)\/[a-zA-Z0-9_]+$/.test(value)) return null
  return <a href={value} target="_blank" rel="noopener noreferrer">View in Stripe ↗</a>
}

export function StripeOrderLinkCell({ cellData }: { cellData?: unknown }) {
  return <Link value={cellData} />
}

export function StripeOrderLinkField({ path }: { path: string }) {
  const { value } = useField<string>({ path })
  return <div style={{ marginBottom: '1.5rem' }}><label className="field-label">Stripe payment</label><div><Link value={value} /></div></div>
}
