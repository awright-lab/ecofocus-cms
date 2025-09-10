import type { PayloadRequest } from 'payload'
import { createHmac } from 'crypto'

export const verifyPreviewToken = (req?: PayloadRequest): boolean => {
  try {
    if (!req) return false
    const anyReq = req as any
    const q = anyReq?.query as any
    const b = anyReq?.body as any
    const draft = (q?.draft ?? (typeof b === 'object' ? b?.draft : undefined)) as string | undefined
    const token = (q?.previewToken ?? (typeof b === 'object' ? b?.previewToken : undefined)) as string | undefined
    if (!draft || String(draft) !== 'true' || !token) return false
    const secret = process.env.PREVIEW_SECRET || process.env.PAYLOAD_SECRET || ''
    if (!secret) return false
    const [data, sig] = token.split('.')
    if (!data || !sig) return false
    const expected = createHmac('sha256', secret).update(data).digest('base64url')
    if (expected !== sig) return false
    const parsed = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8')) as { exp: number }
    if (!parsed?.exp || Date.now() > parsed.exp) return false
    return true
  } catch {
    return false
  }
}
